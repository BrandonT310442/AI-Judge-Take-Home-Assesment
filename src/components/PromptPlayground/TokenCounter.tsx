import React, { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Hash, DollarSign, AlertTriangle } from 'lucide-react';
import tokenizerService from '@/services/tokenizer';

interface TokenCounterProps {
  text: string;
  model: string;
  className?: string;
  showCost?: boolean;
  showLimit?: boolean;
}

export function TokenCounter({ 
  text, 
  model, 
  className = '',
  showCost = true,
  showLimit = true
}: TokenCounterProps) {
  const [tokens, setTokens] = useState(0);
  const [cost, setCost] = useState(0);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [limitPercentage, setLimitPercentage] = useState(0);

  // Debounced token counting
  useEffect(() => {
    const timer = setTimeout(() => {
      const tokenCount = tokenizerService.countTokens(text, model);
      const estimatedCost = tokenizerService.estimateCost(tokenCount, null, model);
      const overLimit = tokenizerService.isTokenLimitExceeded(tokenCount, model);
      const limit = tokenizerService.getTokenLimit(model);
      const percentage = (tokenCount / limit) * 100;

      setTokens(tokenCount);
      setCost(estimatedCost);
      setIsOverLimit(overLimit);
      setLimitPercentage(Math.min(percentage, 100));
    }, 300);

    return () => clearTimeout(timer);
  }, [text, model]);

  const getProgressColor = useCallback(() => {
    if (limitPercentage > 90) return 'bg-red-500';
    if (limitPercentage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }, [limitPercentage]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Token Count */}
        <div className="flex items-center space-x-1">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {tokens.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">tokens</span>
        </div>

        {/* Cost Estimate */}
        {showCost && (
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {tokenizerService.formatCost(cost)}
            </span>
          </div>
        )}

        {/* Model Limit */}
        {showLimit && (
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">
              / {tokenizerService.getTokenLimit(model).toLocaleString()} max
            </span>
            <span className="text-sm text-muted-foreground">
              ({limitPercentage.toFixed(0)}%)
            </span>
          </div>
        )}

        {/* Warning Badge */}
        {isOverLimit && (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Over Limit</span>
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      {showLimit && (
        <div className="w-full">
          <Progress 
            value={limitPercentage} 
            className="h-1.5"
            indicatorClassName={getProgressColor()}
          />
        </div>
      )}

      {/* Warning Alert */}
      {isOverLimit && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Token count exceeds {model} limit. Consider shortening your prompt or switching to a model with higher limits.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Compact version for inline display
export function TokenCounterCompact({ 
  text, 
  model,
  className = ''
}: Omit<TokenCounterProps, 'showCost' | 'showLimit'>) {
  const [tokens, setTokens] = useState(0);
  const [cost, setCost] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const tokenCount = tokenizerService.countTokens(text, model);
      const estimatedCost = tokenizerService.estimateCost(tokenCount, null, model);
      setTokens(tokenCount);
      setCost(estimatedCost);
    }, 300);

    return () => clearTimeout(timer);
  }, [text, model]);

  return (
    <div className={`flex items-center space-x-2 text-xs ${className}`}>
      <Badge variant="outline" className="font-mono">
        <Hash className="h-3 w-3 mr-1" />
        {tokens.toLocaleString()}
      </Badge>
      <Badge variant="outline" className="font-mono">
        <DollarSign className="h-3 w-3 mr-1" />
        {tokenizerService.formatCost(cost)}
      </Badge>
    </div>
  );
}