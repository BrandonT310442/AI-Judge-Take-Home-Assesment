# Supabase Database Schema for AI Judge

## Instructions
Copy and paste these SQL queries in order into your Supabase SQL editor.

## 1. Enable Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## 2. Create Tables

### Queues Table
```sql
CREATE TABLE IF NOT EXISTS queues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  submission_count INTEGER DEFAULT 0
);
```

### Submissions Table
```sql
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  queue_id TEXT REFERENCES queues(id) ON DELETE CASCADE,
  labeling_task_id TEXT,
  created_at TIMESTAMP,
  questions JSONB NOT NULL,
  answers JSONB NOT NULL
);
```

### Judges Table
```sql
CREATE TABLE IF NOT EXISTS judges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  model_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Judge Assignments Table
```sql
CREATE TABLE IF NOT EXISTS judge_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id TEXT REFERENCES queues(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  judge_id UUID REFERENCES judges(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(queue_id, question_id, judge_id)
);
```

### Evaluations Table
```sql
CREATE TABLE IF NOT EXISTS evaluations (
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
```

### Evaluation Runs Table
```sql
CREATE TABLE IF NOT EXISTS evaluation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  queue_id TEXT REFERENCES queues(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  status TEXT CHECK (status IN ('running', 'completed', 'failed')),
  total_evaluations INTEGER DEFAULT 0,
  completed_evaluations INTEGER DEFAULT 0,
  failed_evaluations INTEGER DEFAULT 0
);
```

## 3. Create Indexes
```sql
-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_submissions_queue_id ON submissions(queue_id);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_queue_id ON judge_assignments(queue_id);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_judge_id ON judge_assignments(judge_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_submission_id ON evaluations(submission_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_judge_id ON evaluations(judge_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_runs_queue_id ON evaluation_runs(queue_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_verdict ON evaluations(verdict);
CREATE INDEX IF NOT EXISTS idx_judges_is_active ON judges(is_active);
```

## 4. Create Update Trigger Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## 5. Apply Update Trigger to Judges Table
```sql
DROP TRIGGER IF EXISTS update_judges_updated_at ON judges;
CREATE TRIGGER update_judges_updated_at 
BEFORE UPDATE ON judges 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

## 6. Row Level Security (RLS) Policies
```sql
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
```

## 7. Helper Functions
```sql
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
```

## 8. Initial Seed Data (Optional)
```sql
-- Insert sample judges if they don't exist
INSERT INTO judges (name, system_prompt, model_name, is_active) 
SELECT * FROM (VALUES
    ('Accuracy Judge', 'Evaluate the accuracy and correctness of answers. Be strict but fair.', 'llama-3.3-70b-versatile', true),
    ('Reasoning Judge', 'Focus on the quality of reasoning and logical flow in the answers.', 'llama-3.3-70b-versatile', true),
    ('Technical Judge', 'Assess technical accuracy and depth of understanding.', 'llama-3.3-70b-versatile', true)
) AS v(name, system_prompt, model_name, is_active)
WHERE NOT EXISTS (
    SELECT 1 FROM judges WHERE name = v.name
);
```