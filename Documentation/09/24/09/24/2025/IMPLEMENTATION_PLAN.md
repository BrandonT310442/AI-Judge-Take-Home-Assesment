# AI Judge Backend Implementation Plan

## Current State Analysis

### Completed Frontend Components
- ✅ Dashboard with file upload UI
- ✅ Judge management (CRUD) interface
- ✅ Queue view with judge assignment UI
- ✅ Evaluation runner with progress tracking
- ✅ Results view with filters and statistics
- ✅ Mock data services simulating backend operations

### Required Backend Implementation
- ❌ Supabase integration for data persistence
- ❌ Groq API integration for LLM evaluations
- ❌ JSON parser for submission ingestion
- ❌ Real-time data synchronization
- ❌ API error handling and retry logic

## Phase 1: Supabase Setup & Database Schema

### 1.1 Database Schema Documentation

All SQL queries for database setup will be stored in a single markdown file for easy execution in Supabase SQL editor.

**File: src/database/supabase-schema.sql.md**

This file will contain:
- Table creation queries
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers and functions
- Initial seed data

```sql
-- Sample structure (full queries in supabase-schema.sql.md)
-- 1. Enable UUID extension
-- 2. Create all tables
-- 3. Add indexes
-- 4. Set up RLS policies
-- 5. Create helper functions
-- 6. Add triggers for updated_at
```

The complete SQL schema file should be created at `src/database/supabase-schema.sql.md` with all queries ready to copy-paste into Supabase SQL editor.

### 1.2 Supabase Schema SQL File Structure

