---
allowed-tools: [Read, Grep, Glob]
---

# Understand Quick - Fast AI Judge Component Analysis

Rapidly analyze a specific AI Judge component or file without extensive documentation reading.

# Usage

`understand_quick {{PATH}}` - Analyze a specific file or component

**Examples:**
- `src/components/FileUpload/FileUpload.tsx`
- `src/services/llm/openai.ts`
- `judge-management` (finds main files automatically)
- `evaluation-runner` (locates core implementation)

# Process

## 1. Find Target in AI Judge

- **File path given**: Read it directly
- **Feature name given**: Search for main files
  - `src/features/{{feature}}/*.tsx`
  - `src/components/{{component}}/*.tsx`
  - `src/services/{{service}}/*.ts`

## 2. Quick Analysis Focus

**Extract Key Information:**
- Component/function purpose
- Props/parameters interface
- Main functionality
- Dependencies used
- State management approach
- Error handling patterns

## 3. AI Judge Specific Patterns

**For Components:**
- UI library used (Material-UI, Ant Design, etc.)
- Form handling approach
- Loading/error states
- Event handlers

**For Services:**
- API endpoints called
- Data transformation
- Error handling
- Authentication/headers

**For Hooks:**
- State managed
- Side effects
- Dependencies
- Return values

## 4. Summary Output Format

```
Component: {{NAME}}
Location: {{PATH}}
Type: {{Component|Service|Hook|Utility}}
Purpose: {{ONE_LINE_DESCRIPTION}}

Key Functions:
- {{FUNCTION_1}}: {{WHAT_IT_DOES}}
- {{FUNCTION_2}}: {{WHAT_IT_DOES}}

Props/Parameters:
- {{PROP}}: {{TYPE}} - {{DESCRIPTION}}

Dependencies:
- {{IMPORT}}: {{HOW_USED}}

State/Data:
- {{STATE_VAR}}: {{PURPOSE}}

Integration:
- {{SERVICE/API}}: {{HOW_CONNECTED}}

Notes:
- {{COMPLEXITY_POINTS}}
- {{PATTERNS_USED}}
```

## Example Outputs

### FileUpload Component
```
Component: FileUpload
Location: src/components/FileUpload/FileUpload.tsx
Type: Component
Purpose: Handles JSON file upload with drag-and-drop support

Key Functions:
- handleDrop: Processes dropped files
- validateFile: Checks JSON structure
- uploadToBackend: Sends to database

Props:
- onSuccess: (data: Submission[]) => void
- onError: (error: Error) => void

Dependencies:
- React DnD: Drag and drop functionality
- Axios: File upload

State:
- uploading: Upload progress tracking
- error: Error message display

Notes:
- Validates against sample_input.json schema
- Shows progress bar during upload
```

### Judge Service
```
Component: JudgeService
Location: src/services/judges/judgeService.ts
Type: Service
Purpose: CRUD operations for AI judges

Key Functions:
- createJudge: Adds new judge to database
- updateJudge: Modifies existing judge
- listJudges: Fetches all judges
- deleteJudge: Soft deletes judge

Parameters:
- Judge: Interface with name, prompt, model, active

Dependencies:
- Firebase/Supabase: Database operations
- UUID: Generate judge IDs

Integration:
- Database: Direct Firebase/Supabase calls
- Cache: React Query integration

Notes:
- Implements optimistic updates
- Handles offline scenarios
```

### Evaluation Hook
```
Component: useEvaluation
Location: src/hooks/useEvaluation.ts
Type: Hook
Purpose: Manages evaluation execution state

Key Functions:
- runEvaluations: Triggers evaluation process
- getProgress: Returns current status
- cancelEvaluation: Stops execution

State:
- progress: Current evaluation progress
- results: Completed evaluations
- errors: Failed evaluations

Dependencies:
- React Query: Mutation management
- LLM Service: API calls

Returns:
- runEvaluations function
- progress object
- isRunning boolean

Notes:
- Batches LLM API calls
- Implements retry logic
```

## Quick Analysis Checklist

- ✅ File located and read
- ✅ Purpose identified
- ✅ Key functions listed
- ✅ Dependencies noted
- ✅ Integration points found
- ✅ Complexity assessed

## When to Use Full Analysis

Use full `understand` command when:
- Need comprehensive feature analysis
- Multiple files involved
- Documentation review required
- Architecture understanding needed

## Success Criteria

- ✅ < 2 minutes analysis time
- ✅ Single file focus
- ✅ Key patterns identified
- ✅ Ready for specific work
- ✅ No documentation overhead

The goal is rapid understanding of specific AI Judge components for immediate development tasks.