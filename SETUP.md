# AI Judge Setup Guide

## Quick Start (Mock Mode)

The application works out of the box with mock data:

```bash
npm install
npm run dev
```

Visit http://localhost:5173 to use the application with mock data.

## Full Backend Setup

To enable the real backend with Supabase and Groq API:

### 1. Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor in your project dashboard
4. Copy and paste the entire contents of `src/database/supabase-schema.sql.md` 
5. Execute the SQL to create all tables and functions
6. Go to Settings → API to get your:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - Anon/Public Key

### 2. Groq API Setup

1. Create a free account at [console.groq.com](https://console.groq.com)
2. Generate an API key from the dashboard
3. Copy the API key for the next step

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Groq API Configuration  
VITE_GROQ_API_KEY=your-groq-api-key-here

# Optional: App URL
VITE_APP_URL=http://localhost:5173
```

### 4. Restart the Development Server

```bash
npm run dev
```

The application will automatically detect the environment variables and switch from mock mode to using the real backend.

## Testing the Setup

1. **Upload Submissions**: Use the provided `sample_input.json` file on the Dashboard
2. **Create Judges**: Go to Judges page and create AI judges with:
   - Name: e.g., "Strict Grader"
   - System Prompt: Instructions for the AI judge
   - Model: `openai/gpt-oss-120b` (recommended) or `openai/gpt-oss-20b` (faster)
3. **Assign Judges**: Navigate to a queue and assign judges to questions
4. **Run Evaluations**: Click "Run Evaluations" to process submissions
5. **View Results**: Check the Results page for evaluation outcomes

## Features by Mode

### Mock Mode (No Configuration)
- ✅ Full UI functionality
- ✅ Sample data for testing
- ✅ Instant responses
- ❌ No persistence between sessions
- ❌ No real AI evaluations

### Full Backend Mode (With Configuration)
- ✅ Full UI functionality  
- ✅ Persistent data in Supabase
- ✅ Real AI evaluations via Groq
- ✅ Production-ready
- ⚠️ API rate limits apply

## Troubleshooting

### Application stays in mock mode
- Check that `.env.local` exists and contains valid keys
- Ensure all environment variables start with `VITE_`
- Restart the dev server after adding environment variables

### Supabase connection errors
- Verify your project URL and anon key are correct
- Check that the SQL schema was executed successfully
- Ensure your Supabase project is active

### Groq API errors
- Verify your API key is valid
- Check API rate limits (free tier has limits)
- Note: Groq may not support all OpenAI models directly

## Available Models

- **openai/gpt-oss-120b** - Best performance, 131K context window (recommended)
- **openai/gpt-oss-20b** - Faster alternative, good balance of speed and quality

Note: These models are accessed through Groq's API which supports OpenAI-compatible model names.