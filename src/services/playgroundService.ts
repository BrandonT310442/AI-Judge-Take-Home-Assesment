import { nanoid } from 'nanoid';
import { groqService } from './llm/groqService';
import tokenizerService from './tokenizer';
import type { Question, Answer } from '@/types';

export interface SampleAnswer {
  id: string;
  name: string;
  questionType: string;
  question: string;
  answer: {
    choice?: string;
    reasoning?: string;
    text?: string;
    choices?: string[];
  };
  expectedVerdict?: 'pass' | 'fail' | 'inconclusive';
}

export interface PlaygroundEvaluationResult {
  sampleId: string;
  verdict?: 'pass' | 'fail' | 'inconclusive';
  reasoning?: string;
  confidence?: number;
  tokensUsed?: number;
  latency?: number;
  matchesExpected?: boolean;
  error?: string;
  timestamp: number;
}

export interface PromptVersion {
  id: string;
  content: string;
  timestamp: number;
  results?: PlaygroundEvaluationResult[];
  metadata: {
    model: string;
    tokenCount: number;
    avgLatency?: number;
    successRate?: number;
    totalCost?: number;
  };
}

// Default sample answers for testing
export const DEFAULT_SAMPLES: SampleAnswer[] = [
  {
    id: 'sample_1',
    name: 'Correct Scientific Answer',
    questionType: 'single_choice_with_reasoning',
    question: 'Is the sky blue?',
    answer: {
      choice: 'yes',
      reasoning: 'Due to Rayleigh scattering, shorter blue wavelengths of sunlight are scattered more than other colors by molecules in Earth\'s atmosphere, making the sky appear blue during daytime.',
    },
    expectedVerdict: 'pass',
  },
  {
    id: 'sample_2',
    name: 'Incorrect Answer',
    questionType: 'single_choice_with_reasoning',
    question: 'Is the sky blue?',
    answer: {
      choice: 'no',
      reasoning: 'The sky is green because of chlorophyll in the atmosphere.',
    },
    expectedVerdict: 'fail',
  },
  {
    id: 'sample_3',
    name: 'Ambiguous Answer',
    questionType: 'single_choice_with_reasoning',
    question: 'Is the sky blue?',
    answer: {
      choice: 'yes',
      reasoning: 'Sometimes it is, sometimes it isn\'t.',
    },
    expectedVerdict: 'inconclusive',
  },
  {
    id: 'sample_4',
    name: 'Mathematical Problem',
    questionType: 'free_form',
    question: 'What is 2 + 2?',
    answer: {
      text: '4',
    },
    expectedVerdict: 'pass',
  },
  {
    id: 'sample_5',
    name: 'Complex Reasoning',
    questionType: 'free_form',
    question: 'Explain the concept of recursion in programming.',
    answer: {
      text: 'Recursion is a programming technique where a function calls itself to solve a problem by breaking it down into smaller, similar sub-problems. It requires a base case to stop the recursion and prevent infinite loops.',
    },
    expectedVerdict: 'pass',
  },
];

class PlaygroundService {
  private versionHistory: PromptVersion[] = [];
  private evaluationCache = new Map<string, PlaygroundEvaluationResult>();

  async evaluateSample(
    prompt: string,
    sample: SampleAnswer,
    model: string,
    temperature: number = 0.3,
    maxTokens: number = 500
  ): Promise<PlaygroundEvaluationResult> {
    const startTime = Date.now();
    const cacheKey = `${prompt}:${JSON.stringify(sample)}:${model}`;
    
    // Check cache first
    if (this.evaluationCache.has(cacheKey)) {
      const cached = this.evaluationCache.get(cacheKey)!;
      return { ...cached, latency: 0 }; // 0 latency for cached results
    }

    try {
      // Format the question and answer for evaluation
      const question: Question = {
        rev: 1,
        data: {
          id: sample.id,
          questionType: sample.questionType,
          questionText: sample.question
        }
      };

      const answer: Answer = sample.answer;

      // Call the LLM service
      const result = await groqService.evaluateSubmission({
        systemPrompt: prompt,
        question,
        answer,
        modelName: model
      });

      const latency = Date.now() - startTime;
      const tokensUsed = tokenizerService.countTokens(prompt + sample.question + JSON.stringify(sample.answer), model);
      
      // Extract confidence if mentioned in reasoning
      const confidence = this.extractConfidence(result.reasoning);
      
      const evaluationResult: PlaygroundEvaluationResult = {
        sampleId: sample.id,
        verdict: result.verdict,
        reasoning: result.reasoning,
        confidence,
        tokensUsed,
        latency,
        matchesExpected: sample.expectedVerdict ? result.verdict === sample.expectedVerdict : undefined,
        timestamp: Date.now()
      };

      // Cache the result
      if (this.evaluationCache.size > 50) {
        const firstKey = this.evaluationCache.keys().next().value;
        this.evaluationCache.delete(firstKey);
      }
      this.evaluationCache.set(cacheKey, evaluationResult);

      return evaluationResult;
    } catch (error: any) {
      return {
        sampleId: sample.id,
        error: error.message || 'Failed to evaluate',
        timestamp: Date.now(),
        latency: Date.now() - startTime
      };
    }
  }

