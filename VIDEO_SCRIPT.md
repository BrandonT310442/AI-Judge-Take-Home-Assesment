# AI Judge Demo Video Script

## Opening (0:00 - 0:30)

"Hi, I'm excited to present AI Judge, an intelligent evaluation platform that uses Large Language Models to automatically review and grade human-written answers at scale. 

This system solves a critical problem: when you need to evaluate hundreds or thousands of human responses - whether it's for educational assessments, content quality control, or training data validation - manual review becomes impossibly time-consuming and expensive. AI Judge automates this entire process while maintaining consistent evaluation standards."

## Dashboard Overview (0:30 - 1:00)

*[Navigate to Dashboard]*

"Let me start by showing you the Dashboard. This is the entry point where users upload their submission files. The system accepts JSON files containing questions and human answers in a structured format.

You can see here we have statistics showing the total number of queues, submissions, and judges in the system. Let me upload a sample file to demonstrate the workflow."

*[Click "Upload Submissions" and select sample_input.json]*

"The system automatically validates the JSON structure, parses the submissions, and organizes them into queues for processing. Each submission contains questions and their corresponding human answers that need evaluation."

## Judges Management (1:00 - 2:00)

*[Navigate to Judges page]*

"Now let's look at the Judges page. This is where we configure our AI evaluators. Each judge is essentially a specialized LLM with custom instructions for how to evaluate answers.

I'll create a new judge to show you the process."

*[Click "New Judge"]*

"We give it a name - let's call this 'Technical Accuracy Judge'. We can write a detailed system prompt that defines the evaluation criteria. For example, this judge might focus on technical correctness and depth of understanding.

We select the LLM model - I'm using Groq's Llama model for fast inference. And we can set whether the judge is active or not.

*[Save the judge]*

You can see we can have multiple judges with different perspectives - one might focus on grammar and clarity, another on factual accuracy, and another on reasoning quality. This multi-judge approach provides comprehensive evaluation from different angles."

## Queue Management & Judge Assignment (2:00 - 3:00)

*[Navigate to Queues, then click into a specific queue]*

"The Queue Management page is where we organize our evaluation workflow. Each queue contains submissions that need to be evaluated.

*[Switch to Assignments tab]*

Here's where the magic happens - we can assign specific judges to evaluate specific questions. For instance, I might want our Technical Accuracy Judge to evaluate technical questions, while a Language Quality Judge evaluates essay responses.

*[Demonstrate assigning judges to questions]*

You can assign multiple judges to the same question for consensus evaluation. This is particularly useful when you want high confidence in your evaluations."

## Running Evaluations (3:00 - 3:30)

*[Stay on Queue page]*

"Once judges are assigned, we can run the evaluation with a single click."

*[Click "Run Evaluations"]*

"The system now makes parallel API calls to the LLM provider, sending each question-answer pair along with the judge's instructions. It handles all the complexity of managing API rate limits, retries, and error handling.

You can see the progress in real-time. For large batches, this automated process saves hours or even days of manual review work."

## Results & Analytics (3:30 - 4:30)

*[Navigate to Results page]*

"The Results page is where all the evaluation data comes together. At the top, we have key statistics - total evaluations, pass rate, and breakdown by verdict.

Below that, we have visual analytics. The Pass Rate Trend chart shows performance over time - you can see if answer quality is improving or declining. The Verdict Distribution gives you a quick overview of the overall evaluation outcomes.

*[Scroll to results table]*

In the detailed results table, each row represents an evaluation. You can see:
- Which submission and question was evaluated
- Which judge performed the evaluation
- The verdict: pass, fail, or inconclusive
- The AI's reasoning for its decision

*[Click on a result to view details]*

Clicking on any result shows the complete evaluation details including the original question, the human's answer, the judge's instructions, and the full AI reasoning. This transparency is crucial for understanding and trusting the evaluation process.

*[Demonstrate filters]*

We have powerful filtering capabilities - you can filter by verdict, specific judges, or search within the reasoning text to find specific patterns or issues."

## Prompt Playground - The Differentiator (4:30 - 5:30)

*[Navigate to Prompt Playground]*

"Now I want to show you something special - the Prompt Playground. At my previous internship, I had experience running LLM evaluations with platforms like DeepEval and Atla. I was fortunate to talk with the founders and provide feedback on their products.

One of the things I thought would be incredibly valuable was a prompt playground that allows you to iteratively test and refine your judge prompts before deploying them. This feature lets you:

*[Demonstrate the Playground features]*

- Write and edit judge prompts in real-time with syntax highlighting
- Test against sample answers immediately to see how the judge would evaluate
- Compare different prompt versions side-by-side to see which performs better
- Count tokens and estimate costs before running large batches
- Save successful prompts as templates for future use

This iterative refinement process is crucial because the quality of your evaluations depends entirely on how well you've instructed your AI judges. Without this playground, you'd have to run expensive evaluations on your entire dataset just to test prompt changes.

*[Show the comparison feature]*

Here you can see I'm comparing two versions of a prompt - one that's more strict and one that's more lenient. The playground shows me exactly how each version would evaluate the same answer, helping me find the right balance."

## Technical Implementation Highlights (5:30 - 6:00)

*[Show the UI responsiveness and features while talking]*

"Under the hood, this application is built with modern technologies:
- React 18 with TypeScript for type-safe, maintainable code
- Supabase for the backend, providing real-time database updates and secure authentication
- Tailwind CSS with shadcn/ui components for a clean, professional interface
- Recharts for the data visualizations
- Optimized API calls with retry logic and error handling

The system is designed to scale - it can handle hundreds of evaluations efficiently through parallel processing and smart batching."

## Closing & Use Cases (6:00 - 6:30)

*[Return to Dashboard]*

"AI Judge transforms how organizations handle large-scale evaluation tasks. Whether you're:
- An educator grading hundreds of student essays
- A company evaluating customer support quality
- A researcher analyzing survey responses
- Or a team validating training data for machine learning

This platform saves time, ensures consistency, and provides detailed insights into your evaluation results.

The combination of flexible judge configuration, batch processing capabilities, comprehensive analytics, and the innovative prompt playground makes AI Judge a powerful tool for any organization dealing with large-scale human answer evaluation.

Thank you for watching this demo. The system is fully functional and ready for deployment."

---

## Demo Tips:

1. **Keep energy high** - This is a tool that saves massive amounts of time, be enthusiastic about it
2. **Use real examples** - Have sample data ready that shows realistic use cases
3. **Show smooth transitions** - Practice navigating between pages smoothly
4. **Highlight unique features** - Especially emphasize the Prompt Playground as your innovation
5. **Keep it under 7 minutes** - Be concise but comprehensive

## Key Points to Emphasize:

- **Scale**: Handles hundreds/thousands of evaluations automatically
- **Flexibility**: Multiple judges with different evaluation criteria
- **Transparency**: Detailed reasoning for every evaluation
- **Innovation**: Prompt Playground for iterative refinement
- **Professional**: Clean, intuitive UI that's production-ready

## Technical Points to Mention (if asked):

- Fully responsive design
- Real-time updates via Supabase
- Secure API key management
- Input validation and error handling
- Extensible architecture for adding new LLM providers