import { encode } from 'gpt-tokenizer';

interface ModelCost {
  input: number;
  output: number;
}

class TokenizerService {
  private cache = new Map<string, number>();
  
  private modelCosts: Record<string, ModelCost> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-sonnet': { input: 0.003, output: 0.015 },
    'llama3-70b-8192': { input: 0.0007, output: 0.0008 },
    'llama3-8b-8192': { input: 0.0002, output: 0.0002 },
    'mixtral-8x7b-32768': { input: 0.0003, output: 0.0003 },
    'gemma-7b-it': { input: 0.0001, output: 0.0001 },
    'openai/gpt-oss-120b': { input: 0.001, output: 0.002 },
    'openai/gpt-oss-20b': { input: 0.0005, output: 0.001 },
    'llama-3.1-8b-instant': { input: 0.0001, output: 0.0001 }
  };
  
  countTokens(text: string, model: string = 'gpt-4'): number {
    const cacheKey = `${model}:${text}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    try {
      const tokens = encode(text);
      const count = tokens.length;
      
      // Cache the result
      if (this.cache.size > 100) {
        // Clear cache if it gets too large
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(cacheKey, count);
      
      return count;
    } catch (error) {
      console.warn('Failed to count tokens, using approximation:', error);
      // Fallback to approximation (roughly 4 characters per token)
      return Math.ceil(text.length / 4);
    }
  }
  
  estimateCost(
    inputTokens: number, 
    outputTokens: number | null = null, 
    model: string = 'gpt-3.5-turbo'
  ): number {
    const modelCost = this.modelCosts[model] || this.modelCosts['gpt-3.5-turbo'];
    
    // If output tokens not provided, estimate as 30% of input
    const estimatedOutputTokens = outputTokens || Math.ceil(inputTokens * 0.3);
    
    // Calculate cost in dollars
    const inputCost = (inputTokens * modelCost.input) / 1000;
    const outputCost = (estimatedOutputTokens * modelCost.output) / 1000;
    
    return inputCost + outputCost;
  }
  
  formatCost(cost: number): string {
    if (cost < 0.01) {
      return `$${(cost * 100).toFixed(3)}¢`;
    }
    return `$${cost.toFixed(4)}`;
  }
  
  getModelCosts(): string[] {
    return Object.keys(this.modelCosts);
  }
  
  isTokenLimitExceeded(tokens: number, model: string = 'gpt-4'): boolean {
    const limits: Record<string, number> = {
      'gpt-4': 8192,
      'gpt-4-turbo': 128000,
      'gpt-3.5-turbo': 16385,
      'claude-3-opus': 200000,
      'claude-3-sonnet': 200000,
      'llama3-70b-8192': 8192,
      'llama3-8b-8192': 8192,
      'mixtral-8x7b-32768': 32768,
      'gemma-7b-it': 8192,
      'openai/gpt-oss-120b': 4096,
      'openai/gpt-oss-20b': 4096,
      'llama-3.1-8b-instant': 8192
    };
    
    const limit = limits[model] || 4096;
    return tokens > limit * 0.9; // Warn at 90% of limit
  }
  
  getTokenLimit(model: string = 'gpt-4'): number {
    const limits: Record<string, number> = {
      'gpt-4': 8192,
      'gpt-4-turbo': 128000,
      'gpt-3.5-turbo': 16385,
      'claude-3-opus': 200000,
      'claude-3-sonnet': 200000,
      'llama3-70b-8192': 8192,
      'llama3-8b-8192': 8192,
      'mixtral-8x7b-32768': 32768,
      'gemma-7b-it': 8192,
      'openai/gpt-oss-120b': 4096,
      'openai/gpt-oss-20b': 4096,
      'llama-3.1-8b-instant': 8192
    };
    
    return limits[model] || 4096;
  }
}

export const tokenizerService = new TokenizerService();
export default tokenizerService;