# AI Judge - Automated Answer Evaluation System

An intelligent evaluation platform that uses Large Language Models (LLMs) to automatically review and grade human-written answers at scale. Perfect for educational assessments, content quality control, and automated review workflows.

## 🎯 What It Does

AI Judge ingests batches of human-written answers to questions and automatically evaluates them using configurable AI judges powered by state-of-the-art language models. Each judge can be customized with specific evaluation criteria, and multiple judges can review the same answer for comprehensive assessment.

### Key Capabilities:
- **Batch Processing**: Upload hundreds of submissions in JSON format for automated evaluation
- **Multi-Judge System**: Assign multiple AI judges with different perspectives to evaluate the same content
- **Flexible Evaluation**: Supports various question types (multiple choice with reasoning, free text, etc.)
- **Detailed Feedback**: Get pass/fail verdicts with comprehensive AI-generated reasoning
- **Performance Analytics**: Track evaluation trends, pass rates, and judge effectiveness over time
- **Prompt Engineering**: Test and refine judge prompts in the integrated Playground

## 🚀 Core Features

### 1. **Submission Management**
- Upload JSON files containing questions and human answers
- Organize submissions into queues for systematic processing
- Support for multiple question types and answer formats
- Automatic validation and parsing of submission data

### 2. **AI Judge Configuration**
- Create custom judges with tailored evaluation criteria
- Configure system prompts to guide evaluation behavior
- Choose from multiple LLM providers (OpenAI GPT-4, Anthropic Claude, Llama)
- Activate/deactivate judges based on evaluation needs

### 3. **Intelligent Assignment**
- Assign specific judges to evaluate particular questions
- Support for multiple judges per question for consensus evaluation
- Queue-based organization for managing large evaluation workloads
- Flexible assignment strategies for different use cases

### 4. **Automated Evaluation**
- One-click batch evaluation of all assignments in a queue
- Parallel processing for efficient evaluation at scale
- Automatic retry logic for API failures
- Real-time progress tracking during evaluation runs

### 5. **Results & Analytics**
- Comprehensive results dashboard with filtering and search
- Visual analytics with charts showing:
  - Pass rate trends over time
  - Verdict distribution (pass/fail/inconclusive)
- Detailed evaluation views with AI reasoning
- Export capabilities for further analysis

### 6. **Prompt Playground**
- Interactive environment for testing and refining judge prompts
- Side-by-side comparison of different prompt versions
- Real-time token counting and cost estimation
- Sample answer testing before production deployment

## 💡 Use Cases

- **Educational Assessment**: Automatically grade student essays, short answers, and reasoning questions
- **Content Moderation**: Review user-generated content for quality and compliance
- **Customer Support QA**: Evaluate support agent responses for accuracy and helpfulness
- **Training Data Validation**: Verify quality of human-annotated data for ML training
- **Interview Screening**: Assess candidate responses in technical assessments
- **Research Surveys**: Analyze open-ended survey responses at scale

## 🛠 Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Realtime)
- **LLM Providers**: Groq
- **Data Visualization**: Recharts
- **State Management**: React Hooks + Context

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for backend)
- API keys for at least one LLM provider (OpenAI, Anthropic, or Groq)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/AI-Judge-Take-Home-Assessment.git
cd AI-Judge-Take-Home-Assessment
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
```
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

VITE_GROQ_API_KEY=your_groq_key
```


5. Start the development server:
```bash
npm run dev
```

## 📊 Data Format

Submissions should be in JSON format following this structure:

```json
[
  {
    "id": "submission_1",
    "queueId": "queue_1",
    "questions": [
      {
        "data": {
          "id": "q_1",
          "questionType": "single_choice_with_reasoning",
          "questionText": "Is the sky blue?"
        }
      }
    ],
    "answers": {
      "q_1": {
        "choice": "yes",
        "reasoning": "The sky appears blue due to Rayleigh scattering."
      }
    }
  }
]
```

## 🎮 Usage

1. **Upload Submissions**: Go to Dashboard and upload your JSON file
2. **Create Judges**: Configure AI judges with custom evaluation criteria
3. **Assign Judges**: Navigate to Queue Management and assign judges to questions
4. **Run Evaluations**: Click "Run Evaluations" to start the batch processing
5. **View Results**: Check the Results page for verdicts and analytics

## 🔑 Key Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter

# Testing
npm test            # Run tests (when configured)
```

## 📈 Performance

- Handles 100+ submissions per batch efficiently
- Parallel evaluation processing for optimal throughput
- Smart caching to reduce redundant API calls
- Responsive UI that remains smooth during large operations

## 🔒 Security

- Secure API key management through environment variables
- Row-level security in Supabase
- Input validation and sanitization
- Rate limiting for API calls

## 📝 License

This project is part of a take-home assessment and is for evaluation purposes.

## 🤝 Contributing

This is a take-home assessment project. For production deployment or contributions, please contact the repository owner.

## 📧 Support

For questions or issues related to this assessment, please open an issue in the repository.

---
