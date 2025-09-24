---
allowed-tools: [Read, Write, Grep, Glob, Task, Search]
---

# Simplify Implementation - AI Judge Code Optimization

Refactors the AI Judge codebase to improve maintainability, reduce complexity, and establish clear patterns while meeting all requirements.

# Usage

- `simplify-implementation` - Review entire AI Judge codebase for simplification
- `simplify-implementation {{FEATURE}}` - Focus on specific feature (data-ingestion, judge-management, evaluation, results)

# Process

## 1. Identify Complexity Areas in AI Judge

Common complexity sources:
- Overly complex state management for simple CRUD operations
- Duplicate API integration code across features
- Inconsistent error handling patterns
- Mixed concerns in components (UI + business logic)
- Repetitive form handling code

## 2. Simplification Strategies

### Component Simplification

**Before: Complex mixed component**
```typescript
// ❌ Too much in one component
const JudgeManager = () => {
  const [judges, setJudges] = useState([])
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  // API calls mixed with UI
  const saveJudge = async () => {
    // Complex validation logic
    // API call
    // Error handling
    // State updates
  }
  
  // Hundreds of lines of mixed code...
}
```

**After: Separated concerns**
```typescript
// ✅ Clean separation
// hooks/useJudges.ts
const useJudges = () => {
  return useQuery(['judges'], fetchJudges)
}

// hooks/useJudgeForm.ts
const useJudgeForm = () => {
  return useForm<Judge>({
    defaultValues: defaultJudge,
    resolver: judgeValidator
  })
}

// components/JudgeManager.tsx
const JudgeManager = () => {
  const { data: judges } = useJudges()
  const form = useJudgeForm()
  
  return <JudgeForm form={form} onSubmit={handleSubmit} />
}
```

### Service Layer Simplification

**Before: Duplicate API code**
```typescript
// ❌ Repeated patterns
const createJudge = async (data) => {
  try {
    const response = await fetch('/api/judges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed')
    return response.json()
  } catch (error) {
    console.error(error)
    throw error
  }
}

const updateJudge = async (id, data) => {
  // Similar repetitive code...
}
```

**After: Generic API client**
```typescript
// ✅ Reusable API client
class APIClient<T> {
  constructor(private endpoint: string) {}
  
  create = (data: T) => this.request('POST', '', data)
  update = (id: string, data: T) => this.request('PUT', id, data)
  delete = (id: string) => this.request('DELETE', id)
  list = () => this.request('GET', '')
  
  private request = async (method: string, path: string, data?: T) => {
    // Centralized error handling and response parsing
  }
}

// Usage
const judgeAPI = new APIClient<Judge>('/api/judges')
const evaluationAPI = new APIClient<Evaluation>('/api/evaluations')
```

### State Management Simplification

**Before: Complex context setup**
```typescript
// ❌ Boilerplate heavy
const AppContext = createContext()
const AppProvider = ({ children }) => {
  const [judges, setJudges] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [evaluations, setEvaluations] = useState([])
  // Dozens of state updates functions...
}
```

**After: Simplified with React Query**
```typescript
// ✅ Let React Query handle server state
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Server state managed by React Query */}
      {/* Local UI state in components */}
    </QueryClientProvider>
  )
}
```

## 3. AI Judge Specific Simplifications

### Data Ingestion Simplification
```typescript
// Single responsibility file processor
const useFileProcessor = () => {
  const process = useCallback(async (file: File) => {
    const data = await parseJSON(file)
    const validation = validateSubmission(data)
    if (!validation.valid) throw validation.errors
    return data
  }, [])
  
  return { process }
}
```

### Judge Form Simplification
```typescript
// Reusable form component
const FormField = ({ label, error, children }) => (
  <div className="form-field">
    <label>{label}</label>
    {children}
    {error && <span className="error">{error}</span>}
  </div>
)

// Clean judge form
const JudgeForm = ({ judge, onSubmit }) => {
  const { register, handleSubmit, errors } = useForm()
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Name" error={errors.name}>
        <input {...register('name')} />
      </FormField>
      <FormField label="System Prompt" error={errors.systemPrompt}>
        <textarea {...register('systemPrompt')} />
      </FormField>
      <FormField label="Model" error={errors.modelName}>
        <select {...register('modelName')}>
          <option value="gpt-4">GPT-4</option>
          <option value="claude-3">Claude 3</option>
        </select>
      </FormField>
      <button type="submit">Save Judge</button>
    </form>
  )
}
```

