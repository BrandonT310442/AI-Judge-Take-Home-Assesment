import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { History, FlaskConical, ArrowLeft, Save, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import components
import { PromptEditor } from '@/components/PromptPlayground/PromptEditor';
import { SampleAnswerPanel } from '@/components/PromptPlayground/SampleAnswerPanel';
import { ResultsPanel } from '@/components/PromptPlayground/ResultsPanel';
import { TokenCounter } from '@/components/PromptPlayground/TokenCounter';
import { PlaygroundControls } from '@/components/PromptPlayground/PlaygroundControls';
import { PromptComparison } from '@/components/PromptPlayground/PromptComparison';

// Import services
import playgroundService, { DEFAULT_SAMPLES, type SampleAnswer, type PlaygroundEvaluationResult, type PromptVersion } from '@/services/playgroundService';
import { dataService } from '@/services/dataService';

const DEFAULT_PROMPT = `# AI Judge Evaluation

## Judge Instructions
You are an expert evaluator assessing the quality and correctness of answers. 
Be fair but strict in your evaluation. Consider:
- Factual accuracy
- Completeness of the answer
- Quality of reasoning
- Clarity of expression

## Question
{{question}}

## User's Answer
{{answer}}

## Task
Evaluate the answer and provide:
1. A verdict: "pass", "fail", or "inconclusive"
2. Brief reasoning explaining your verdict

Return your evaluation as JSON:
{
  "verdict": "pass" | "fail" | "inconclusive",
  "reasoning": "Your explanation here"
}`;

export function PromptPlayground() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Main state
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [samples, setSamples] = useState<SampleAnswer[]>(DEFAULT_SAMPLES);
  const [selectedSamples, setSelectedSamples] = useState<string[]>(DEFAULT_SAMPLES.map(s => s.id));
  const [results, setResults] = useState<PlaygroundEvaluationResult[]>([]);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Model settings
  const [model, setModel] = useState('openai/gpt-oss-120b');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(500);
  const [tokenCount, setTokenCount] = useState(0);

  // UI state
  const [showHistory, setShowHistory] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [compareVersions, setCompareVersions] = useState<[string?, string?]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportName, setExportName] = useState('');

  // Load version history on mount
  useEffect(() => {
    const history = playgroundService.getVersionHistory();
    setVersions(history);
  }, []);

  // Handle run evaluation
  const handleRun = useCallback(async () => {
    const samplesToRun = samples.filter(s => selectedSamples.includes(s.id));
    
    if (samplesToRun.length === 0) {
      toast({
        title: 'No Samples Selected',
        description: 'Please select at least one sample to evaluate.',
        variant: 'destructive'
      });
      return;
    }

    setIsRunning(true);
    setProgress({ current: 0, total: samplesToRun.length });
    setResults([]);

    try {
      const evaluationResults = await playgroundService.evaluateMultipleSamples(
        prompt,
        samplesToRun,
        model,
        temperature,
        maxTokens,
        (completed, total) => {
          setProgress({ current: completed, total });
        }
      );

      setResults(evaluationResults);

      // Auto-save version with results
      const version = playgroundService.saveVersion(prompt, model, evaluationResults);
      setVersions([version, ...versions.slice(0, 9)]);

      toast({
        title: 'Evaluation Complete',
        description: `Evaluated ${evaluationResults.length} samples successfully.`
      });
    } catch (error: any) {
      toast({
        title: 'Evaluation Failed',
        description: error.message || 'Failed to run evaluations. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [prompt, samples, selectedSamples, model, temperature, maxTokens, versions, toast]);

  // Handle save version
  const handleSaveVersion = useCallback(() => {
    const version = playgroundService.saveVersion(prompt, model, results.length > 0 ? results : undefined);
    setVersions([version, ...versions.slice(0, 9)]);
    toast({
      title: 'Version Saved',
      description: 'Your prompt version has been saved to history.'
    });
  }, [prompt, model, results, versions, toast]);

  // Handle export to judge
  const handleExportToJudge = useCallback(async () => {
    if (!exportName) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for the judge.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await dataService.createJudge({
        name: exportName,
        systemPrompt: prompt,
        modelName: model,
        isActive: false
      });

      toast({
        title: 'Judge Created',
        description: 'Your prompt has been exported as a new judge.',
      });
      setShowExportDialog(false);
      setExportName('');
      navigate('/judges');
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to create judge.',
        variant: 'destructive'
      });
    }
  }, [exportName, prompt, model, navigate, toast]);

  // Handle version selection
  const handleSelectVersion = useCallback((version: PromptVersion) => {
    setPrompt(version.content);
    setModel(version.metadata.model);
    if (version.results) {
      setResults(version.results);
    }
    setShowHistory(false);
    setShowComparison(false);
    toast({
      title: 'Version Loaded',
      description: 'Prompt version has been loaded into the editor.'
    });
  }, [toast]);

  // Handle comparison
  const handleCompare = useCallback((v1: string, v2: string) => {
    setCompareVersions([v1, v2]);
    setShowComparison(true);
    setShowHistory(false);
  }, []);

  // Handle reset
  const handleReset = useCallback(() => {
    setPrompt(DEFAULT_PROMPT);
    setSamples(DEFAULT_SAMPLES);
    setSelectedSamples(DEFAULT_SAMPLES.map(s => s.id));
    setResults([]);
    setModel('openai/gpt-oss-120b');
    setTemperature(0.3);
    setMaxTokens(500);
    toast({
      title: 'Playground Reset',
      description: 'All settings have been reset to defaults.'
    });
  }, [toast]);

  // Listen for keyboard shortcut
  useEffect(() => {
    const handleRunShortcut = () => handleRun();
    window.addEventListener('runPlayground', handleRunShortcut);
    return () => window.removeEventListener('runPlayground', handleRunShortcut);
  }, [handleRun]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/judges')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <FlaskConical className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Prompt Playground</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Test and refine judge prompts in real-time
              </p>
            </div>
            <TokenCounter text={prompt} model={model} className="hidden lg:block" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <PlaygroundControls
            model={model}
            temperature={temperature}
            maxTokens={maxTokens}
            onModelChange={setModel}
            onTemperatureChange={setTemperature}
            onMaxTokensChange={setMaxTokens}
            onRun={handleRun}
            onSaveVersion={handleSaveVersion}
            onExportToJudge={() => setShowExportDialog(true)}
            onShowHistory={() => setShowHistory(true)}
            onReset={handleReset}
            isRunning={isRunning}
            canRun={selectedSamples.length > 0}
            runLabel={`Run ${selectedSamples.length} Test${selectedSamples.length !== 1 ? 's' : ''}`}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-4 h-full">
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* Prompt Editor */}
            <div className="col-span-12 lg:col-span-5 h-full">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Prompt Editor</CardTitle>
                  <CardDescription>
                    Write your evaluation prompt. Use {'{{question}}'} and {'{{answer}}'} as placeholders.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <div className="h-full min-h-[500px] p-4">
                    <PromptEditor
                      value={prompt}
                      onChange={setPrompt}
                      onTokensChange={setTokenCount}
                      model={model}
                      height="450px"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sample Answers */}
            <div className="col-span-12 lg:col-span-3 h-full">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Test Samples</CardTitle>
                  <CardDescription>
                    Select samples to test your prompt against
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <SampleAnswerPanel
                    samples={samples}
                    selectedSamples={selectedSamples}
                    onSamplesChange={setSamples}
                    onSelectionChange={setSelectedSamples}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="col-span-12 lg:col-span-4 h-full">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Results</CardTitle>
                      <CardDescription>
                        Evaluation results for your test samples
                      </CardDescription>
                    </div>
                    {results.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setResults([])}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ResultsPanel
                    results={results}
                    samples={samples}
                    isLoading={isRunning}
                    progress={progress.total > 0 ? progress : undefined}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* History Sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent className="w-[600px] sm:w-[700px]">
          <SheetHeader>
            <SheetTitle>Version History</SheetTitle>
            <SheetDescription>
              Your recent prompt versions and their performance
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved versions yet</p>
            ) : (
              versions.map((version, index) => (
                <Card key={version.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        Version {versions.length - index}
                      </CardTitle>
                      <Badge variant="outline">
                        {new Date(version.timestamp).toLocaleString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{version.metadata.tokenCount} tokens</span>
                      <span>{version.metadata.model}</span>
                      {version.metadata.successRate !== undefined && (
                        <span>{(version.metadata.successRate * 100).toFixed(0)}% success</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectVersion(version)}
                      >
                        Load
                      </Button>
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompare(versions[0].id, version.id)}
                        >
                          Compare with Latest
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Version Comparison</DialogTitle>
          </DialogHeader>
          <PromptComparison
            version1={versions.find(v => v.id === compareVersions[0]) || null}
            version2={versions.find(v => v.id === compareVersions[1]) || null}
            onSelectVersion={(version) => {
              handleSelectVersion(version);
              setShowComparison(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export to Judge</DialogTitle>
            <DialogDescription>
              Create a new judge from your current prompt
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="judgeName">Judge Name</Label>
              <Input
                id="judgeName"
                placeholder="e.g., Accuracy Judge v2"
                value={exportName}
                onChange={(e) => setExportName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportToJudge} disabled={!exportName}>
              <Upload className="mr-2 h-4 w-4" />
              Create Judge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}