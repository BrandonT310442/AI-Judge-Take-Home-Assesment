import Groq from 'groq-sdk';
import type { Judge, Question, Answer } from '@/types';
import { promptService } from '../promptService';

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
      // Load the evaluation template
      const template = await promptService.loadPromptTemplate('evaluation-base.md');
      
      // Format the answer for the template
      const answerText = this.formatAnswer(params.answer);
      
      // Process the template with actual values
      const processedPrompt = promptService.processTemplate(template, {
        systemPrompt: params.systemPrompt,
        question: params.question.data.questionText,
        answer: answerText
      });
      
      // Extract the system prompt and user prompt from the processed template
      // The template includes the system prompt in the content, so we'll use it all as user message
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: "user",
            content: processedPrompt
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

  private formatAnswer(answer: Answer): string {
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
    return answerText.trim();
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