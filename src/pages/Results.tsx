import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Trash2
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { Evaluation, Judge, Submission, Question, Statistics } from '@/types';

interface EvaluationDisplay extends Evaluation {
  submissionData?: Submission;
  judgeData?: Judge;
  questionData?: Question;
}

export function Results() {
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

  const handleDeleteEvaluation = async (id: string) => {
    if (confirm('Are you sure you want to delete this evaluation result?')) {
      try {
        await dataService.deleteEvaluation(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting evaluation:', error);
        alert('Failed to delete evaluation. Check console for details.');
      }
    }
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvaluation(evaluation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}