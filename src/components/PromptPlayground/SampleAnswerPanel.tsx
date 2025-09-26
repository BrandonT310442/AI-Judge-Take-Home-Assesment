import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Trash2, 
  FlaskConical, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Copy,
  Edit3
} from 'lucide-react';
import type { SampleAnswer } from '@/services/playgroundService';
import { DEFAULT_SAMPLES } from '@/services/playgroundService';
import { nanoid } from 'nanoid';

interface SampleAnswerPanelProps {
  samples: SampleAnswer[];
  selectedSamples: string[];
  onSamplesChange: (samples: SampleAnswer[]) => void;
  onSelectionChange: (selectedIds: string[]) => void;
}

export function SampleAnswerPanel({
  samples,
  selectedSamples,
  onSamplesChange,
  onSelectionChange
}: SampleAnswerPanelProps) {
  const [customSample, setCustomSample] = useState<Partial<SampleAnswer>>({
    name: '',
    question: '',
    answer: {},
    questionType: 'free_form'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddCustomSample = () => {
    if (!customSample.name || !customSample.question) {
      return;
    }

    const newSample: SampleAnswer = {
      id: nanoid(),
      name: customSample.name,
      question: customSample.question,
      questionType: customSample.questionType || 'free_form',
      answer: customSample.answer || {},
      expectedVerdict: customSample.expectedVerdict
    };

    onSamplesChange([...samples, newSample]);
    onSelectionChange([...selectedSamples, newSample.id]);
    
    // Reset form
    setCustomSample({
      name: '',
      question: '',
      answer: {},
      questionType: 'free_form'
    });
  };

  const handleDeleteSample = (id: string) => {
    onSamplesChange(samples.filter(s => s.id !== id));
    onSelectionChange(selectedSamples.filter(sid => sid !== id));
  };

  const handleDuplicateSample = (sample: SampleAnswer) => {
    const newSample: SampleAnswer = {
      ...sample,
      id: nanoid(),
      name: `${sample.name} (Copy)`
    };
    onSamplesChange([...samples, newSample]);
  };

  const handleToggleSample = (id: string) => {
    if (selectedSamples.includes(id)) {
      onSelectionChange(selectedSamples.filter(sid => sid !== id));
    } else {
      onSelectionChange([...selectedSamples, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSamples.length === samples.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(samples.map(s => s.id));
    }
  };

  const loadDefaultSamples = () => {
    onSamplesChange([...samples, ...DEFAULT_SAMPLES]);
    onSelectionChange([...selectedSamples, ...DEFAULT_SAMPLES.map(s => s.id)]);
  };

  const getVerdictIcon = (verdict?: 'pass' | 'fail' | 'inconclusive') => {
    switch (verdict) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'inconclusive':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="samples" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="samples">Test Samples</TabsTrigger>
          <TabsTrigger value="custom">Add Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="samples" className="flex-1 overflow-hidden">
          <div className="space-y-2 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedSamples.length === samples.length && samples.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedSamples.length} of {samples.length} selected
                </span>
              </div>
              {samples.length === 0 && (
                <Button size="sm" variant="outline" onClick={loadDefaultSamples}>
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Load Defaults
                </Button>
              )}
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-4">
                {samples.map((sample) => (
                  <Card 
                    key={sample.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedSamples.includes(sample.id) 
                        ? 'bg-primary/5 border-primary/40' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          checked={selectedSamples.includes(sample.id)}
                          onCheckedChange={() => handleToggleSample(sample.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 space-y-1" onClick={() => handleToggleSample(sample.id)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">{sample.name}</span>
                              {sample.expectedVerdict && getVerdictIcon(sample.expectedVerdict)}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateSample(sample);
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSample(sample.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            Q: {sample.question}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            A: {sample.answer.text || sample.answer.reasoning || sample.answer.choice || '(empty)'}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {sample.questionType.replace(/_/g, ' ')}
                            </Badge>
                            {sample.expectedVerdict && (
                              <Badge 
                                variant={
                                  sample.expectedVerdict === 'pass' ? 'default' :
                                  sample.expectedVerdict === 'fail' ? 'destructive' :
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                Expected: {sample.expectedVerdict}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 overflow-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Sample Name</Label>
              <Input
                id="name"
                placeholder="e.g., Correct Scientific Answer"
                value={customSample.name || ''}
                onChange={(e) => setCustomSample({ ...customSample, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionType">Question Type</Label>
              <Select
                value={customSample.questionType}
                onValueChange={(value) => setCustomSample({ ...customSample, questionType: value })}
              >
                <SelectTrigger id="questionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free_form">Free Form</SelectItem>
                  <SelectItem value="single_choice">Single Choice</SelectItem>
                  <SelectItem value="single_choice_with_reasoning">Single Choice with Reasoning</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter the question text..."
                value={customSample.question || ''}
                onChange={(e) => setCustomSample({ ...customSample, question: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Answer</Label>
              {(customSample.questionType === 'single_choice' || 
                customSample.questionType === 'single_choice_with_reasoning') && (
                <Input
                  placeholder="Choice (e.g., yes, no, A, B)"
                  value={customSample.answer?.choice || ''}
                  onChange={(e) => setCustomSample({
                    ...customSample,
                    answer: { ...customSample.answer, choice: e.target.value }
                  })}
                />
              )}
              {customSample.questionType === 'single_choice_with_reasoning' && (
                <Textarea
                  placeholder="Reasoning..."
                  value={customSample.answer?.reasoning || ''}
                  onChange={(e) => setCustomSample({
                    ...customSample,
                    answer: { ...customSample.answer, reasoning: e.target.value }
                  })}
                  rows={2}
                  className="mt-2"
                />
              )}
              {customSample.questionType === 'free_form' && (
                <Textarea
                  placeholder="Answer text..."
                  value={customSample.answer?.text || ''}
                  onChange={(e) => setCustomSample({
                    ...customSample,
                    answer: { ...customSample.answer, text: e.target.value }
                  })}
                  rows={3}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedVerdict">Expected Verdict (Optional)</Label>
              <Select
                value={customSample.expectedVerdict || 'none'}
                onValueChange={(value) => setCustomSample({
                  ...customSample,
                  expectedVerdict: value === 'none' ? undefined : value as 'pass' | 'fail' | 'inconclusive'
                })}
              >
                <SelectTrigger id="expectedVerdict">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                  <SelectItem value="inconclusive">Inconclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAddCustomSample} 
              className="w-full"
              disabled={!customSample.name || !customSample.question}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Sample
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}