import { nanoid } from 'nanoid';
import { groqService } from './llm/groqService';
import tokenizerService from './tokenizer';
import { supabase } from './supabase/client';
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
    temperature?: number;
    maxTokens?: number;
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
      
      const evaluationResult: PlaygroundEvaluationResult = {
        sampleId: sample.id,
        verdict: result.verdict,
        reasoning: result.reasoning,
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

  async saveVersion(
    content: string,
    model: string,
    results?: PlaygroundEvaluationResult[],
    temperature: number = 0.3,
    maxTokens: number = 500
  ): Promise<PromptVersion> {
    const tokenCount = tokenizerService.countTokens(content, model);
    const totalCost = results 
      ? results.reduce((sum, r) => sum + (r.tokensUsed ? tokenizerService.estimateCost(r.tokensUsed, null, model) : 0), 0)
      : 0;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user) {
        // Save to Supabase if authenticated
        const { data, error } = await supabase
          .from('prompt_versions')
          .insert({
            content,
            model,
            temperature,
            max_tokens: maxTokens,
            token_count: tokenCount,
            results: results || null,
            metadata: {
              avgLatency: results ? this.calculateAvgLatency(results) : undefined,
              successRate: results ? this.calculateSuccessRate(results) : undefined,
              totalCost
            },
            user_id: session.session.user.id
          })
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          content: data.content,
          timestamp: new Date(data.created_at).getTime(),
          results: data.results,
          metadata: {
            model: data.model,
            tokenCount: data.token_count,
            temperature: data.temperature,
            maxTokens: data.max_tokens,
            avgLatency: data.metadata?.avgLatency,
            successRate: data.metadata?.successRate,
            totalCost: data.metadata?.totalCost
          }
        };
      }
    } catch (error) {
      console.error('Error saving version to Supabase:', error);
    }
    
    // Fallback to localStorage if not authenticated or error
    const version: PromptVersion = {
      id: nanoid(),
      content,
      timestamp: Date.now(),
      results,
      metadata: {
        model,
        tokenCount,
        temperature,
        maxTokens,
        avgLatency: results ? this.calculateAvgLatency(results) : undefined,
        successRate: results ? this.calculateSuccessRate(results) : undefined,
        totalCost
      }
    };
    
    // Store in localStorage as fallback
    const stored = localStorage.getItem('playground_versions');
    let versions: PromptVersion[] = [];
    if (stored) {
      try {
        versions = JSON.parse(stored);
      } catch {
        versions = [];
      }
    }
    versions = [version, ...versions].slice(0, 20);
    localStorage.setItem('playground_versions', JSON.stringify(versions));
    
    return version;
  }

  async getVersionHistory(): Promise<PromptVersion[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user) {
        const { data, error } = await supabase
          .from('prompt_versions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        return (data || []).map(row => ({
          id: row.id,
          content: row.content,
          timestamp: new Date(row.created_at).getTime(),
          results: row.results,
          metadata: {
            model: row.model,
            tokenCount: row.token_count,
            temperature: row.temperature,
            maxTokens: row.max_tokens,
            avgLatency: row.metadata?.avgLatency,
            successRate: row.metadata?.successRate,
            totalCost: row.metadata?.totalCost
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching version history from Supabase:', error);
    }
    
    // Fallback to localStorage if not authenticated or error
    const stored = localStorage.getItem('playground_versions');
    if (!stored) return [];
    
    try {
      const versions = JSON.parse(stored) as PromptVersion[];
      return versions.slice(0, 20);
    } catch {
      return [];
    }
  }

  async getVersionById(id: string): Promise<PromptVersion | undefined> {
    const versions = await this.getVersionHistory();
    return versions.find(v => v.id === id);
  }

  async deleteVersion(id: string): Promise<void> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user) {
        // Delete from Supabase if authenticated
        const { error } = await supabase
          .from('prompt_versions')
          .delete()
          .eq('id', id)
          .eq('user_id', session.session.user.id);

        if (error) throw error;
        console.log('Version deleted from Supabase:', id);
      }
    } catch (error) {
      console.error('Error deleting version from Supabase:', error);
    }
    
    // Also delete from localStorage (for fallback or if not using Supabase)
    const stored = localStorage.getItem('playground_versions');
    if (stored) {
      try {
        let versions = JSON.parse(stored) as PromptVersion[];
        versions = versions.filter(v => v.id !== id);
        localStorage.setItem('playground_versions', JSON.stringify(versions));
        console.log('Version deleted from localStorage:', id);
      } catch (error) {
        console.error('Error deleting from localStorage:', error);
      }
    }
  }

  async compareVersions(version1Id: string, version2Id: string) {
    const v1 = await this.getVersionById(version1Id);
    const v2 = await this.getVersionById(version2Id);
    
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

  async clearHistory() {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (session?.session?.user) {
        await supabase
          .from('prompt_versions')
          .delete()
          .eq('user_id', session.session.user.id);
      }
    } catch (error) {
      console.error('Error clearing history from Supabase:', error);
    }
    
    // Clear localStorage as well
    localStorage.removeItem('playground_versions');
  }
}

export const playgroundService = new PlaygroundService();
export default playgroundService;