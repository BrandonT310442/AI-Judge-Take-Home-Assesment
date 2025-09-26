# Prompt Playground / Judge Testing - Detailed Design Document

## 🎯 Overview

The Prompt Playground is an interactive environment where users can experiment with judge prompts in real-time, test them against sample answers, and optimize their evaluation criteria before deploying them as active judges. This feature transforms prompt engineering from a black-box process into an intuitive, visual experience.

## 🏗️ Architecture

### Component Structure
```
src/
  pages/
    PromptPlayground.tsx        # Main playground page
  components/
    PromptPlayground/
      PromptEditor.tsx          # Monaco editor wrapper
      SampleAnswerPanel.tsx     # Sample answer input/selection
      ResultsPanel.tsx          # Live evaluation results
      PromptComparison.tsx      # Diff view for prompts
      TokenCounter.tsx          # Real-time token counting
      PlaygroundControls.tsx    # Model selection, run button
      HistoryDrawer.tsx         # Previous test history
  services/
    playgroundService.ts        # Playground-specific logic
    tokenizer.ts               # Token counting service
```

## 💡 Core Features

### 1. Live Prompt Editor with Syntax Highlighting

#### Monaco Editor Integration
```typescript
// PromptEditor.tsx
import Editor from '@monaco-editor/react';

const PromptEditor = ({ value, onChange, onTokensChange }) => {
  const handleEditorChange = (value: string) => {
    onChange(value);
    // Real-time token counting
    const tokens = tokenizer.countTokens(value);
    onTokensChange(tokens);
  };

  return (
    <Editor
      height="400px"
      defaultLanguage="markdown"
      theme="vs-dark"
      value={value}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        wordWrap: 'on',
        lineNumbers: 'on',
        rulers: [80],
        bracketPairColorization: { enabled: true },
        suggest: {
          showKeywords: true,
          showSnippets: true,
        },
      }}
    />
  );
};
```

#### Custom Syntax Highlighting for Prompt Variables
```typescript
// Custom language definition for prompt templates
monaco.languages.register({ id: 'prompt' });
monaco.languages.setMonarchTokensProvider('prompt', {
  tokenizer: {
    root: [
      [/\{\{[^}]+\}\}/, 'variable'],  // {{variable}}
      [/#.*$/, 'comment'],             // # Comments
      [/\*\*.*\*\*/, 'strong'],        // **bold**
      [/```[\s\S]*?```/, 'code'],      // Code blocks
    ],
  },
});
```

### 2. Test Against Sample Answers

#### Sample Answer Management
```typescript
interface SampleAnswer {
  id: string;
  name: string;
  questionType: QuestionType;
  question: string;
  answer: {
    choice?: string;
    reasoning?: string;
    text?: string;
  };
  expectedVerdict?: 'pass' | 'fail' | 'inconclusive';
}

// Pre-built samples for quick testing
const DEFAULT_SAMPLES: SampleAnswer[] = [
  {
    id: 'sample_1',
    name: 'Correct Scientific Answer',
    questionType: 'single_choice_with_reasoning',
    question: 'Is the sky blue?',
    answer: {
      choice: 'yes',
      reasoning: 'Due to Rayleigh scattering of sunlight in the atmosphere.',
    },
    expectedVerdict: 'pass',
  },
  {
    id: 'sample_2',
    name: 'Incorrect Answer',
    question: 'Is the sky blue?',
    answer: {
      choice: 'no',
      reasoning: 'The sky is green.',
    },
    expectedVerdict: 'fail',
  },
  // More samples...
];
```

