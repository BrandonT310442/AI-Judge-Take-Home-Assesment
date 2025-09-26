import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Hash,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import type { PlaygroundEvaluationResult, SampleAnswer } from '@/services/playgroundService';

interface ResultsPanelProps {
  results: PlaygroundEvaluationResult[];
  samples: SampleAnswer[];
  isLoading?: boolean;
  progress?: { current: number; total: number };
}

export function ResultsPanel({ 
  results, 
  samples,
  isLoading = false,
  progress
}: ResultsPanelProps) {
  // Calculate statistics
  const stats = React.useMemo(() => {
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);
    const matchingExpected = results.filter(r => r.matchesExpected === true);
    const notMatchingExpected = results.filter(r => r.matchesExpected === false);
    
    const verdictCounts = {
      pass: results.filter(r => r.verdict === 'pass').length,
      fail: results.filter(r => r.verdict === 'fail').length,
      inconclusive: results.filter(r => r.verdict === 'inconclusive').length,
    };

    const totalTokens = results.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);
    const avgLatency = successful.length > 0
      ? successful.reduce((sum, r) => sum + (r.latency || 0), 0) / successful.length
      : 0;
    const avgConfidence = successful
      .filter(r => r.confidence !== undefined)
      .reduce((sum, r) => sum + (r.confidence || 0), 0) / 
      (successful.filter(r => r.confidence !== undefined).length || 1);

    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      matchingExpected: matchingExpected.length,
      notMatchingExpected: notMatchingExpected.length,
      verdictCounts,
      totalTokens,
      avgLatency,
      avgConfidence,
      accuracyRate: results.filter(r => r.matchesExpected !== undefined).length > 0
        ? (matchingExpected.length / results.filter(r => r.matchesExpected !== undefined).length) * 100
        : 0
    };
  }, [results]);

  const getVerdictBadgeVariant = (verdict: string) => {
    switch (verdict) {
      case 'pass':
        return 'default';
      case 'fail':
        return 'destructive';
      case 'inconclusive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading && progress) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Running Evaluations...</p>
              <p className="text-xs text-muted-foreground">
                {progress.current} of {progress.total} samples
              </p>
              <Progress value={(progress.current / progress.total) * 100} className="w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium">No Results Yet</p>
          <p className="text-xs text-muted-foreground">
            Select samples and run evaluations to see results
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Fixed Header Section */}
      <div className="space-y-3 pb-3">
        {/* Statistics Summary */}
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Accuracy</span>
                {stats.accuracyRate >= 70 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-lg font-bold">{stats.accuracyRate.toFixed(0)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Avg Latency</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold">{stats.avgLatency.toFixed(0)}ms</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Tokens Used</span>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold">{stats.totalTokens.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Confidence</span>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold">{(stats.avgConfidence * 100).toFixed(0)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Verdict Distribution */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between space-x-2">
              <Badge variant="default">
                Pass: {stats.verdictCounts.pass}
              </Badge>
              <Badge variant="destructive">
                Fail: {stats.verdictCounts.fail}
              </Badge>
              <Badge variant="secondary">
                Inconclusive: {stats.verdictCounts.inconclusive}
              </Badge>
              {stats.failed > 0 && (
                <Badge variant="outline" className="border-red-500">
                  Errors: {stats.failed}
              </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scrollable Results Section - With explicit height */}
      <div 
        className="overflow-y-auto" 
        style={{ 
          height: 'calc(100% - 280px)',
          maxHeight: 'calc(100% - 280px)' 
        }}
      >
        <div className="space-y-3 pr-2 pb-2">
          {results.map((result, index) => {
            const sample = samples.find(s => s.id === result.sampleId);
            if (!sample) return null;

            return (
              <Card key={`${result.sampleId}-${index}`} className="relative">
                {/* Match Indicator */}
                {result.matchesExpected !== undefined && (
                  <div className="absolute top-3 right-3">
                    {result.matchesExpected ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}

                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{sample.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {sample.question}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2">
                  {result.error ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {result.error}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      {/* Verdict and Confidence */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getVerdictBadgeVariant(result.verdict!)}>
                            {result.verdict}
                          </Badge>
                          {sample.expectedVerdict && (
                            <span className="text-xs text-muted-foreground">
                              (expected: {sample.expectedVerdict})
                            </span>
                          )}
                        </div>
                        {result.confidence !== undefined && (
                          <span className={`text-xs font-medium ${getConfidenceColor(result.confidence)}`}>
                            {(result.confidence * 100).toFixed(0)}% confident
                          </span>
                        )}
                      </div>

                      {/* Reasoning */}
                      <div className="bg-muted/50 rounded p-2">
                        <p className="text-xs">{result.reasoning}</p>
                      </div>

                      {/* Metadata */}
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{result.tokensUsed} tokens</span>
                        <span>{result.latency}ms</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}