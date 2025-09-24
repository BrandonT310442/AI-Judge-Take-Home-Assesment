---
allowed-tools: [Read, Write, Grep, Glob, LS, Task, Bash]
---

---
allowed-tools: [Read, Write, Grep, Glob, LS, Task, Bash]
---

# Create Checkpoint - AI Judge Development Session

Saves current AI Judge development progress for seamless continuation later.

# Usage

- `create-checkpoint` - Saves AI Judge development checkpoint

# Process

1. **Remove old checkpoint** - Clean up previous CHECKPOINT.md
2. **Analyze AI Judge progress** - Current feature implementation status
3. **Document project structure** - Show key directories and files
4. **Summarize implementations** - What features are complete/in-progress
5. **Capture technical decisions** - Database choice, LLM provider, patterns
6. **List remaining tasks** - What's needed for submission

**Create `CHECKPOINT.md` with:**

```markdown
# AI Judge Development Checkpoint - {{TIMESTAMP}}

## Project Status

- **Goal**: Complete AI Judge take-home for Besimple AI
- **Current Phase**: [Setup/Core Features/Integration/Polish/Testing]
- **Completion**: [X]% complete

## Features Implementation Status

### ✅ Completed
- [ ] Project setup (Vite + React + TypeScript)
- [ ] Data ingestion (JSON upload)
- [ ] Judge management (CRUD)
- [ ] Judge assignment UI
- [ ] Evaluation runner
- [ ] Results view

### 🚧 In Progress
- **Current Feature**: [Feature name]
- **Status**: [What's done and what remains]

### 📋 Pending
- [ ] LLM integration testing
- [ ] Error handling improvements
- [ ] UI/UX polish
- [ ] Documentation
- [ ] Demo recording

## Technical Decisions Made

- **Database**: [Firebase/Supabase/SQLite] - [Reason]
- **LLM Provider**: [OpenAI/Anthropic/Gemini] - [Reason]
- **State Management**: [React Query/Zustand/Context] - [Reason]
- **UI Library**: [Material-UI/Ant Design/Custom] - [Reason]

## Project Structure

```
src/
├── components/       # [Status: Created/Partial/Pending]
├── features/         # [Status: Created/Partial/Pending]
├── services/         # [Status: Created/Partial/Pending]
├── hooks/           # [Status: Created/Partial/Pending]
├── types/           # [Status: Created/Partial/Pending]
└── utils/           # [Status: Created/Partial/Pending]
```

## Key Files Modified/Created

- `src/App.tsx` - Main application setup
- `src/services/database/` - Database integration
- `src/features/judge-management/` - Judge CRUD implementation
- `src/services/llm/` - LLM provider integration
- `src/types/` - TypeScript definitions

## Environment Setup

- **API Keys Configured**: [Yes/No]
- **Database Connected**: [Yes/No]
- **Sample Data Tested**: [Yes/No]
- **Build Successful**: [Yes/No]

## Challenges & Solutions

- **Challenge**: [Issue faced]
  **Solution**: [How it was resolved]

## Next Priority Tasks

1. **Immediate**: [Most urgent task]
2. **Next**: [Following task]
3. **Then**: [Subsequent task]

## Commands to Resume

```bash
# Install dependencies (if needed)
npm install

# Start development
npm run dev

# Run tests
npm run test
```

## Critical Notes

- **API Key Location**: .env file with VITE_ prefix
- **Database Schema**: [Key details]
- **Known Issues**: [Any blockers or bugs]
- **Time Spent So Far**: [X] hours

## Files to Review First When Resuming

1. `src/App.tsx` - Entry point
2. `src/features/[current-feature]/` - Current work
3. `CLAUDE.md` - Development notes
4. `.env.example` - Required environment variables
```

## Success Indicators

- ✅ All required features documented
- ✅ Technical decisions captured
- ✅ Progress accurately reflected
- ✅ Next steps clearly defined
- ✅ Can resume development immediately

Save checkpoint to project root as `CHECKPOINT.md` for easy resumption.
