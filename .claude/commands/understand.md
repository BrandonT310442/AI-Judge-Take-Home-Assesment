---
allowed-tools: [Read, Write, Grep, Glob, Task, Search]
---

# Understand - AI Judge Codebase Analysis

Thoroughly analyzes the AI Judge application structure, implementation patterns, and architecture to provide comprehensive understanding for development and maintenance.

# Usage

- `understand` - Full codebase analysis
- `understand {{FEATURE}}` - Analyze specific feature (data-ingestion, judge-management, evaluation, results)

# Process

## 1. Project Structure Discovery

**Expected AI Judge Structure:**
```
ai-judge/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── FileUpload/   
│   │   ├── JudgeForm/    
│   │   └── ResultsTable/ 
│   ├── features/         # Feature modules
│   │   ├── data-ingestion/
│   │   ├── judge-management/
│   │   ├── evaluation/
│   │   └── results/
│   ├── services/         # Backend integrations
│   │   ├── database/     # Firebase/Supabase/SQLite
│   │   ├── llm/          # LLM provider integrations
│   │   └── storage/      # File handling
│   ├── types/            # TypeScript interfaces
│   │   ├── submission.ts
│   │   ├── judge.ts
│   │   └── evaluation.ts
│   ├── utils/            # Helper functions
│   ├── hooks/            # Custom React hooks
│   └── App.tsx           # Main application
├── public/
├── docs/                 # Documentation
├── tests/                # Test files
└── sample_input.json     # Sample data file
```

## 2. Core Components Analysis

### Data Model Understanding
```typescript
// Expected submission structure from sample_input.json
interface Submission {
  id: string
  queueId: string
  labelingTaskId: string
  createdAt: number
  questions: Question[]
  answers: Record<string, Answer>
}

interface Judge {
  id: string
  name: string
  systemPrompt: string
  modelName: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

interface Evaluation {
  id: string
  submissionId: string
  questionId: string
  judgeId: string
  verdict: 'pass' | 'fail' | 'inconclusive'
  reasoning: string
  createdAt: number
}
```

### Feature Analysis Areas

**Data Ingestion Feature:**
- JSON file parsing and validation
- Schema compatibility checking
- Backend persistence logic
- Error handling for invalid files
- UI feedback mechanisms

**Judge Management Feature:**
- CRUD operations implementation
- Form validation and submission
- State management approach
- Persistence layer integration
- Active/inactive status handling

**Evaluation Runner Feature:**
- LLM API integration patterns
- Prompt construction logic
- Queue and batch processing
- Progress tracking implementation
- Error recovery mechanisms

**Results View Feature:**
- Data fetching and caching
- Filter implementation
- Statistics calculation
- Pagination/virtualization
- Export functionality (if present)

## 3. Technical Stack Analysis

### Frontend Technologies
- **React 18**: Component patterns, hooks usage
- **TypeScript**: Type safety implementation
- **Vite**: Build configuration and optimizations
- **State Management**: Context API, Zustand, or Redux
- **UI Library**: Material-UI, Ant Design, or custom
- **Form Handling**: React Hook Form or Formik
- **Data Fetching**: React Query, SWR, or native

### Backend Integration
- **Database Choice**: Firebase, Supabase, or SQLite
- **Authentication**: If implemented
- **File Storage**: Local or cloud storage
- **API Structure**: REST or GraphQL
- **Real-time Updates**: WebSockets or polling

### LLM Integration
- **Provider**: OpenAI, Anthropic, or Gemini
- **API Key Management**: Environment variables
- **Request/Response Handling**: Error handling, retries
- **Rate Limiting**: Implementation approach
- **Cost Management**: Usage tracking

## 4. Code Quality Assessment

### TypeScript Usage
- Type coverage percentage
- Use of generics and utility types
- Interface vs type aliases
- Strict mode configuration
- Any usage analysis

### Component Architecture
- Component composition patterns
- Props vs context usage
- Custom hooks implementation
- Code reusability
- Separation of concerns

### Testing Strategy
- Unit test coverage
- Integration test presence
- E2E test implementation
- Test utilities and helpers
- Mock data management

## 5. Generate Understanding Document

**Output Directory:** `docs/analysis/`
**Output File:** `UNDERSTANDING_AI_JUDGE.md`

### Document Structure