**src/database/supabase-schema.sql.md**
```markdown
# Supabase Database Schema for AI Judge

## Instructions
Copy and paste these SQL queries in order into your Supabase SQL editor.

## 1. Enable Extensions
\`\`\`sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
\`\`\`

## 2. Create Tables

### Queues Table
\`\`\`sql
CREATE TABLE queues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  submission_count INTEGER DEFAULT 0
);
\`\`\`

### Submissions Table
\`\`\`sql
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  queue_id TEXT REFERENCES queues(id) ON DELETE CASCADE,
  labeling_task_id TEXT,
  created_at TIMESTAMP,
  questions JSONB NOT NULL,
  answers JSONB NOT NULL
);
\`\`\`

### Judges Table
\`\`\`sql
CREATE TABLE judges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  model_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Judge Assignments Table
\`\`\`sql
CREATE TABLE judge_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id TEXT REFERENCES queues(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  judge_id UUID REFERENCES judges(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(queue_id, question_id, judge_id)
);
\`\`\`

### Evaluations Table
\`\`\`sql
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id TEXT REFERENCES submissions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  judge_id UUID REFERENCES judges(id) ON DELETE SET NULL,
  verdict TEXT CHECK (verdict IN ('pass', 'fail', 'inconclusive')),
  reasoning TEXT,
  execution_time INTEGER,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Evaluation Runs Table
\`\`\`sql
CREATE TABLE evaluation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id TEXT REFERENCES queues(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  status TEXT CHECK (status IN ('running', 'completed', 'failed')),
  total_evaluations INTEGER DEFAULT 0,
  completed_evaluations INTEGER DEFAULT 0,
  failed_evaluations INTEGER DEFAULT 0
);
\`\`\`

## 3. Create Indexes
\`\`\`sql
-- Performance indexes
CREATE INDEX idx_submissions_queue_id ON submissions(queue_id);
CREATE INDEX idx_judge_assignments_queue_id ON judge_assignments(queue_id);
CREATE INDEX idx_judge_assignments_judge_id ON judge_assignments(judge_id);
CREATE INDEX idx_evaluations_submission_id ON evaluations(submission_id);
CREATE INDEX idx_evaluations_judge_id ON evaluations(judge_id);
CREATE INDEX idx_evaluation_runs_queue_id ON evaluation_runs(queue_id);
CREATE INDEX idx_evaluations_verdict ON evaluations(verdict);
CREATE INDEX idx_judges_is_active ON judges(is_active);
\`\`\`

## 4. Create Update Trigger Function
\`\`\`sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
\`\`\`

## 5. Apply Update Trigger to Judges Table
\`\`\`sql
CREATE TRIGGER update_judges_updated_at 
BEFORE UPDATE ON judges 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
\`\`\`

## 6. Row Level Security (RLS) Policies
\`\`\`sql
-- Enable RLS on all tables
ALTER TABLE queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_runs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on auth strategy)
-- For development, allow all operations
CREATE POLICY "Allow all operations on queues" ON queues
    FOR ALL USING (true);
    
CREATE POLICY "Allow all operations on submissions" ON submissions
    FOR ALL USING (true);
    
CREATE POLICY "Allow all operations on judges" ON judges
    FOR ALL USING (true);
    
CREATE POLICY "Allow all operations on judge_assignments" ON judge_assignments
    FOR ALL USING (true);
    
CREATE POLICY "Allow all operations on evaluations" ON evaluations
    FOR ALL USING (true);
    
CREATE POLICY "Allow all operations on evaluation_runs" ON evaluation_runs
    FOR ALL USING (true);
\`\`\`

## 7. Helper Functions
\`\`\`sql
-- Function to get evaluation statistics
CREATE OR REPLACE FUNCTION get_evaluation_stats(p_queue_id TEXT DEFAULT NULL)
RETURNS TABLE (
    total_evaluations BIGINT,
    pass_count BIGINT,
    fail_count BIGINT,
    inconclusive_count BIGINT,
    pass_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_evaluations,
        COUNT(*) FILTER (WHERE e.verdict = 'pass') as pass_count,
        COUNT(*) FILTER (WHERE e.verdict = 'fail') as fail_count,
        COUNT(*) FILTER (WHERE e.verdict = 'inconclusive') as inconclusive_count,
        CASE 
            WHEN COUNT(*) > 0 
            THEN ROUND((COUNT(*) FILTER (WHERE e.verdict = 'pass')::NUMERIC / COUNT(*)) * 100, 2)
            ELSE 0
        END as pass_rate
    FROM evaluations e
    JOIN submissions s ON e.submission_id = s.id
    WHERE p_queue_id IS NULL OR s.queue_id = p_queue_id;
END;
$$ LANGUAGE plpgsql;
\`\`\`

## 8. Initial Seed Data (Optional)
\`\`\`sql
-- Insert sample judge
INSERT INTO judges (name, system_prompt, model_name, is_active) VALUES
('Accuracy Judge', 'Evaluate the accuracy and correctness of answers.', 'gpt-4-turbo-preview', true),
('Reasoning Judge', 'Focus on the quality of reasoning and logical flow.', 'claude-3-opus', true),
('Technical Judge', 'Assess technical accuracy and depth of understanding.', 'gemini-pro', true);
\`\`\`
```

### 1.3 Supabase Service Configuration

```typescript
// src/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Phase 2: LLM Integration with Groq API

### 2.1 Groq Service Implementation

```typescript
// src/services/llm/groqService.ts
import Groq from 'groq-sdk'

class GroqService {
  private client: Groq
  
  constructor() {
    this.client = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY
    })
  }
  
  async evaluateSubmission(params: {
    systemPrompt: string
    question: string
    answer: any
    modelName: string
  }): Promise<{
    verdict: 'pass' | 'fail' | 'inconclusive'
    reasoning: string
  }> {
    // Implementation details below
  }
}
```

### 2.2 Prompt Construction Strategy

Each prompt will be stored in a separate markdown file for better organization and maintainability.

```typescript
// src/services/llm/promptBuilder.ts
import { readPromptTemplate } from '@/utils/promptLoader'

