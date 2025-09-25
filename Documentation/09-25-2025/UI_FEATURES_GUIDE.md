# AI Judge UI Features Guide

## How to Test All Features

### 1. Data Ingestion (Dashboard - `/`)
- Go to the Dashboard
- Drag and drop or click to upload `sample_input.json` or `test_data.json`
- The file will be parsed and submissions will be added to the system
- You'll see a success message and the stats will update

### 2. AI Judge Management (Judges - `/judges`)
- Click on "Judges" in the sidebar
- Click "New Judge" button to create a judge
  - Enter a name (e.g., "Grammar Expert")
  - Select a model (dropdown with GPT-4, Claude, Gemini options)
  - Write a system prompt/rubric
  - Toggle active/inactive status
  - Click "Create Judge"
- To edit: Click the three dots menu on any judge card and select "Edit"
- To deactivate: Click the three dots menu and select "Deactivate"
- To delete: Click the three dots menu and select "Delete"

### 3. Queue Management & Judge Assignment (Queues - `/queues`)
- Click on "Queues" in the sidebar
- Click "View Queue" on any queue card
- In the queue detail page (`/queue/:queueId`):
  - Switch to "Judge Assignments" tab
  - For each question, check the boxes to assign judges
  - Click "Save Assignments" to persist the selections
  - You can assign multiple judges to each question

### 4. Running Evaluations (Queue Detail Page)
- After assigning judges, click "Run Evaluations" button
- Watch the progress bar as evaluations are simulated
- See the summary of planned/completed/failed counts
- When complete, you'll be redirected to the Results page

### 5. Results View (Results - `/results`)
- Click on "Results" in the sidebar
- View the aggregate pass rate at the top (e.g., "42% pass of 120 evaluations")
- Use the search bar to search evaluations
- Click "Filters" button to open the filter panel:
  - **Verdict Filter**: Select pass/fail/inconclusive
  - **Judge Filter**: Multi-select judges
  - **Question Filter**: Multi-select questions
  - Click "Apply Filters" to apply
  - Click "Clear All" to reset filters
- The table shows: Submission, Question, Judge, Verdict, Reasoning, and Created timestamp
- Statistics cards show total evaluations, pass rate, and breakdown

### 6. Submissions View (Submissions - `/submissions`)
- Click on "Submissions" in the sidebar
- View all uploaded submissions with their questions and answers
- See submission metadata like queue, timestamp, and question count

## Mock Data Features

The app comes with pre-loaded mock data to demonstrate functionality:
- 4 pre-configured judges (3 active, 1 inactive)
- 3 sample queues with submissions
- 5 sample evaluations with different verdicts
- Judge assignments for demonstration

## Testing Workflow

1. **Upload Data**: Go to Dashboard → Upload `test_data.json`
2. **Create Judge**: Go to Judges → Click "New Judge" → Fill form → Create
3. **Assign Judges**: Go to Queues → Select a queue → Assign judges to questions → Save
4. **Run Evaluations**: Click "Run Evaluations" → Watch progress → Auto-redirect to Results
5. **View Results**: Apply filters → Search → View statistics

All UI components are fully functional with mock data handling, demonstrating the complete user flow even without a real backend.