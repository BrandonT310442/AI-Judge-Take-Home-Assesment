# Debugging Evaluation Flow

## Issues Fixed
1. **Database field mapping**: Fixed camelCase to snake_case conversion for Supabase tables (createdAt → created_at)
2. **Added extensive logging**: Added console logs throughout the evaluation pipeline

## How to Debug Evaluations

### 1. Open Browser Console
Open your browser's developer console (F12 or right-click → Inspect → Console) before running evaluations.

### 2. Check Each Step

#### Step A: Upload Submissions
- Upload your JSON file
- Check console for errors about `createdAt` field (should be fixed now)

#### Step B: Create Judges
- Go to Judges page
- Create at least one judge with:
  - Name: "Test Judge"
  - System Prompt: "You are a fair evaluator"
  - Model: "llama-3.1-70b-versatile" (or any Groq model)
  - Active: ✅ checked

#### Step C: Assign Judges
1. Go to Queue Detail page
2. Select judges for each question
3. Click "Save Assignments"
4. Check console for:
   - `📝 Assigning X judges to question...`
   - `✅ Successfully assigned X judges`

#### Step D: Run Evaluations
1. Click "Run Evaluations"
2. Check console for:
   - `🚀 Starting evaluations for queue`
   - `📊 Found X submissions`
   - `⚖️ Found X judge assignments`
   - `🎯 Total evaluations to run: X`

### 3. Common Issues

#### No Evaluations Run (Total = 0)
**Cause**: No judges assigned or no active judges
**Fix**: 
- Make sure you clicked "Save Assignments" after selecting judges
- Check that judges are marked as "Active"
- Check console for `⚠️ No evaluations to run!`

#### API Key Not Configured
**Cause**: Missing GROQ_API_KEY
**Fix**: 
1. Get API key from https://console.groq.com/keys
2. Create `.env` file:
```
VITE_GROQ_API_KEY=your-key-here
```
3. Restart dev server

**Note**: Without API key, mock evaluations will be used (random pass/fail)

#### Supabase Errors
Check console for specific Supabase errors:
- "Could not find column" → Database schema mismatch
- "Permission denied" → Check Supabase RLS policies
- "Network error" → Check Supabase URL and anon key

### 4. Check Supabase Tables

Go to your Supabase dashboard and verify:

1. **judge_assignments** table has records with:
   - queue_id
   - question_id  
   - judge_id

2. **evaluations** table receives records with:
   - submission_id
   - question_id
   - judge_id
   - verdict
   - reasoning

### 5. Test Flow

1. Open console
2. Upload JSON
3. Create an active judge
4. Go to queue, assign judge to questions
5. Click "Save Assignments" 
6. Click "Run Evaluations"
7. Check console output
8. Check Supabase tables

The console will now show exactly where the process stops!