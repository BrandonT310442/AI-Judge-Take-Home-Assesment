---
allowed-tools: [Read, Write, Grep, Glob, LS, Task, Bash]
---

# Ship - Finalize and Deploy AI Judge Implementation

Prepares the AI Judge application for submission and deployment, ensuring all requirements are met and deliverables are ready.

# Usage

- `ship` - Complete final checks and prepare submission materials for the AI Judge take-home

# Process

## 1. Run Final Tests & Checks

**Execute all test suites:**
```bash
npm run test        # Run unit tests
npm run lint        # Check code quality
npm run typecheck   # Verify TypeScript types
npm run build       # Ensure production build works
```

**Verify core functionality:**
- Data ingestion works with sample_input.json
- Judges can be created, edited, and deactivated
- Judge assignment UI functions correctly
- LLM API calls execute successfully
- Results display with proper filtering

## 2. Performance & Quality Checks

**Frontend Performance:**
- Bundle size is reasonable (< 1MB for initial load)
- First Contentful Paint < 2s
- No console errors or warnings
- All features work in production build

**Code Quality:**
- TypeScript types are accurate (minimal `any`)
- Components are well-organized and reusable
- Error handling is comprehensive
- Loading states are implemented throughout

## 3. Documentation Review

**Verify required documentation:**
- README.md includes:
  - Installation instructions
  - `npm run dev` command
  - Architecture overview
  - Time spent on project
  - Trade-offs made
- CLAUDE.md accurately reflects implementation
- API keys setup instructions are clear

## 4. Create Demo Recording

**Record Loom/GIF showing:**
1. Import sample data (JSON upload)
2. Judges CRUD operations
3. Judge assignment to questions
4. Run evaluations with LLM
5. Results view with filters
6. Any bonus features implemented

**Demo should highlight:**
- Smooth UX with loading states
- Error handling in action
- Pass/fail statistics
- Filter functionality

## 5. Final Submission Checklist

### Required Deliverables:
- [ ] Vite project with React 18 + TypeScript
- [ ] All source code committed
- [ ] README with setup instructions
- [ ] Demo recording (Loom/GIF)
- [ ] Time spent documented

### Functional Requirements Met:
- [ ] JSON file upload and parsing
- [ ] Data persisted in backend (not localStorage)
- [ ] AI Judge CRUD with persistence
- [ ] Judge assignment UI per question
- [ ] LLM API integration (real calls)
- [ ] Evaluation records stored
- [ ] Results page with filters
- [ ] Pass rate statistics displayed

### Bonus Features (if implemented):
- [ ] File attachments support
- [ ] Configurable prompt fields
- [ ] Animated charts
- [ ] Additional features

## 6. Pre-Submission Verification

**Start fresh and verify:**
```bash
# Clean install
rm -rf node_modules
npm install

# Start development server
npm run dev

# Verify it opens on http://localhost:5173
```

**Test with sample data:**
- Upload sample_input.json
- Create a test judge
- Assign to a question
- Run evaluation
- Check results

## 7. Package for Submission

**Create submission package:**
```bash
# Clean unnecessary files
rm -rf node_modules
rm -rf dist
rm -rf .parcel-cache

# Create zip excluding large files
zip -r ai-judge-submission.zip . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*dist*" \
  -x "*.DS_Store"
```

## 8. Final Email Preparation

**Email to: hiring@besimple.ai**

**Subject:** AI Judge Submission - [Your Name]

**Include:**
- Demo recording URL
- GitHub repository link (if public)
- Or attached zip file
- Time spent: ~X hours
- Key trade-offs/decisions made

## Quality Metrics

Ensure submission meets evaluation criteria:

### Correctness
- All features work without crashes
- Handles edge cases gracefully
- Sample data processes correctly

### Backend & LLM
- Clean persistence layer
- Proper LLM provider integration
- Error handling for API failures

### Code Quality
- Clear naming conventions
- Small, focused components
- Idiomatic React patterns

### Types & Safety
- Accurate TypeScript types
- Minimal use of `any`
- Proper null checking

### UX & Polish
- Usable, intuitive layout
- Loading and empty states
- Responsive design

### Judgment & Trade-offs
- Clear reasoning in README
- Appropriate scope decisions
- Well-documented choices

## Common Last-Minute Issues

### Environment Variables
- Ensure .env.example exists
- Document required API keys
- Test with fresh environment

### Build Issues
- Fix any TypeScript errors
- Resolve dependency conflicts
- Ensure Vite config is correct

### Demo Recording
- Test audio quality
- Keep under 5 minutes
- Show all key features

## Success Criteria

-  Application runs with `npm run dev`
-  Opens on http://localhost:5173
-  All requirements implemented
-  Demo clearly shows functionality
-  Documentation is complete
-  Code is clean and maintainable
-  Submission package ready

The goal is a polished, working AI Judge application that demonstrates clean code, good UX, and solid engineering judgment.