export async function buildEvaluationPrompt(
  judge: Judge,
  question: Question,
  answer: Answer
): Promise<string> {
  // Load base evaluation prompt template
  const baseTemplate = await readPromptTemplate('evaluation-base.md')
  
  // Load question type specific prompt
  const typeTemplate = await readPromptTemplate(`question-types/${question.questionType}.md`)
  
  // Combine templates with data
  return interpolateTemplate(baseTemplate, {
    systemPrompt: judge.systemPrompt,
    questionTypePrompt: typeTemplate,
    question: question.questionText,
    questionType: question.questionType,
    answer: formatAnswer(answer)
  })
}
```

#### Prompt Files Structure
```
src/prompts/
├── evaluation-base.md              # Base evaluation template
├── question-types/
│   ├── single_choice.md           # Single choice specific
│   ├── single_choice_with_reasoning.md
│   ├── multiple_choice.md         # Multiple choice specific
│   └── free_form.md              # Free form specific
├── judges/
│   ├── accuracy-judge.md         # Specific judge prompts
│   ├── reasoning-judge.md
│   └── technical-judge.md
└── error-handling/
    ├── retry-prompt.md           # Retry after error
    └── clarification-prompt.md   # Unclear response
```

#### Sample Prompt Templates

**src/prompts/evaluation-base.md**
```markdown
# AI Judge Evaluation

## System Context
{{systemPrompt}}

## Question Information
- Type: {{questionType}}
- Question: {{question}}

{{questionTypePrompt}}

## User's Answer
{{answer}}

## Evaluation Task
Please evaluate this answer based on the judge's criteria above. Consider:
1. Accuracy and correctness
2. Completeness of the response
3. Clarity and coherence
4. Relevance to the question

## Required Output Format
Respond with a JSON object containing:
- "verdict": One of "pass", "fail", or "inconclusive"
- "reasoning": A brief explanation (2-3 sentences) justifying your verdict

Example:
{
  "verdict": "pass",
  "reasoning": "The answer correctly identifies the key concept and provides accurate supporting details."
}
```

**src/prompts/question-types/single_choice_with_reasoning.md**
```markdown
## Single Choice with Reasoning Evaluation

This is a single-choice question where the user must:
1. Select the correct option
2. Provide reasoning for their choice

### Evaluation Criteria
- Choice accuracy: Is the selected option correct?
- Reasoning quality: Does the reasoning logically support the choice?
- Coherence: Is the explanation clear and well-structured?
```

**src/prompts/question-types/free_form.md**
```markdown
## Free Form Answer Evaluation

This is an open-ended question requiring a detailed response.

### Evaluation Criteria
- Content accuracy and factual correctness
- Depth of understanding demonstrated
- Completeness of the response
- Clarity and organization of ideas
```

### 2.3 Prompt Loader Utility

```typescript
// src/utils/promptLoader.ts
import fs from 'fs/promises'
import path from 'path'

const PROMPTS_DIR = path.join(process.cwd(), 'src/prompts')

export async function readPromptTemplate(templatePath: string): Promise<string> {
  const fullPath = path.join(PROMPTS_DIR, templatePath)
  return await fs.readFile(fullPath, 'utf-8')
}

export function interpolateTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => variables[key] || match
  )
}

// Cache loaded prompts for performance
const promptCache = new Map<string, string>()

export async function getCachedPrompt(templatePath: string): Promise<string> {
  if (!promptCache.has(templatePath)) {
    const content = await readPromptTemplate(templatePath)
    promptCache.set(templatePath, content)
  }
  return promptCache.get(templatePath)!
}
```

## Phase 3: JSON Parser Implementation

### 3.1 Input Validation Schema

```typescript
// src/utils/validators/submissionValidator.ts
import { z } from 'zod'

const QuestionSchema = z.object({
  rev: z.number(),
  data: z.object({
    id: z.string(),
    questionType: z.enum([
      'single_choice',
      'single_choice_with_reasoning',
      'multiple_choice',
      'free_form'
    ]),
    questionText: z.string()
  })
})

const SubmissionSchema = z.object({
  id: z.string(),
  queueId: z.string(),
  labelingTaskId: z.string(),
  createdAt: z.number(),
  questions: z.array(QuestionSchema),
  answers: z.record(z.any())
})