```markdown
# Understanding: AI Judge Application

## Overview
**Type**: Full-Stack Web Application
**Stack**: React 18 + TypeScript + Vite + [Backend]
**Purpose**: Automated evaluation system for human answers using LLM judges
**Status**: [Development/Production]

## Architecture

### Frontend Architecture
- **Component Structure**: [Atomic/Feature-based/Hybrid]
- **State Management**: [Context/Zustand/Redux]
- **Routing**: [React Router/Other]
- **Styling**: [CSS Modules/Styled Components/Tailwind]

### Backend Architecture
- **Database**: [Firebase/Supabase/SQLite]
- **Storage**: [Local/Cloud]
- **API Pattern**: [REST/GraphQL]
- **Authentication**: [None/Firebase Auth/Other]

### Data Flow
1. User uploads JSON file
2. System parses and validates data
3. Data persisted to backend
4. Judges created and assigned
5. Evaluations executed via LLM
6. Results stored and displayed

## Implementation Patterns

### File Upload Pattern
- Drag-and-drop implementation
- File validation approach
- Progress tracking method
- Error handling strategy

### CRUD Pattern
- Form handling approach
- Validation strategy
- Optimistic updates
- Error recovery

### LLM Integration Pattern
- API client implementation
- Prompt construction
- Response parsing
- Error handling

### State Management Pattern
- Global vs local state
- Data caching strategy
- Update mechanisms
- Performance optimizations

## Key Components

### FileUpload Component
- Purpose: Handle JSON file uploads
- Key features: Validation, progress, error handling
- Dependencies: [List key dependencies]

### JudgeManager Component
- Purpose: CRUD operations for judges
- Key features: Form handling, persistence
- Dependencies: [List key dependencies]

### EvaluationRunner Component
- Purpose: Execute LLM evaluations
- Key features: Queue processing, progress tracking
- Dependencies: [List key dependencies]

### ResultsView Component
- Purpose: Display and filter results
- Key features: Filters, statistics, pagination
- Dependencies: [List key dependencies]

## Technical Decisions

### Database Choice
- Selected: [Firebase/Supabase/SQLite]
- Rationale: [Why this choice]
- Trade-offs: [Pros and cons]

### LLM Provider
- Selected: [OpenAI/Anthropic/Gemini]
- Rationale: [Why this choice]
- Integration approach: [How integrated]

### State Management
- Approach: [Context/Library]
- Rationale: [Why this approach]
- Performance considerations: [Optimizations]

## Quality Metrics

### Code Quality
- TypeScript coverage: [%]
- Component reusability: [High/Medium/Low]
- Code duplication: [Minimal/Some/Significant]
- Documentation: [Comprehensive/Adequate/Minimal]

### Performance
- Bundle size: [Size in KB/MB]
- Initial load time: [Time]
- LCP/FCP metrics: [If measured]
- API response times: [Average times]

### Testing
- Unit test coverage: [%]
- Integration tests: [Present/Absent]
- E2E tests: [Present/Absent]
- Manual testing needs: [Areas requiring manual testing]

## Identified Improvements

### Quick Wins
- [Improvement that can be done quickly]
- [Another quick improvement]

### Medium-term Improvements
- [Improvement requiring moderate effort]
- [Another medium-term improvement]

### Long-term Enhancements
- [Major enhancement opportunity]
- [Another long-term possibility]

## Development Workflow

### Setup Process
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run development server: `npm run dev`

### Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run test` - Run tests
- `npm run preview` - Preview production build

## Notes for Development

### Critical Paths
- File upload → Data persistence → Judge assignment → Evaluation → Results
- Each step must handle errors gracefully

### Performance Considerations
- Large file handling
- Batch LLM API calls
- Results pagination
- State updates optimization

### Security Considerations
- API key management
- Input validation
- XSS prevention
- Data sanitization

## Summary

The AI Judge application is a [well-structured/developing] system for automated evaluation of human answers using LLM judges. Key strengths include [list strengths]. Areas for improvement include [list improvements]. The codebase follows [modern/standard] React patterns with [good/adequate] TypeScript usage.
```

## 6. Analysis Questions

**Architecture Questions:**
- Is the component structure scalable?
- Are concerns properly separated?
- Is the data flow clear and maintainable?

**Implementation Questions:**
- Are React 18 features utilized effectively?
- Is TypeScript used to its full potential?
- Are performance optimizations in place?

**Quality Questions:**
- Is the code testable?
- Are errors handled comprehensively?
- Is the UI/UX polished?

**Maintenance Questions:**
- Is the code well-documented?
- Are patterns consistent?
- Is it easy to add new features?

## Success Criteria

- ✅ Complete understanding of project structure
- ✅ All major components analyzed
- ✅ Technical decisions understood
- ✅ Integration patterns documented
- ✅ Quality metrics assessed
- ✅ Improvement opportunities identified
- ✅ Ready for feature development or debugging

The goal is to provide comprehensive understanding of the AI Judge application to enable efficient development and maintenance.