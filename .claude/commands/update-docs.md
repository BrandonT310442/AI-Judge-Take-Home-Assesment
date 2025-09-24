---
allowed-tools: [Read, Write, Grep, Glob, Task]
---

# Update Documentation - AI Judge Project Documentation

Updates README.md, CLAUDE.md, and other documentation based on implementation progress and submission requirements.

# Usage

- `update-docs` - Update all documentation for submission
- `update-docs {{AREA}}` - Update specific area (readme, claude, api, setup)

# Process

## 1. Documentation Requirements

### README.md (Required for Submission)
- Installation and setup instructions
- `npm run dev` command documentation
- Architecture overview
- **Time spent on project**
- **Trade-offs and decisions made**
- Environment variables setup
- Sample data usage

### CLAUDE.md (Development Guidance)
- Project structure
- Development commands
- Feature implementation notes
- Common patterns used
- Known issues and solutions
- Testing approach

### Additional Documentation
- API documentation (if external APIs used)
- Database schema documentation
- Component documentation
- Deployment notes

## 2. README.md Template

```markdown
# AI Judge - Automated Evaluation System

An automated system for evaluating human answers to questions using LLM-based judges.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- API key for [OpenAI/Anthropic/Gemini]

### Installation

\`\`\`bash
# Clone the repository
git clone [repository-url]
cd ai-judge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys
\`\`\`

### Running the Application

\`\`\`bash
# Start development server
npm run dev

# Application will open at http://localhost:5173
\`\`\`

## 📁 Project Structure

\`\`\`
ai-judge/
├── src/
│   ├── components/      # Reusable UI components
│   ├── features/        # Feature modules
│   ├── services/        # External service integrations
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript definitions
│   └── utils/           # Helper functions
├── public/              # Static assets
├── docs/                # Documentation
└── sample_input.json    # Sample data for testing
\`\`\`

## 🔧 Features

### 1. Data Ingestion
- Upload JSON files via drag-and-drop
- Automatic schema validation
- Persistent storage using [Firebase/Supabase/SQLite]

### 2. Judge Management
- Create, edit, and deactivate AI judges
- Configure system prompts and model selection
- Persistent judge configurations

### 3. Judge Assignment
- Assign multiple judges per question
- Visual assignment interface
- Batch assignment capabilities

### 4. Evaluation Execution
- Real LLM API integration ([Provider])
- Progress tracking and status updates
- Error handling and retry logic

### 5. Results Viewing
- Filter by judge, question, and verdict
- Aggregate statistics and pass rates
- Export functionality

## 🛠 Configuration

### Environment Variables

\`\`\`env
# LLM Provider API Keys
VITE_OPENAI_API_KEY=your_openai_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key

# Database Configuration
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_PROJECT_ID=your_project_id

# Or for Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

### Sample Data

Use the provided \`sample_input.json\` file to test the application:

\`\`\`json
[
  {
    "id": "sub_1",
    "queueId": "queue_1",
    "questions": [...],
    "answers": {...}
  }
]
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Run linter
npm run lint
\`\`\`

## 📊 Technical Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: [TailwindCSS/CSS Modules/Styled Components]
- **State Management**: [React Query/Zustand/Context API]
- **Database**: [Firebase/Supabase/SQLite]
- **LLM Provider**: [OpenAI/Anthropic/Gemini]

## ⏱ Time Spent

Total time: ~[X] hours

- Initial setup and configuration: [X] hours
- Core features implementation: [X] hours
- LLM integration: [X] hours
- UI/UX polish: [X] hours
- Testing and debugging: [X] hours
- Documentation: [X] hours

## 🤔 Trade-offs and Decisions

### Architecture Decisions

1. **State Management**: Chose [React Query] for server state management to simplify data fetching and caching, trading off some control for better DX.

2. **Database Choice**: Selected [Firebase/Supabase] for rapid development and built-in features, accepting vendor lock-in for faster time-to-market.

3. **Component Structure**: Used feature-based organization over traditional MVC to improve code colocation and maintainability.

### Implementation Trade-offs

1. **Simplified Error Handling**: Implemented basic retry logic rather than complex queue system to meet deadline.

2. **Limited Filtering**: Focused on core filters (judge, question, verdict) rather than advanced search to prioritize essential functionality.

3. **Performance**: Used pagination for results rather than virtualization due to time constraints, adequate for expected data volumes.

### Scope Decisions

1. **No Authentication**: Skipped user auth to focus on core evaluation features as per requirements.

2. **Basic UI**: Prioritized functionality over advanced animations and transitions.

3. **Limited Export Formats**: Implemented CSV export only, skipping PDF generation.

## 📝 Known Issues

- Large file uploads (>10MB) may timeout
- Rate limiting on LLM APIs not fully implemented
- Some edge cases in error recovery need improvement

## 🚢 Deployment

\`\`\`bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to [Platform]
npm run deploy
\`\`\`

## 📄 License

[Your License]

## 👤 Author

[Your Name]
\`\`\`

## 3. CLAUDE.md Template

```markdown
# CLAUDE.md - AI Judge Development Guide

