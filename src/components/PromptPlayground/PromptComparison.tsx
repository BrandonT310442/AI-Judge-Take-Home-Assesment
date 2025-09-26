import React from 'react';
import { diffLines, diffWords } from 'diff';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeftRight, 
  Clock, 
  Hash, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import type { PromptVersion } from '@/services/playgroundService';
import tokenizerService from '@/services/tokenizer';

interface PromptComparisonProps {
  version1: PromptVersion | null;
  version2: PromptVersion | null;
  onClose?: () => void;
  onSelectVersion?: (version: PromptVersion) => void;
}

export function PromptComparison({
  version1,
  version2,
  onClose,
  onSelectVersion
}: PromptComparisonProps) {
  if (!version1 || !version2) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          Select two versions to compare
        </p>
      </div>
    );
  }

  const lineDiff = diffLines(version1.content, version2.content);
  const wordDiff = diffWords(version1.content, version2.content);

  // Calculate metrics diff
  const tokenDiff = version2.metadata.tokenCount - version1.metadata.tokenCount;
  const successRateDiff = (version2.metadata.successRate || 0) - (version1.metadata.successRate || 0);
  const latencyDiff = (version2.metadata.avgLatency || 0) - (version1.metadata.avgLatency || 0);
  const costDiff = (version2.metadata.totalCost || 0) - (version1.metadata.totalCost || 0);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDiffIndicator = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      {/* Metrics Comparison */}
      <div className="grid grid-cols-4 gap-2">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tokens</span>
              {getDiffIndicator(tokenDiff)}
            </div>
            <p className="text-sm font-medium">
              {tokenDiff > 0 ? '+' : ''}{tokenDiff}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Success Rate</span>
              {getDiffIndicator(successRateDiff)}
            </div>
            <p className="text-sm font-medium">
              {successRateDiff > 0 ? '+' : ''}{(successRateDiff * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Latency</span>
              {getDiffIndicator(-latencyDiff)} {/* Negative because lower is better */}
            </div>
            <p className="text-sm font-medium">
              {latencyDiff > 0 ? '+' : ''}{latencyDiff.toFixed(0)}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Cost</span>
              {getDiffIndicator(-costDiff)} {/* Negative because lower is better */}
            </div>
            <p className="text-sm font-medium">
              {costDiff > 0 ? '+' : ''}${costDiff.toFixed(4)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Diff Visualization */}
      <Tabs defaultValue="sidebyside" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sidebyside">Side by Side</TabsTrigger>
          <TabsTrigger value="linediff">Line Diff</TabsTrigger>
          <TabsTrigger value="worddiff">Word Diff</TabsTrigger>
        </TabsList>

        <TabsContent value="sidebyside" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Version 1 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Version 1</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {formatTimestamp(version1.timestamp)}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {version1.metadata.tokenCount} tokens • {version1.metadata.model}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {version1.content}
                  </pre>
                </ScrollArea>
                {version1.metadata.successRate !== undefined && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Success Rate: {(version1.metadata.successRate * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {onSelectVersion && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => onSelectVersion(version1)}
                  >
                    Use This Version
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Version 2 */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Version 2</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {formatTimestamp(version2.timestamp)}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {version2.metadata.tokenCount} tokens • {version2.metadata.model}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {version2.content}
                  </pre>
                </ScrollArea>
                {version2.metadata.successRate !== undefined && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Success Rate: {(version2.metadata.successRate * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {onSelectVersion && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => onSelectVersion(version2)}
                  >
                    Use This Version
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="linediff">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Line-by-Line Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {lineDiff.map((part, index) => (
                    <div
                      key={index}
                      className={`px-2 py-1 font-mono text-xs ${
                        part.added
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100'
                          : part.removed
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100'
                          : ''
                      }`}
                    >
                      {part.added && '+ '}
                      {part.removed && '- '}
                      {!part.added && !part.removed && '  '}
                      <span className="whitespace-pre-wrap">{part.value}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="worddiff">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Word-by-Word Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="font-mono text-xs whitespace-pre-wrap">
                  {wordDiff.map((part, index) => (
                    <span
                      key={index}
                      className={
                        part.added
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100'
                          : part.removed
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 line-through'
                          : ''
                      }
                    >
                      {part.value}
                    </span>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}