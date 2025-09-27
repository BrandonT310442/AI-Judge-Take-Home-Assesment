import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Filter,
  ChartBar,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Clock,
  Trash2,
  Eye
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { Evaluation, Judge, Submission, Question, Statistics } from '@/types';
import { PassRateTrend } from '@/components/charts/PassRateTrend';
import { VerdictDistribution } from '@/components/charts/VerdictDistribution';
import { chartUtils } from '@/utils/chartUtils';

interface EvaluationDisplay extends Evaluation {
  submissionData?: Submission;
  judgeData?: Judge;
  questionData?: Question;
}

export function Results() {
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [displayEvaluations, setDisplayEvaluations] = useState<EvaluationDisplay[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [selectedJudges, setSelectedJudges] = useState<Set<string>>(new Set());
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [selectedVerdicts, setSelectedVerdicts] = useState<Set<string>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationDisplay | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<string | null>(null);
  
  // Chart states
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [evaluations, selectedJudges, selectedQuestions, selectedVerdicts, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    const [evaluationsData, judgesData, submissionsData] = await Promise.all([
      dataService.getEvaluations(),
      dataService.getJudges(),
      dataService.getSubmissions()
    ]);
    setEvaluations(evaluationsData);
    setJudges(judgesData);
    setSubmissions(submissionsData);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...evaluations];
    
    // Apply judge filter
    if (selectedJudges.size > 0) {
      filtered = filtered.filter(e => selectedJudges.has(e.judgeId));
    }
    
    // Apply question filter
    if (selectedQuestions.size > 0) {
      filtered = filtered.filter(e => selectedQuestions.has(e.questionId));
    }
    
    // Apply verdict filter
    if (selectedVerdicts.size > 0) {
      filtered = filtered.filter(e => selectedVerdicts.has(e.verdict));
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.reasoning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.submissionId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Enrich with related data
    const enriched = filtered.map(evaluation => {
      const submission = submissions.find(s => s.id === evaluation.submissionId);
      const judge = judges.find(j => j.id === evaluation.judgeId);
      const question = submission?.questions.find(q => q.data.id === evaluation.questionId);
      
      return {
        ...evaluation,
        submissionData: submission,
        judgeData: judge,
        questionData: question
      };
    });
    
    // Sort by most recent first
    enriched.sort((a, b) => b.createdAt - a.createdAt);
    
    setDisplayEvaluations(enriched);
  };

  const getAllQuestions = () => {
    const questions = new Map<string, string>();
    submissions.forEach(sub => {
      sub.questions.forEach(q => {
        if (!questions.has(q.data.id)) {
          questions.set(q.data.id, q.data.questionText);
        }
      });
    });
    return questions;
  };

  const getStatistics = (): Statistics => {
    const total = displayEvaluations.length;
    const passCount = displayEvaluations.filter(e => e.verdict === 'pass').length;
    const failCount = displayEvaluations.filter(e => e.verdict === 'fail').length;
    const inconclusiveCount = displayEvaluations.filter(e => e.verdict === 'inconclusive').length;
    const passRate = total > 0 ? (passCount / total) * 100 : 0;
    
    return {
      totalEvaluations: total,
      passCount,
      failCount,
      inconclusiveCount,
      passRate
    };
  };

  const handleJudgeToggle = (judgeId: string, checked: boolean) => {
    setSelectedJudges(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(judgeId);
      } else {
        newSet.delete(judgeId);
      }
      return newSet;
    });
  };

  const handleQuestionToggle = (questionId: string, checked: boolean) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });
  };

  const handleVerdictToggle = (verdict: string, checked: boolean) => {
    setSelectedVerdicts(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(verdict);
      } else {
        newSet.delete(verdict);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setSelectedJudges(new Set());
    setSelectedQuestions(new Set());
    setSelectedVerdicts(new Set());
    setSearchTerm('');
  };

  const handleDeleteEvaluation = async () => {
    if (!evaluationToDelete) return;
    
    try {
      await dataService.deleteEvaluation(evaluationToDelete);
      await loadData();
      toast({
        title: "Evaluation Deleted",
        description: "The evaluation result has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to delete evaluation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEvaluationToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleViewDetails = (evaluation: EvaluationDisplay) => {
    setSelectedEvaluation(evaluation);
    setDetailsModalOpen(true);
  };

  // Chart data preparation
  const getTrendData = () => {
    return chartUtils.groupByDate(displayEvaluations, timeRange);
  };

  const getVerdictData = () => {
    return chartUtils.verdictCounts(displayEvaluations);
  };

  const handleTimeRangeChange = (range: '24h' | '7d' | '30d' | 'all') => {
    setTimeRange(range);
  };

  const handleVerdictChartClick = (verdict: string) => {
    setSelectedVerdicts(new Set([verdict]));
  };

  const stats = getStatistics();
  const allQuestions = getAllQuestions();
  const activeFilters = selectedJudges.size + selectedQuestions.size + selectedVerdicts.size;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Evaluation Results</h2>
          <p className="text-muted-foreground mt-2">
            View and analyze all evaluation results with advanced filtering
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search evaluations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilters > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Results</SheetTitle>
                <SheetDescription>
                  Apply filters to narrow down evaluation results
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Verdict</h4>
                  <div className="space-y-2">
                    {['pass', 'fail', 'inconclusive'].map((verdict) => (
                      <div key={verdict} className="flex items-center space-x-2">
                        <Checkbox
                          id={`verdict-${verdict}`}
                          checked={selectedVerdicts.has(verdict)}
                          onCheckedChange={(checked) => 
                            handleVerdictToggle(verdict, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`verdict-${verdict}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                        >
                          {verdict}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Judges</h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {judges.map((judge) => (
                        <div key={judge.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`judge-${judge.id}`}
                            checked={selectedJudges.has(judge.id)}
                            onCheckedChange={(checked) => 
                              handleJudgeToggle(judge.id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`judge-${judge.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {judge.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Questions</h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {Array.from(allQuestions.entries()).map(([id, text]) => (
                        <div key={id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`question-${id}`}
                            checked={selectedQuestions.has(id)}
                            onCheckedChange={(checked) => 
                              handleQuestionToggle(id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`question-${id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {text}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button onClick={() => setSheetOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvaluations}</div>
            <p className="text-xs text-muted-foreground">evaluations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            {stats.passRate >= 50 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">of evaluations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.passCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fail</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inconclusive</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inconclusiveCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 mt-8">
        {/* Trend chart and verdict distribution side by side */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <PassRateTrend 
              data={getTrendData()} 
              onTimeRangeChange={handleTimeRangeChange}
            />
          </div>
          <div className="md:col-span-1">
            <VerdictDistribution 
              data={getVerdictData()}
              onSegmentClick={handleVerdictChartClick}
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Details</CardTitle>
          <CardDescription>
            {displayEvaluations.length} results {activeFilters > 0 && '(filtered)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading evaluations...</p>
            </div>
          ) : displayEvaluations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No evaluations found</p>
              <p className="text-muted-foreground">
                {activeFilters > 0 ? 'Try adjusting your filters' : 'Run evaluations to see results'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Judge</TableHead>
                    <TableHead>Verdict</TableHead>
                    <TableHead>Reasoning</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell className="font-medium">
                        {evaluation.submissionId}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate">
                          {evaluation.questionData?.data.questionText || 'Unknown'}
                        </p>
                      </TableCell>
                      <TableCell>
                        {evaluation.judgeData?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            evaluation.verdict === 'pass' ? 'default' : 
                            evaluation.verdict === 'fail' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {evaluation.verdict}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate">
                          {evaluation.reasoning}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(evaluation.createdAt).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(evaluation)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEvaluationToDelete(evaluation.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evaluation Details</DialogTitle>
            <DialogDescription>
              Complete information about this evaluation
            </DialogDescription>
          </DialogHeader>
          {selectedEvaluation && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Submission ID</Label>
                  <p className="text-sm font-mono mt-1">{selectedEvaluation.submissionId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Evaluation Time</Label>
                  <p className="text-sm mt-1">{new Date(selectedEvaluation.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Question</Label>
                <p className="text-sm mt-1">
                  {selectedEvaluation.questionData?.data.questionText || 'Unknown'}
                </p>
                {selectedEvaluation.questionData && (
                  <Badge variant="outline" className="mt-2">
                    {selectedEvaluation.questionData.data.questionType.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>

              {selectedEvaluation.submissionData?.answers[selectedEvaluation.questionId] && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">User Answer</Label>
                  <div className="bg-muted/50 rounded-lg p-3 mt-1 space-y-2">
                    {selectedEvaluation.submissionData.answers[selectedEvaluation.questionId].choice && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Choice:</p>
                        <p className="text-sm">{selectedEvaluation.submissionData.answers[selectedEvaluation.questionId].choice}</p>
                      </div>
                    )}
                    {selectedEvaluation.submissionData.answers[selectedEvaluation.questionId].reasoning && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Reasoning:</p>
                        <p className="text-sm">{selectedEvaluation.submissionData.answers[selectedEvaluation.questionId].reasoning}</p>
                      </div>
                    )}
                    {selectedEvaluation.submissionData.answers[selectedEvaluation.questionId].text && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Response:</p>
                        <p className="text-sm">{selectedEvaluation.submissionData.answers[selectedEvaluation.questionId].text}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Judge</Label>
                <p className="text-sm mt-1 font-medium">{selectedEvaluation.judgeData?.name || 'Unknown'}</p>
                {selectedEvaluation.judgeData && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Model: {selectedEvaluation.judgeData.modelName}</p>
                    {selectedEvaluation.judgeData.systemPrompt && (
                      <div className="bg-muted/50 rounded-lg p-3 mt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">System Prompt:</p>
                        <p className="text-xs whitespace-pre-wrap">{selectedEvaluation.judgeData.systemPrompt}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Verdict</Label>
                <div className="mt-1">
                  <Badge 
                    variant={
                      selectedEvaluation.verdict === 'pass' ? 'default' : 
                      selectedEvaluation.verdict === 'fail' ? 'destructive' : 
                      'secondary'
                    }
                    className="text-sm"
                  >
                    {selectedEvaluation.verdict.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">AI Reasoning</Label>
                <div className="bg-muted/50 rounded-lg p-4 mt-1">
                  <p className="text-sm whitespace-pre-wrap">{selectedEvaluation.reasoning}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this evaluation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The evaluation result will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEvaluationToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvaluation}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}