---
allowed-tools: [Read, Write, Grep, Glob, LS, Task, Bash]
---

# Resume From Checkpoint - Continue AI Judge Development

Quickly resume AI Judge development from a saved checkpoint.

# Usage

- `resume-from-checkpoint` - Resume from CHECKPOINT.md in root
- `resume-from-checkpoint {{FILE}}` - Resume from specific checkpoint file

# Process

## 1. Load Checkpoint

**Read checkpoint file** containing:
- Project completion status
- Features implementation progress
- Technical decisions made
- Environment configuration
- Next priority tasks

## 2. Verify Environment

```bash
# Check project structure
ls -la src/

# Verify dependencies installed
npm list

# Check environment variables
cat .env

# Test development server
npm run dev
```

## 3. Review Implementation Status

**Check completed features:**
- Data ingestion implementation
- Judge management CRUD
- Evaluation runner
- Results view

**Identify current work:**
- Feature being implemented
- Files recently modified
- Known issues to address

## 4. Restore Context

### Quick File Reviews
```typescript
// Review main application entry
src/App.tsx

// Check current feature implementation
src/features/[current-feature]/

// Review service integrations
src/services/database/
src/services/llm/

// Check type definitions
src/types/
```

### Technical Stack Verification
- Database connection (Firebase/Supabase/SQLite)
- LLM provider setup (OpenAI/Anthropic/Gemini)
- State management approach
- UI component library

## 5. Continue Development

**Based on checkpoint priority tasks:**

### If working on Data Ingestion:
```bash
# Test file upload
# Verify JSON parsing
# Check database persistence
```

### If working on Judge Management:
```bash
# Test CRUD operations
# Verify form validation
# Check persistence
```

### If working on Evaluation:
```bash
# Test LLM API calls
# Verify prompt construction
# Check result storage
```

### If working on Results:
```bash
# Test filtering
# Verify statistics calculation
# Check data display
```

## 6. Resume Output Format

```markdown
## AI Judge Development Resumed

### Project Status
- **Completion**: [X]% complete
- **Current Phase**: [Phase name]
- **Time invested**: [X] hours

### Current Focus
- **Feature**: [Feature being worked on]
- **Task**: [Specific task to complete]
- **Blockers**: [Any issues to resolve]

### Environment Status
- \u2705 Dependencies installed
- \u2705 Database connected
- \u2705 API keys configured
- \u2705 Dev server running

### Next Actions
1. [Immediate task]
2. [Following task]
3. [Subsequent task]

### Key Files to Modify
- `[file1]` - [What to change]
- `[file2]` - [What to implement]
- `[file3]` - [What to fix]

Ready to continue AI Judge development!
```

## Common Resumption Scenarios

### Scenario 1: Mid-Feature Implementation
```bash
# Continue implementing current feature
cd src/features/[current-feature]
# Review existing code
# Complete remaining functionality
```

### Scenario 2: After Core Features Complete
```bash
# Focus on integration and polish
# Test all features together
# Improve error handling
# Enhance UI/UX
```

### Scenario 3: Ready for Testing
```bash
# Run test suite
npm run test
# Fix any failures
# Add missing tests
```

### Scenario 4: Documentation Phase
```bash
# Update README.md
# Complete CLAUDE.md
# Record demo
# Prepare submission
```

## Validation Checklist

After resuming:
- \u2713 Development server starts successfully
- \u2713 Can upload sample_input.json
- \u2713 Judge CRUD operations work
- \u2713 Evaluation can be triggered
- \u2713 Results display correctly

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview build

# Testing
npm run test            # Run tests
npm run lint            # Check code quality
npm run typecheck       # Verify TypeScript

# Git
git status              # Check changes
git add -A              # Stage all changes
git commit -m "msg"     # Commit changes
```

## Troubleshooting

### If database connection fails:
- Check .env variables
- Verify service credentials
- Test connection independently

### If LLM API fails:
- Verify API key
- Check rate limits
- Test with curl/Postman

### If build fails:
- Clear node_modules
- Reinstall dependencies
- Check for TypeScript errors

## Success Criteria

- \u2705 Context fully restored
- \u2705 Can continue development immediately
- \u2705 All previous work preserved
- \u2705 Clear understanding of next steps
- \u2705 No time wasted on re-discovery

The goal is seamless continuation of AI Judge development with minimal context-switching overhead.