export const SubmissionArraySchema = z.array(SubmissionSchema)
```

### 3.2 Parser Service

```typescript
// src/services/parser/jsonParser.ts
export class JSONParser {
  static async parseSubmissionsFile(file: File): Promise<ParsedSubmissions> {
    const text = await file.text()
    const data = JSON.parse(text)
    
    // Validate against schema
    const validated = SubmissionArraySchema.parse(data)
    
    // Extract unique queues
    const queues = this.extractQueues(validated)
    
    // Process submissions
    const submissions = this.processSubmissions(validated)
    
    return { queues, submissions }
  }
}
```

## Phase 4: Service Layer Architecture

### 4.1 Database Service Interface

```typescript
// src/services/database/supabaseService.ts
export class SupabaseService {
  // Submissions
  async uploadSubmissions(submissions: Submission[]): Promise<void>
  async getSubmissionsByQueue(queueId: string): Promise<Submission[]>
  
  // Judges
  async createJudge(judge: CreateJudgeDTO): Promise<Judge>
  async updateJudge(id: string, updates: UpdateJudgeDTO): Promise<Judge>
  async deleteJudge(id: string): Promise<void>
  async getJudges(): Promise<Judge[]>
  
  // Assignments
  async assignJudges(assignments: JudgeAssignment[]): Promise<void>
  async getAssignmentsByQueue(queueId: string): Promise<JudgeAssignment[]>
  
  // Evaluations
  async createEvaluation(evaluation: CreateEvaluationDTO): Promise<Evaluation>
  async getEvaluations(filters?: EvaluationFilters): Promise<Evaluation[]>
  
  // Runs
  async createEvaluationRun(queueId: string): Promise<EvaluationRun>
  async updateEvaluationRun(id: string, updates: any): Promise<void>
}
```

### 4.2 API Service Layer

```typescript
// src/services/api/index.ts
export class APIService {
  private supabase: SupabaseService
  private groq: GroqService
  private parser: JSONParser
  
  // Main API methods that combine services
  async ingestSubmissions(file: File): Promise<void>
  async runEvaluations(queueId: string): Promise<EvaluationRun>
  async getResultsWithFilters(filters: FilterOptions): Promise<ResultsData>
}
```

## Phase 5: Frontend Integration Updates

### 5.1 Replace Mock Services

```typescript
// Before (Mock)
import { dataService } from '@/services/mockServices'

// After (Real)
import { apiService } from '@/services/api'
```

### 5.2 Update Component Calls

```typescript
// src/pages/Dashboard.tsx
const handleFile = async (file: File) => {
  setUploading(true)
  try {
    // Old: await dataService.uploadSubmissions(data)
    await apiService.ingestSubmissions(file)
    await loadData()
    setUploadSuccess(true)
  } catch (error) {
    setUploadError(error.message)
  } finally {
    setUploading(false)
  }
}
```

### 5.3 Add Environment Configuration

```env
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

## Phase 6: Error Handling & Resilience

### 6.1 API Error Handling

```typescript
// src/utils/errorHandler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
  }
}

export function handleAPIError(error: any): APIError {
  if (error.code === 'RATE_LIMIT') {
    return new APIError('Rate limit exceeded', 'RATE_LIMIT', 429)
  }
  // More error cases...
}
```

### 6.2 Retry Logic

```typescript
// src/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoff?: number
  } = {}
): Promise<T> {
  // Exponential backoff implementation
}
```

## Phase 7: Implementation Timeline

### Day 1: Backend Setup
- [ ] Set up Supabase project
- [ ] Create database schema
- [ ] Configure environment variables
- [ ] Implement Supabase client

### Day 2: Core Services
- [ ] Implement JSON parser
- [ ] Create database service layer
- [ ] Build Groq API integration
- [ ] Test individual services

### Day 3: API Integration
- [ ] Connect all services
- [ ] Implement evaluation runner
- [ ] Add error handling
- [ ] Test end-to-end flow

