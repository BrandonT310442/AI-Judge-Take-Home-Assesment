import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  PlayCircle,
  FileJson,
  Gavel,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Settings
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { Queue, Submission, Judge, JudgeAssignment, EvaluationRun } from '@/types';

export function QueueDetail() {
  const { queueId } = useParams<{ queueId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [queue, setQueue] = useState<Queue | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);
  const [selectedJudges, setSelectedJudges] = useState<Record<string, Set<string>>>({});
  const [savingQuestion, setSavingQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (queueId) {
      loadData();
    }
  }, [queueId]);
  
  useEffect(() => {
    console.log('Current selectedJudges state:', selectedJudges);
  }, [selectedJudges]);

  const loadData = async () => {
    if (!queueId) return;
    
    setLoading(true);
    const [queueData, submissionsData, judgesData, assignmentsData, runsData] = await Promise.all([
      dataService.getQueue(queueId),
      dataService.getSubmissionsByQueue(queueId),
      dataService.getActiveJudges(),
      dataService.getJudgeAssignments(queueId),
      dataService.getEvaluationRuns(queueId)
    ]);
    
    console.log('📚 Loaded data:', {
      queue: queueData,
      submissions: submissionsData.length,
      judges: judgesData,
      assignments: assignmentsData,
      runs: runsData.length
    });
    
    setQueue(queueData || null);
    setSubmissions(submissionsData);
    setJudges(judgesData);
    setAssignments(assignmentsData);
    setRuns(runsData);
    
    // Initialize selected judges based on existing assignments
    const selections: Record<string, Set<string>> = {};
    assignmentsData.forEach(assignment => {
      if (!selections[assignment.questionId]) {
        selections[assignment.questionId] = new Set();
      }
      selections[assignment.questionId].add(assignment.judgeId);
    });
    console.log('📌 Initialized selectedJudges from assignments:', selections);
    setSelectedJudges(selections);
    
    setLoading(false);
  };

  const getAllQuestions = () => {
    const questions: Array<{ id: string; text: string; type: string }> = [];
    const seen = new Set<string>();
    
    submissions.forEach(sub => {
      sub.questions.forEach(q => {
        if (!seen.has(q.data.id)) {
          seen.add(q.data.id);
          questions.push({
            id: q.data.id,
            text: q.data.questionText,
            type: q.data.questionType
          });
        }
      });
    });
    
    return questions;
  };

  const handleJudgeToggle = async (questionId: string, judgeId: string, checked: boolean) => {
    console.log(`🔲 Toggle judge: question=${questionId}, judge=${judgeId}, checked=${checked}`);
    
    // Calculate the updated judge IDs based on current state
    const currentJudges = selectedJudges[questionId] || new Set<string>();
    const updatedJudgeIds = new Set(currentJudges);
    
    if (checked) {
      updatedJudgeIds.add(judgeId);
      console.log(`➕ Adding judge ${judgeId} to question ${questionId}`);
    } else {
      updatedJudgeIds.delete(judgeId);
      console.log(`➖ Removing judge ${judgeId} from question ${questionId}`);
    }
    
    console.log(`📝 New selections for question ${questionId}:`, Array.from(updatedJudgeIds));
    
    // Update UI immediately
    setSelectedJudges(prev => {
      const newSelections = { ...prev };
      newSelections[questionId] = updatedJudgeIds;
      return newSelections;
    });
    
    // Auto-save in the background
    if (!queueId) return;
    
    setSavingQuestion(questionId);
    try {
      console.log(`Auto-saving ${updatedJudgeIds.size} judges for question ${questionId}`);
      await dataService.assignJudges(queueId, questionId, Array.from(updatedJudgeIds));
      
      // Update assignments state
      const newAssignments = await dataService.getJudgeAssignments(queueId);
      setAssignments(newAssignments);
      
      setSavingQuestion(null);
    } catch (error) {
      console.error('Failed to auto-save judge assignment:', error);
      setSavingQuestion(null);
      
      // Revert the change on error
      setSelectedJudges(prev => {
        const newSelections = { ...prev };
        if (!newSelections[questionId]) {
          newSelections[questionId] = new Set();
        }
        
        if (checked) {
          newSelections[questionId].delete(judgeId);
        } else {
          newSelections[questionId].add(judgeId);
        }
        
        return newSelections;
      });
      
      toast({
        title: "Error",
        description: "Failed to save assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRunEvaluations = async () => {
    if (!queueId) return;
    
    try {
      setRunning(true);
      setRunProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setRunProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      console.log('Starting evaluation run for queue:', queueId);
      const run = await dataService.runEvaluations(queueId);
      console.log('Evaluation run completed:', run);
      
      clearInterval(progressInterval);
      setRunProgress(100);
      
      setTimeout(() => {
        setRunning(false);
        setRunProgress(0);
        toast({
          title: "Evaluations Complete",
          description: "All evaluations have been processed successfully.",
        });
        navigate('/results');
      }, 1000);
    } catch (error) {
      console.error('Failed to run evaluations:', error);
      setRunning(false);
      setRunProgress(0);
      toast({
        title: "Error",
        description: "Failed to run evaluations. Please check your LLM configuration.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading queue...</p>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-semibold">Queue not found</p>
        <Button onClick={() => navigate('/queues')} className="mt-4">
          Back to Queues
        </Button>
      </div>
    );
  }

  const questions = getAllQuestions();
  const totalAssignments = Object.values(selectedJudges).reduce(
    (sum, judges) => sum + judges.size, 
    0
  );
  const latestRun = runs.sort((a, b) => b.startedAt - a.startedAt)[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/queues')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{queue.name}</h2>
            {queue.description && (
              <p className="text-muted-foreground mt-1">{queue.description}</p>
            )}
          </div>
        </div>
        <Button
          onClick={handleRunEvaluations}
          disabled={running || totalAssignments === 0}
          size="lg"
        >
          {running ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Run Evaluations
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <FileJson className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Judges</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {latestRun ? (
                <>
                  <Badge variant={latestRun.status === 'completed' ? 'default' : 'secondary'}>
                    {latestRun.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(latestRun.startedAt).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <span className="text-muted-foreground">Never</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {running && (
        <Alert className="border-blue-600">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-blue-600">Running evaluations...</p>
              <Progress value={runProgress} className="w-full" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="assignments">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignments">Judge Assignments</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No questions found</p>
                <p className="text-muted-foreground">
                  Upload submissions to this queue to configure judge assignments
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Assign Judges to Questions</CardTitle>
                    <CardDescription>
                      Select which judges should evaluate each question in this queue
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Auto-save enabled
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {questions.map((question, index) => (
                    <div key={question.id} className="relative">
                      {index > 0 && (
                        <div className="absolute -top-4 left-0 right-0 h-px bg-border" />
                      )}
                      
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-foreground mb-2">
                              {question.text}
                            </h4>
                            <Badge variant="secondary" className="text-xs font-normal">
                              {question.type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <div className="ml-4 flex items-center space-x-2">
                            {savingQuestion === question.id ? (
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3 animate-spin" />
                                <span>Saving...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                {selectedJudges[question.id]?.size > 0 && (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                )}
                                <span>{selectedJudges[question.id]?.size || 0} selected</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {judges.map((judge) => {
                            const isChecked = selectedJudges[question.id]?.has(judge.id) || false;
                            return (
                              <label
                                key={judge.id}
                                htmlFor={`${question.id}-${judge.id}`}
                                className={`
                                  relative flex items-center space-x-3 p-3 rounded-md border transition-all cursor-pointer
                                  ${isChecked 
                                    ? 'bg-primary/5 border-primary/40 shadow-sm' 
                                    : 'bg-background border-border hover:bg-muted/50 hover:border-border/80'
                                  }
                                `}
                              >
                                <Checkbox
                                  id={`${question.id}-${judge.id}`}
                                  checked={isChecked}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  onCheckedChange={(checked) => 
                                    handleJudgeToggle(question.id, judge.id, checked as boolean)
                                  }
                                />
                                <span
                                  className={`
                                    text-sm font-medium select-none flex-1
                                    ${isChecked ? 'text-foreground' : 'text-foreground/80'}
                                  `}
                                >
                                  {judge.name}
                                </span>
                                {isChecked && (
                                  <CheckCircle className="h-4 w-4 text-primary" />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Submission {submission.id}</CardTitle>
                  <Badge variant="outline">
                    {submission.questions.length} questions
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submission.questions.map((question) => (
                    <div key={question.data.id} className="space-y-2">
                      <p className="font-medium text-sm">{question.data.questionText}</p>
                      <div className="pl-4 text-sm text-muted-foreground">
                        {submission.answers[question.data.id] && (
                          <>
                            {submission.answers[question.data.id].choice && (
                              <p>Choice: {submission.answers[question.data.id].choice}</p>
                            )}
                            {submission.answers[question.data.id].reasoning && (
                              <p>Reasoning: {submission.answers[question.data.id].reasoning}</p>
                            )}
                            {submission.answers[question.data.id].text && (
                              <p>{submission.answers[question.data.id].text}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}