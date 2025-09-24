---
allowed-tools: [Read, Write, Grep, Glob, Task]
---

# Define Requirements - AI Judge Feature Specification

Creates a requirements document for AI Judge features based on the Besimple AI coding challenge brief. Maps out what needs to be accomplished for implementing evaluation features, judge management, and results viewing.

# Usage

- `define-requirements` - Creates requirements based on the coding challenge brief
- `define-requirements {{FEATURE}}` - Define requirements for specific feature (data-ingestion, judge-management, evaluation-runner, results-view)

# Process

## 1. Gather Context

**Core Challenge Requirements:**
- React 18 + TypeScript + Vite application
- Real LLM provider integration (OpenAI, Anthropic, or Gemini)
- Backend persistence (Firebase, Supabase, or SQLite)
- JSON data ingestion from sample_input.json format
- Judge CRUD operations with persistence
- Evaluation execution and storage
- Results viewing with filters and statistics

**Feature Areas:**
1. **Data Ingestion** - JSON upload and parsing
2. **Judge Management** - CRUD for AI judges
3. **Judge Assignment** - Assign judges to questions
4. **Evaluation Runner** - Execute LLM evaluations
5. **Results View** - Display and filter results

## 2. Create Requirements Document

**Output Directory:** `docs/requirements/`
**Output File:** `REQUIREMENTS_{FEATURE_NAME}.md`

## 3. Requirements Document Structure

```markdown
# Requirements: {Feature Name}

## Feature Summary
**Type**: {Data Management|AI Integration|UI Component|Backend Service}
**Priority**: {Core|Essential|Enhancement}
**Dependencies**: {Other features this depends on}

## Objective
{Clear statement of what this feature accomplishes for the AI Judge system}

## Functional Requirements

### Core Requirements
- **FR1**: Accept JSON file upload matching sample_input.json schema
- **FR2**: Parse and validate submission structure
- **FR3**: Persist data to backend (not localStorage)
- **FR4**: Handle multiple queues and submissions

### User Interface Requirements
- **UI1**: Drag-and-drop file upload interface
- **UI2**: Upload progress indication
- **UI3**: Validation error display
- **UI4**: Success confirmation

### Data Requirements
- **DR1**: Support submission schema with id, queueId, questions, answers
- **DR2**: Handle nested question/answer structures
- **DR3**: Maintain data integrity across features

## Technical Requirements

### Backend Requirements
- **TR1**: Use Firebase/Supabase/SQLite for persistence
- **TR2**: Implement proper error handling
- **TR3**: Support concurrent operations
- **TR4**: Maintain ACID properties for data operations

### Frontend Requirements
- **TR5**: React 18 with TypeScript
- **TR6**: Vite build configuration
- **TR7**: Responsive design
- **TR8**: Loading and error states

### Integration Requirements
- **IR1**: LLM Provider API integration (OpenAI/Anthropic/Gemini)
- **IR2**: Secure API key management
- **IR3**: Rate limiting and retry logic
- **IR4**: Response parsing and error handling

## Acceptance Criteria

### Data Ingestion
- [ ] JSON file can be uploaded via UI
- [ ] File is validated against expected schema
- [ ] Data is persisted to backend storage
- [ ] User receives confirmation of successful upload
- [ ] Invalid files show clear error messages

### Judge Management
- [ ] Judges can be created with name, prompt, model, active flag
- [ ] Judges can be edited and updated
- [ ] Judges can be deactivated (soft delete)
- [ ] Judge list persists across page reloads
- [ ] Changes are immediately reflected in UI

### Judge Assignment
- [ ] UI shows questions grouped by queue
- [ ] Multiple judges can be assigned per question
- [ ] Assignments are persisted to backend
- [ ] Clear visual indication of assigned judges

### Evaluation Execution
- [ ] "Run AI Judges" triggers evaluation process
- [ ] Progress indication during execution
- [ ] LLM API calls include judge prompt + question + answer
- [ ] Verdicts (pass/fail/inconclusive) are captured
- [ ] Reasoning text is stored
- [ ] Error handling for API failures

### Results Display
- [ ] Results show submission, question, judge, verdict, reasoning
- [ ] Multi-select filters for judges and questions
- [ ] Verdict filter (pass/fail/inconclusive)
- [ ] Aggregate pass rate calculation
- [ ] Results persist in backend

## Out of Scope
- User authentication/authorization
- Multi-tenant support
- Real-time collaboration
- Export functionality (unless implemented as bonus)
- Historical version tracking

## Testing Requirements
- Unit tests for data parsing logic
- Integration tests for API calls
- UI component testing
- End-to-end workflow testing
- Error scenario coverage

## Performance Requirements
- Initial page load < 3 seconds
- File upload processing < 5 seconds for typical files
- LLM API timeout handling (30 second timeout)
- Smooth UI interactions (no blocking operations)

## Risk Assessment
- **API Rate Limits**: Implement queuing and retry logic
- **Large Files**: Set reasonable file size limits (10MB)
- **LLM Costs**: Provide usage estimates before execution
- **Data Loss**: Implement proper persistence and backup

## Success Metrics
- All functional requirements implemented
- Clean, maintainable code structure
- Comprehensive error handling
- Intuitive user experience
- Meeting evaluation rubric criteria
```

## 4. Feature-Specific Requirements

### For Data Ingestion:
- File format validation
- Schema compatibility checking
- Duplicate detection
- Batch processing capability

### For Judge Management:
- Form validation rules
- Prompt template suggestions
- Model selection options
- Soft delete implementation

### For Evaluation Runner:
- Queue management
- Progress tracking
- Partial failure handling
- Result aggregation

### For Results View:
- Pagination for large datasets
- Export capabilities (bonus)
- Chart visualizations (bonus)
- Real-time updates

## Key Principles

1. **User-Centric**: Focus on smooth, intuitive workflows
2. **Robust**: Handle errors gracefully at every step
3. **Performant**: Optimize for responsive interactions
4. **Maintainable**: Clean code structure and documentation
5. **Testable**: Comprehensive test coverage

## Success Criteria

- ✅ Requirements align with coding challenge brief
- ✅ All evaluation rubric points addressed
- ✅ Technical constraints considered
- ✅ Clear acceptance criteria defined
- ✅ Ready for implementation planning

The goal is a clear, comprehensive requirements document that ensures all aspects of the AI Judge system are properly specified.