  async evaluateMultipleSamples(
    prompt: string,
    samples: SampleAnswer[],
    model: string,
    temperature: number = 0.3,
    maxTokens: number = 500,
    onProgress?: (completed: number, total: number) => void
  ): Promise<PlaygroundEvaluationResult[]> {
    const results: PlaygroundEvaluationResult[] = [];
    
    for (let i = 0; i < samples.length; i++) {
      const result = await this.evaluateSample(prompt, samples[i], model, temperature, maxTokens);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, samples.length);
      }
    }
    
    return results;
  }

  saveVersion(
    content: string,
    model: string,
    results?: PlaygroundEvaluationResult[]
  ): PromptVersion {
    const tokenCount = tokenizerService.countTokens(content, model);
    const totalCost = results 
      ? results.reduce((sum, r) => sum + (r.tokensUsed ? tokenizerService.estimateCost(r.tokensUsed, null, model) : 0), 0)
      : 0;
    
    const version: PromptVersion = {
      id: nanoid(),
      content,
      timestamp: Date.now(),
      results,
      metadata: {
        model,
        tokenCount,
        avgLatency: results ? this.calculateAvgLatency(results) : undefined,
        successRate: results ? this.calculateSuccessRate(results) : undefined,
        totalCost
      }
    };
    
    // Keep only last 10 versions
    this.versionHistory = [version, ...this.versionHistory].slice(0, 10);
    return version;
  }

  getVersionHistory(): PromptVersion[] {
    return this.versionHistory;
  }

  getVersionById(id: string): PromptVersion | undefined {
    return this.versionHistory.find(v => v.id === id);
  }

  compareVersions(version1Id: string, version2Id: string) {
    const v1 = this.getVersionById(version1Id);
    const v2 = this.getVersionById(version2Id);
    
    if (!v1 || !v2) {
      throw new Error('Version not found');
    }
    
    return {
      version1: v1,
      version2: v2,
      tokenDiff: v2.metadata.tokenCount - v1.metadata.tokenCount,
      successRateDiff: (v2.metadata.successRate || 0) - (v1.metadata.successRate || 0),
      latencyDiff: (v2.metadata.avgLatency || 0) - (v1.metadata.avgLatency || 0),
      costDiff: (v2.metadata.totalCost || 0) - (v1.metadata.totalCost || 0)
    };
  }

  private extractConfidence(reasoning: string): number | undefined {
    // Look for confidence patterns in the reasoning
    const patterns = [
      /(\d+)%\s*confident/i,
      /confidence:\s*(\d+)%/i,
      /certainty:\s*(\d+)%/i,
      /sure:\s*(\d+)%/i
    ];
    
    for (const pattern of patterns) {
      const match = reasoning.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1]) / 100;
      }
    }
    
    // Estimate confidence based on keywords
    const highConfidenceWords = ['clearly', 'definitely', 'certainly', 'obviously', 'undoubtedly'];
    const lowConfidenceWords = ['possibly', 'maybe', 'perhaps', 'might', 'could be', 'unclear'];
    
    const reasoningLower = reasoning.toLowerCase();
    
    if (highConfidenceWords.some(word => reasoningLower.includes(word))) {
      return 0.9;
    }
    if (lowConfidenceWords.some(word => reasoningLower.includes(word))) {
      return 0.5;
    }
    
    return 0.75; // Default moderate confidence
  }

  private calculateAvgLatency(results: PlaygroundEvaluationResult[]): number {
    const latencies = results.filter(r => r.latency).map(r => r.latency!);
    if (latencies.length === 0) return 0;
    return latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
  }

  private calculateSuccessRate(results: PlaygroundEvaluationResult[]): number {
    const withExpected = results.filter(r => r.matchesExpected !== undefined);
    if (withExpected.length === 0) return 0;
    const matches = withExpected.filter(r => r.matchesExpected).length;
    return matches / withExpected.length;
  }

  clearCache() {
    this.evaluationCache.clear();
  }

  clearHistory() {
    this.versionHistory = [];
  }
}

export const playgroundService = new PlaygroundService();
export default playgroundService;