### Day 4: Frontend Updates
- [ ] Replace mock services
- [ ] Update all API calls
- [ ] Add loading states
- [ ] Handle errors in UI

### Day 5: Testing & Polish
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Demo preparation

## Phase 8: Testing Strategy

### 8.1 Unit Tests
```typescript
// src/services/__tests__/jsonParser.test.ts
describe('JSONParser', () => {
  it('should parse valid submission JSON', async () => {
    const file = new File([SAMPLE_JSON], 'test.json')
    const result = await JSONParser.parseSubmissionsFile(file)
    expect(result.submissions).toHaveLength(1)
  })
  
  it('should reject invalid JSON structure', async () => {
    // Test validation
  })
})
```

### 8.2 Integration Tests
```typescript
// src/services/__tests__/evaluationRunner.test.ts
describe('Evaluation Runner', () => {
  it('should run evaluations for all assignments', async () => {
    // Mock Groq API
    // Test full evaluation flow
  })
})
```

## Phase 9: Performance Optimizations

### 9.1 Database Queries
- Use batch inserts for submissions
- Implement pagination for results
- Add database indexes on frequently queried columns
- Use connection pooling

### 9.2 LLM API Optimization
- Batch similar evaluations
- Implement request queuing
- Cache similar evaluations
- Rate limit management

### 9.3 Frontend Optimization
- Lazy load components
- Virtualize long lists
- Implement infinite scrolling
- Optimize re-renders

## Phase 10: Deployment Considerations

### 10.1 Environment Setup
```yaml
# Production environment variables
VITE_SUPABASE_URL=prod_url
VITE_SUPABASE_ANON_KEY=prod_key
VITE_GROQ_API_KEY=prod_api_key
VITE_APP_URL=https://ai-judge.example.com
```

### 10.2 Security Measures
- API key rotation
- Rate limiting per user
- Input sanitization
- SQL injection prevention
- XSS protection

## Key Implementation Files Structure

```
src/
├── services/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── database.ts
│   │   └── types.ts
│   ├── llm/
│   │   ├── groqService.ts
│   │   ├── promptBuilder.ts
│   │   └── types.ts
│   ├── parser/
│   │   ├── jsonParser.ts
│   │   └── validators.ts
│   └── api/
│       ├── index.ts
│       ├── evaluationRunner.ts
│       └── types.ts
├── utils/
│   ├── errorHandler.ts
│   ├── retry.ts
│   └── validators/
└── config/
    ├── constants.ts
    └── environment.ts
```

## Success Metrics

### Functional Requirements
- ✅ JSON upload persists to Supabase
- ✅ Judges CRUD operations work
- ✅ Judge assignments persist
- ✅ Groq API evaluations execute
- ✅ Results stored in database
- ✅ Filters work with real data

### Performance Targets
- File upload: < 2s for 100 submissions
- Judge operations: < 500ms response
- Evaluation run: < 1s per evaluation
- Results loading: < 1s for 1000 records

### Error Handling
- Graceful API failures
- Clear error messages
- Automatic retry logic
- Fallback UI states

## Risk Mitigation

### Technical Risks
1. **Groq API Rate Limits**: Implement queuing and batching
2. **Large File Uploads**: Add chunking and progress tracking
3. **Database Performance**: Add indexes and optimize queries
4. **Network Failures**: Implement offline support and retry

### Implementation Risks
1. **Time Constraints**: Focus on core features first
2. **Integration Complexity**: Test early and often
3. **Type Safety**: Use strict TypeScript throughout
4. **State Management**: Keep it simple with React Query

## Conclusion

This implementation plan provides a complete roadmap for transforming the current mock-based frontend into a fully functional AI Judge application with:
- Real Supabase backend for persistence
- Groq API integration for LLM evaluations
- Robust error handling and retry logic
- Performance optimizations
- Comprehensive testing strategy

The modular architecture ensures maintainability and allows for incremental implementation while keeping the application functional at each stage.