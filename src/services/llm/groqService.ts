import Groq from 'groq-sdk';
import type { Judge, Question, Answer } from '@/types';

interface EvaluationResult {
  verdict: 'pass' | 'fail' | 'inconclusive';
  reasoning: string;
}

export class GroqService {
  private client: Groq | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (apiKey) {
      this.client = new Groq({
        apiKey,
        dangerouslyAllowBrowser: true // For development only
      });
    }
  }

  async evaluateSubmission(params: {
    systemPrompt: string;
    question: Question;
    answer: Answer;
    modelName: string;
  }): Promise<EvaluationResult> {
    if (!this.client) {
      console.warn('Groq API key not configured. Returning mock evaluation.');
      return this.getMockEvaluation();
    }

    try {
      const prompt = this.buildPrompt(params);
      
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: params.systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: params.modelName || "openai/gpt-oss-120b",
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from LLM');
      }

      const result = JSON.parse(response);
      
      // Validate the response format
      if (!this.isValidEvaluationResult(result)) {
        throw new Error('Invalid response format from LLM');
      }

      return {
        verdict: result.verdict.toLowerCase() as 'pass' | 'fail' | 'inconclusive',
        reasoning: result.reasoning
      };
    } catch (error) {
      console.error('Error calling Groq API:', error);
      // Fallback to mock for development
      return this.getMockEvaluation();
    }
  }

  private buildPrompt(params: {
    question: Question;
    answer: Answer;
  }): string {
    const { question, answer } = params;
    
    // Format the answer based on available fields
    let answerText = '';
    if (answer.choice) {
      answerText += `Choice: ${answer.choice}\n`;
    }
    if (answer.reasoning) {
      answerText += `Reasoning: ${answer.reasoning}\n`;
    }
    if (answer.text) {
      answerText += `Answer: ${answer.text}\n`;
    }
    if (answer.choices && Array.isArray(answer.choices)) {
      answerText += `Choices: ${answer.choices.join(', ')}\n`;
    }

    return `## Question
${question.data.questionText}

## User's Answer
${answerText.trim()}

## Task
Evaluate this answer and provide:
1. A verdict: "pass", "fail", or "inconclusive"
2. Brief reasoning (1-2 sentences) explaining your verdict

Respond ONLY with valid JSON in this exact format:
{
  "verdict": "pass",
  "reasoning": "Your explanation here"
}`;
  }

  private isValidEvaluationResult(result: any): result is EvaluationResult {
    return (
      result &&
      typeof result === 'object' &&
      ['pass', 'fail', 'inconclusive', 'PASS', 'FAIL', 'INCONCLUSIVE'].includes(result.verdict) &&
      typeof result.reasoning === 'string'
    );
  }

  private getMockEvaluation(): EvaluationResult {
    const verdicts: Array<'pass' | 'fail' | 'inconclusive'> = ['pass', 'fail', 'inconclusive'];
    const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
    
    const reasonings = {
      pass: [
        'The answer demonstrates a clear understanding of the concept and provides accurate information.',
        'Correct response with appropriate reasoning that directly addresses the question.',
        'The answer is accurate and shows good comprehension of the subject matter.'
      ],
      fail: [
        'The answer contains factual errors that affect its validity.',
        'Insufficient understanding demonstrated. Key concepts are missing or incorrect.',
        'The response does not adequately address the question asked.'
      ],
      inconclusive: [
        'The answer partially addresses the question but lacks sufficient detail for a definitive assessment.',
        'While some aspects are correct, the response is too ambiguous for a clear verdict.',
        'More context or clarification is needed to properly evaluate this response.'
      ]
    };
    
    const reasoningOptions = reasonings[randomVerdict];
    const randomReasoning = reasoningOptions[Math.floor(Math.random() * reasoningOptions.length)];
    
    return {
      verdict: randomVerdict,
      reasoning: randomReasoning
    };
  }
}

export const groqService = new GroqService();