### Evaluation Runner Simplification
```typescript
// Clear evaluation pipeline
const useEvaluationRunner = () => {
  const runEvaluations = async (queueId: string) => {
    const pipeline = [
      getSubmissions,
      getAssignedJudges,
      createEvaluationTasks,
      executeInBatches,
      saveResults
    ]
    
    return pipeline.reduce(
      (acc, step) => acc.then(step),
      Promise.resolve({ queueId })
    )
  }
  
  return { runEvaluations }
}
```

### Results View Simplification
```typescript
// Composable filter system
const useResultFilters = () => {
  const [filters, setFilters] = useState<Filters>({
    judges: [],
    questions: [],
    verdicts: []
  })
  
  const filteredResults = useMemo(() => 
    results.filter(applyFilters(filters)),
    [results, filters]
  )
  
  return { filters, setFilters, filteredResults }
}
```

## 4. Common Patterns to Establish

### Error Handling Pattern
```typescript
// Centralized error handler
const handleError = (error: unknown): ErrorInfo => {
  if (error instanceof ValidationError) {
    return { type: 'validation', message: error.message }
  }
  if (error instanceof APIError) {
    return { type: 'api', message: error.message }
  }
  return { type: 'unknown', message: 'An error occurred' }
}
```

### Loading State Pattern
```typescript
// Reusable loading wrapper
const LoadingBoundary = ({ loading, error, children }) => {
  if (loading) return <Spinner />
  if (error) return <ErrorDisplay error={error} />
  return children
}
```

### Form Validation Pattern
```typescript
// Consistent validation
const createValidator = <T>(schema: Schema) => {
  return (data: T) => {
    const result = schema.validate(data)
    if (!result.valid) {
      throw new ValidationError(result.errors)
    }
    return data
  }
}
```

## 5. File Structure Simplification

```
src/
├── components/           # Pure UI components
│   ├── common/          # Shared UI elements
│   └── features/        # Feature-specific UI
├── hooks/               # All custom hooks
│   ├── useJudges.ts
│   ├── useEvaluations.ts
│   └── useSubmissions.ts
├── services/            # API and external services
│   ├── api/            # API clients
│   ├── llm/            # LLM integrations
│   └── database/       # Database layer
├── types/              # TypeScript definitions
├── utils/              # Helper functions
└── App.tsx            # Main app component
```

## 6. Performance Simplifications

### Memoization Strategy
```typescript
// Only memoize expensive operations
const PassRateChart = ({ evaluations }) => {
  // ✅ Worth memoizing - expensive calculation
  const passRate = useMemo(() => 
    calculatePassRate(evaluations),
    [evaluations]
  )
  
  // ❌ Not worth memoizing - simple operation
  const title = `Pass Rate: ${passRate}%`
  
  return <Chart data={passRate} title={title} />
}
```

### Bundle Size Optimization
```typescript
// Lazy load heavy features
const ResultsView = lazy(() => import('./features/results'))
const EvaluationRunner = lazy(() => import('./features/evaluation'))
```

## Success Metrics

- ✅ Reduced component complexity (< 100 lines per component)
- ✅ Consistent patterns across features
- ✅ Reusable utilities and hooks
- ✅ Clear separation of concerns
- ✅ Simplified state management
- ✅ Better TypeScript usage
- ✅ Improved testability

## Key Principles

1. **Single Responsibility**: Each module does one thing well
2. **DRY (Don't Repeat Yourself)**: Extract common patterns
3. **Composition over Inheritance**: Use hooks and HOCs
4. **Explicit over Implicit**: Clear function names and types
5. **Progressive Complexity**: Start simple, add complexity only when needed

The goal is a clean, maintainable AI Judge codebase that's easy to understand, extend, and debug while meeting all functional requirements.