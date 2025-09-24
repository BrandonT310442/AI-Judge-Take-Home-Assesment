# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Judge is a web application for automatically reviewing and evaluating human answers to questions using LLM providers. The system ingests submissions, allows configuration of AI judges, executes evaluations via LLM APIs, and displays results with filtering and statistics.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (opens on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Technical Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Backend**: To be selected (Firebase, Supabase, or SQLite)
- **LLM Providers**: OpenAI, Anthropic, or Gemini APIs

## Core Requirements Implementation

### 1. Data Model

Expected submission JSON structure:
```json
[
  {
    "id": "sub_1",
    "queueId": "queue_1",
    "labelingTaskId": "task_1",
    "createdAt": 1690000000000,
    "questions": [
      {
        "rev": 1,
        "data": {
          "id": "q_template_1",
          "questionType": "single_choice_with_reasoning",
          "questionText": "Is the sky blue?"
        }
      }
    ],
    "answers": {
      "q_template_1": {
        "choice": "yes",
        "reasoning": "Observed on a clear day."
      }
    }
  }
]
```

### 2. Key Features to Implement

1. **Data Ingestion**: JSON file upload and parsing into backend storage
2. **AI Judge Management**: CRUD operations for judge definitions (name, system prompt, model, active status)
3. **Judge Assignment**: UI for selecting judges per question in a queue
4. **Evaluation Runner**: Execute LLM calls for question × judge pairs
5. **Results View**: Display evaluations with filters and aggregate statistics

### 3. Database Schema

Key entities to persist:
- **Submissions**: Store uploaded JSON data
- **Judges**: name, systemPrompt, modelName, isActive
- **JudgeAssignments**: queueId, questionId, judgeId
- **Evaluations**: submissionId, questionId, judgeId, verdict (pass/fail/inconclusive), reasoning, createdAt

### 4. API Integration

When implementing LLM provider integration:
- Store API keys securely (environment variables)
- Implement error handling for timeouts, rate limits, quota errors
- Structure prompts to include: judge's system prompt, question text, user's answer
- Parse responses to extract verdict and reasoning

### 5. Component Architecture

Suggested structure:
```
src/
  components/
    FileUpload/          # JSON upload component
    JudgeManager/        # CRUD for judges
    JudgeAssignment/     # Assign judges to questions
    EvaluationRunner/    # Execute evaluations
    ResultsView/         # Display evaluations with filters
  services/
    database/            # Backend abstraction
    llmProvider/         # LLM API integration
  types/                 # TypeScript interfaces
  utils/                 # Helper functions
```

### 6. Routing

Key routes to implement:
- `/` - Dashboard/file upload
- `/judges` - Manage AI judges
- `/queue/:queueId` - View queue and assign judges
- `/queue/:queueId/run` - Run evaluations
- `/results` - View evaluation results

### 7. State Management

Consider using:
- React Context for global state (current queue, judges list)
- Local state for forms and UI interactions
- Backend for persistent data

### 8. Error Handling

Implement graceful handling for:
- Invalid JSON file formats
- LLM API failures
- Network errors
- Missing configurations

### 9. Performance Considerations

- Batch LLM API calls when possible
- Implement pagination for large result sets
- Show progress during evaluation runs
- Cache judge definitions to reduce database queries

## Testing Approach

Test with sample_input.json and verify:
- File upload and parsing
- Judge CRUD operations
- Evaluation execution
- Result filtering and statistics