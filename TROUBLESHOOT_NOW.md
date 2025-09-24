# Troubleshooting Judge Assignments

Based on your logs, the issue is: **Judge assignments are not being saved to Supabase**

## Quick Fix Steps:

### 1. Check if you have an active judge
Go to the Judges page and ensure:
- You have at least one judge created
- The judge's "Active" toggle is ON (green)
- Use model: `llama-3.1-70b-versatile`

### 2. Verify Judge Assignment Process

1. Go to Queue Detail page
2. Open browser console (F12)
3. Check the checkboxes next to judge names for each question
4. You should see in console: `Current selectedJudges state: {q_template_1: Set(1) {...}}`
5. **IMPORTANT**: Click "Save Assignments" button
6. Look for these logs:
   - `Saving judge assignments for queue: queue_1`
   - `Assigning X judges to question q_template_1`
   - `📝 Assigning X judges to question...`
   - `✅ Successfully assigned X judges`

### 3. Check Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to Table Editor → `judge_assignments`
3. After saving assignments, you should see records with:
   - `queue_id`: queue_1
   - `question_id`: q_template_1
   - `judge_id`: (UUID of your judge)

### 4. Common Issues & Fixes

#### Issue: No logs when clicking "Save Assignments"
**Fix**: Make sure you've selected at least one judge checkbox

#### Issue: Error about "created_at" field
**Fix**: Already fixed - pull latest code

#### Issue: Judges not showing in assignment list
**Fix**: Make sure judges are marked as "Active" in Judges page

#### Issue: "Could not find judge" error
**Fix**: The judge might have been deleted - create a new one

### 5. Test the Full Flow

1. **Create a Judge** (if you haven't):
   - Name: "Test Judge"
   - System Prompt: "Evaluate answers fairly"
   - Model: `llama-3.1-70b-versatile`
   - Active: ✅ ON

2. **Assign the Judge**:
   - Go to Queue Detail
   - Check the checkbox for "Test Judge" under each question
   - Click "Save Assignments"
   - Wait for success log

3. **Run Evaluations**:
   - Click "Run Evaluations"
   - Check console for:
     - `🎯 Total evaluations to run: X` (should be > 0)
     - `🔄 Processing X evaluation tasks`

### 6. Debug SQL

If assignments still aren't saving, run this in Supabase SQL Editor to check:

```sql
-- Check if judge_assignments table exists
SELECT * FROM judge_assignments;

-- Check if judges exist
SELECT id, name, is_active FROM judges;

-- Check if queues exist
SELECT id, name FROM queues;

-- Manually insert a test assignment (replace UUIDs)
INSERT INTO judge_assignments (queue_id, question_id, judge_id)
VALUES ('queue_1', 'q_template_1', 'YOUR-JUDGE-UUID-HERE');
```

## The Key Issue

From your logs: `⚖️ Found 0 judge assignments`

This means the assignments aren't being saved. The most likely causes:
1. You didn't click "Save Assignments" after selecting judges
2. The judge UUIDs aren't matching (check if judges exist)
3. Supabase permission issue (check RLS policies)

## Next Steps

1. Open browser console
2. Select judges for questions
3. Click "Save Assignments" 
4. **Watch for the console logs**
5. If you see errors, paste them here

The new logging will show exactly where it's failing!