#### Custom Sample Creation
```typescript
const SampleAnswerPanel = () => {
  const [samples, setSamples] = useState(DEFAULT_SAMPLES);
  const [customSample, setCustomSample] = useState<SampleAnswer>({});

  return (
    <div className="space-y-4">
      {/* Quick Select Pre-built Samples */}
      <Select onValueChange={selectSample}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a sample answer" />
        </SelectTrigger>
        <SelectContent>
          {samples.map(sample => (
            <SelectItem key={sample.id} value={sample.id}>
              <div className="flex items-center justify-between">
                <span>{sample.name}</span>
                {sample.expectedVerdict && (
                  <Badge variant={getVariantForVerdict(sample.expectedVerdict)}>
                    {sample.expectedVerdict}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom Sample Input */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Test Case</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Input 
              placeholder="Question text"
              value={customSample.question}
              onChange={(e) => updateCustomSample('question', e.target.value)}
            />
            <Textarea 
              placeholder="Answer text"
              value={customSample.answer?.text}
              onChange={(e) => updateCustomSample('answer.text', e.target.value)}
            />
            <Select value={customSample.expectedVerdict}>
              <SelectTrigger>
                <SelectValue placeholder="Expected verdict (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
                <SelectItem value="inconclusive">Inconclusive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### 3. Immediate Results Without Saving

#### Real-time Evaluation
```typescript
const usePlaygroundEvaluation = () => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  
  const runEvaluation = async (
    prompt: string, 
    samples: SampleAnswer[], 
    model: string
  ) => {
    setIsEvaluating(true);
    const results: EvaluationResult[] = [];
    
    for (const sample of samples) {
      try {
        // Process template with sample data
        const processedPrompt = promptService.processTemplate(prompt, {
          question: sample.question,
          answer: formatAnswer(sample.answer),
        });
        
        // Call LLM
        const result = await llmService.evaluate({
          prompt: processedPrompt,
          model,
          temperature: 0.3,
          maxTokens: 500,
        });
        
        results.push({
          sampleId: sample.id,
          verdict: result.verdict,
          reasoning: result.reasoning,
          confidence: result.confidence,
          tokensUsed: result.usage.totalTokens,
          latency: result.latency,
          matchesExpected: sample.expectedVerdict === result.verdict,
        });
      } catch (error) {
        results.push({
          sampleId: sample.id,
          error: error.message,
        });
      }
    }
    
    setResults(results);
    setIsEvaluating(false);
    return results;
  };
  
  return { runEvaluation, results, isEvaluating };
};
```

#### Results Display
```typescript
const ResultsPanel = ({ results, samples }) => {
  return (
    <div className="space-y-4">
      {results.map((result, index) => {
        const sample = samples.find(s => s.id === result.sampleId);
        return (
          <Card key={result.sampleId} className="relative">
            {/* Success/Failure Indicator */}
            {result.matchesExpected !== undefined && (
              <div className="absolute top-2 right-2">
                {result.matchesExpected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-sm">{sample.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getVariantForVerdict(result.verdict)}>
                      {result.verdict}
                    </Badge>
                    {result.confidence && (
                      <span className="text-xs text-muted-foreground">
                        {(result.confidence * 100).toFixed(0)}% confident
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm">{result.reasoning}</p>
                  
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
  );
};
```

### 4. Compare Different Prompt Versions

#### Version Management
```typescript
interface PromptVersion {
  id: string;
  content: string;
  timestamp: number;
  results?: EvaluationResult[];
  metadata: {
    model: string;
    tokenCount: number;
    avgLatency?: number;
    successRate?: number;
  };
}

const usePromptVersions = () => {
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [comparing, setComparing] = useState<[string?, string?]>([]);
  
  const saveVersion = (content: string, results?: EvaluationResult[]) => {
    const version: PromptVersion = {
      id: nanoid(),
      content,
      timestamp: Date.now(),
      results,
      metadata: calculateMetadata(content, results),
    };
    setVersions([version, ...versions].slice(0, 10)); // Keep last 10
  };
  
  return { versions, saveVersion, comparing, setComparing };
};
```

#### Diff Visualization
```typescript
import { diffLines } from 'diff';

const PromptComparison = ({ version1, version2 }) => {
  const differences = diffLines(version1.content, version2.content);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Side by side comparison */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Version 1</h4>
          <Badge variant="outline">
            {new Date(version1.timestamp).toLocaleTimeString()}
          </Badge>
        </div>
        <div className="p-4 bg-muted rounded-lg font-mono text-sm">
          {differences.map((part, index) => (
            <span
              key={index}
              className={
                part.removed ? 'bg-red-100 text-red-900' :
                part.added ? 'opacity-50' :
                ''
              }
            >
              {part.value}
            </span>
          ))}
        </div>
        {version1.metadata.successRate && (
          <div className="text-sm text-muted-foreground">
            Success rate: {(version1.metadata.successRate * 100).toFixed(0)}%
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Version 2</h4>
          <Badge variant="outline">
            {new Date(version2.timestamp).toLocaleTimeString()}
          </Badge>
        </div>
        <div className="p-4 bg-muted rounded-lg font-mono text-sm">
          {differences.map((part, index) => (
            <span
              key={index}
              className={
                part.added ? 'bg-green-100 text-green-900' :
                part.removed ? 'opacity-50' :
                ''
              }
            >
              {part.value}
            </span>
          ))}
        </div>
        {version2.metadata.successRate && (
          <div className="text-sm text-muted-foreground">
            Success rate: {(version2.metadata.successRate * 100).toFixed(0)}%
          </div>
        )}
      </div>
    </div>
  );
};
```

### 5. Token Count Display

#### Real-time Token Counting
```typescript
// tokenizer.ts
import { encode } from 'gpt-tokenizer';

class TokenizerService {
  private cache = new Map<string, number>();
  
  countTokens(text: string, model: string = 'gpt-4'): number {
    const cacheKey = `${model}:${text}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    try {
      const tokens = encode(text);
      const count = tokens.length;
      this.cache.set(cacheKey, count);
      return count;
    } catch (error) {
      // Fallback to approximation
      return Math.ceil(text.length / 4);
    }
  }
  
  estimateCost(tokens: number, model: string): number {
    const costs = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
      'claude-3': { input: 0.015, output: 0.075 },
    };
    
    const modelCost = costs[model] || costs['gpt-3.5-turbo'];
    // Estimate output tokens as 20% of input
    return (tokens * modelCost.input + tokens * 0.2 * modelCost.output) / 1000;
  }
}
```

#### Token Counter Component
```typescript
const TokenCounter = ({ text, model }) => {
  const [tokens, setTokens] = useState(0);
  const [cost, setCost] = useState(0);
  
  useEffect(() => {
    const debounced = debounce(() => {
      const tokenCount = tokenizer.countTokens(text, model);
      const estimatedCost = tokenizer.estimateCost(tokenCount, model);
      setTokens(tokenCount);
      setCost(estimatedCost);
    }, 300);
    
    debounced();
    return () => debounced.cancel();
  }, [text, model]);
  
  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-1">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <span>{tokens.toLocaleString()} tokens</span>
      </div>
      <div className="flex items-center space-x-1">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span>${cost.toFixed(4)}</span>
      </div>
      {tokens > 4000 && (
        <Alert className="text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <span>Approaching token limit</span>
        </Alert>
      )}
    </div>
  );
};
```

## 🎮 Playground Controls

### Model Selection and Parameters
```typescript
const PlaygroundControls = ({ onRun, isRunning }) => {
  const [model, setModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(500);
  
  return (
    <div className="flex items-center space-x-4">
      <Select value={model} onValueChange={setModel}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-4">GPT-4</SelectItem>
          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
          <SelectItem value="claude-3">Claude 3</SelectItem>
          <SelectItem value="llama-3">Llama 3</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex items-center space-x-2">
        <Label>Temperature</Label>
        <Slider
          value={[temperature]}
          onValueChange={([v]) => setTemperature(v)}
          min={0}
          max={1}
          step={0.1}
          className="w-[100px]"
        />
        <span className="text-sm text-muted-foreground">{temperature}</span>
      </div>
      
      <Button 
        onClick={() => onRun({ model, temperature, maxTokens })}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Evaluating...
          </>
        ) : (
          <>
            <PlayCircle className="mr-2 h-4 w-4" />
            Run Test
          </>
        )}
      </Button>
    </div>
  );
};
```

## 🎨 Full Playground Layout

```typescript
const PromptPlayground = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Prompt Playground</h1>
          <PlaygroundControls onRun={handleRun} isRunning={isRunning} />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* Editor Panel */}
        <div className="col-span-5 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prompt Editor</CardTitle>
                <TokenCounter text={prompt} model={model} />
              </div>
            </CardHeader>
            <CardContent>
              <PromptEditor 
                value={prompt}
                onChange={setPrompt}
                onTokensChange={setTokens}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Sample Answers Panel */}
        <div className="col-span-3 space-y-4">
          <Card className="h-full overflow-auto">
            <CardHeader>
              <CardTitle>Test Samples</CardTitle>
            </CardHeader>
            <CardContent>
              <SampleAnswerPanel 
                samples={samples}
                onSamplesChange={setSamples}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Results Panel */}
        <div className="col-span-4 space-y-4">
          <Card className="h-full overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Results</CardTitle>
                {results.length > 0 && (
                  <Badge>
                    {results.filter(r => r.matchesExpected).length}/{results.length} passed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ResultsPanel results={results} samples={samples} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* History Drawer */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="fixed bottom-4 right-4">
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
        </SheetTrigger>
        <SheetContent>
          <HistoryDrawer versions={versions} onCompare={setComparing} />
        </SheetContent>
      </Sheet>
    </div>
  );
};
```

## 🚀 Advanced Features

### 1. Prompt Templates
```typescript
const PROMPT_TEMPLATES = {
  accuracy: `Evaluate the factual accuracy of this answer...`,
  completeness: `Assess whether this answer fully addresses...`,
  reasoning: `Analyze the quality of reasoning provided...`,
};
```

### 2. Batch Testing
```typescript
const batchTest = async (prompts: string[], samples: SampleAnswer[]) => {
  const results = [];
  for (const prompt of prompts) {
    for (const sample of samples) {
      results.push(await evaluate(prompt, sample));
    }
  }
  return generateComparisonMatrix(results);
};
```

### 3. Export to Judge
```typescript
const exportToJudge = () => {
  const judge = {
    name: `Playground Export ${Date.now()}`,
    systemPrompt: currentPrompt,
    modelName: selectedModel,
    isActive: false,
  };
  dataService.createJudge(judge);
  toast.success('Exported to judges!');
};
```

## 📊 Analytics Integration

Track and display:
- Average response time per model
- Token usage patterns
- Success rate trends
- Cost per evaluation
- Model performance comparison

## 🔒 Security Considerations

1. **Rate Limiting**: Prevent abuse of LLM APIs
2. **Input Sanitization**: Clean user inputs before sending to LLM
3. **Token Limits**: Enforce maximum token counts
4. **Cost Controls**: Set budget limits per session
5. **Audit Logging**: Track all playground evaluations

## 🎯 Success Metrics

- Time to first evaluation < 2 seconds
- Token counting accuracy > 95%
- Diff visualization renders < 100ms
- Support for prompts up to 8000 tokens
- Handle 10 concurrent evaluations

## 🏆 This Feature Demonstrates

1. **Deep LLM Understanding**: Token counting, cost estimation, model comparison
2. **Advanced React Patterns**: Complex state management, real-time updates
3. **Third-party Integration**: Monaco editor, diff library
4. **Performance Optimization**: Debouncing, caching, virtual scrolling
5. **Product Thinking**: Solving real prompt engineering pain points
6. **Technical Excellence**: Clean architecture, type safety, error handling