## Project Overview

AI Judge is a web application for automatically reviewing and evaluating human answers using LLM-based judges. Built with React 18 + TypeScript + Vite.

## Development Commands

\`\`\`bash
npm run dev       # Start development server
npm run build     # Build for production  
npm run lint      # Run ESLint
npm run test      # Run tests
npm run preview   # Preview production build
\`\`\`

## Core Features Implementation

### Data Ingestion
- Location: \`src/features/data-ingestion/\`
- Handles JSON file upload and validation
- Persists to [Database] via service layer

### Judge Management  
- Location: \`src/features/judge-management/\`
- CRUD operations for AI judges
- Form validation with [Library]

### Evaluation Runner
- Location: \`src/features/evaluation/\`  
- LLM API integration in \`src/services/llm/\`
- Batch processing with progress tracking

### Results View
- Location: \`src/features/results/\`
- Filtering system using [Approach]
- Statistics calculation in \`src/utils/statistics.ts\`

## Key Patterns

### Service Layer Pattern
All external integrations go through service layer:
- \`src/services/database/\` - Database operations
- \`src/services/llm/\` - LLM provider calls
- \`src/services/storage/\` - File handling

### Error Handling
Centralized error handling in \`src/utils/errorHandler.ts\`
- Consistent error messages
- Retry logic for transient failures
- User-friendly error display

### State Management
- Server state: React Query
- Local UI state: Component state
- Global app state: Context API

## Common Tasks

### Add New Judge Model
1. Update \`src/types/judge.ts\` with new model
2. Add to model options in \`src/components/JudgeForm\`
3. Update LLM service for new provider if needed

### Modify Evaluation Logic
1. Edit \`src/services/llm/evaluationService.ts\`
2. Update prompt construction in \`src/utils/prompts.ts\`
3. Test with sample data

### Add New Filter
1. Update filter types in \`src/types/filters.ts\`
2. Add UI component in \`src/components/Filters\`
3. Update filtering logic in \`src/hooks/useFilters.ts\`

## Testing Approach

- Unit tests for utilities and services
- Integration tests for API calls
- Component tests for critical UI
- E2E tests for main workflows

## Performance Considerations

- Lazy load heavy features
- Memoize expensive calculations
- Virtualize long lists (if needed)
- Debounce user inputs

## Known Gotchas

1. **API Rate Limits**: Implement backoff strategy
2. **Large Files**: Stream parsing for files >5MB
3. **State Updates**: Batch updates to prevent re-renders
4. **Type Safety**: Avoid \`any\` types, use generics

## Debugging Tips

- Enable React DevTools Profiler
- Check Network tab for API calls
- Use \`console.log\` strategically
- Check React Query DevTools

## Future Improvements

- [ ] Add real-time collaboration
- [ ] Implement advanced analytics
- [ ] Add more LLM providers
- [ ] Improve error recovery
- [ ] Add comprehensive testing
\`\`\`

## 4. Documentation Checklist

### For README.md
- ✅ Clear installation instructions
- ✅ npm run dev command documented
- ✅ Environment setup explained
- ✅ Architecture overview provided
- ✅ Time spent documented
- ✅ Trade-offs explained
- ✅ Sample data usage shown

### For CLAUDE.md
- ✅ Development workflow clear
- ✅ File structure documented
- ✅ Common patterns explained
- ✅ Debugging tips included
- ✅ Known issues listed

### For Submission
- ✅ All required sections present
- ✅ No placeholder text remaining
- ✅ Commands tested and working
- ✅ Time tracking accurate
- ✅ Trade-offs honestly discussed

## 5. Final Review

Before submission:
1. Test all documented commands
2. Verify environment setup works
3. Check for sensitive information
4. Ensure professional tone
5. Proofread for errors

## Success Criteria

- ✅ README meets all submission requirements
- ✅ Installation process is clear
- ✅ Architecture is well-explained
- ✅ Time spent is documented
- ✅ Trade-offs are thoughtfully discussed
- ✅ Documentation is professional and complete

The goal is comprehensive documentation that enables easy setup, understanding, and evaluation of the AI Judge application.