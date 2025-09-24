import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  PlayCircle,
  Save,
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
  
  const [queue, setQueue] = useState<Queue | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);
  const [selectedJudges, setSelectedJudges] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    if (queueId) {
      loadData();
    }
  }, [queueId]);

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

  const handleJudgeToggle = (questionId: string, judgeId: string, checked: boolean) => {
    setSelectedJudges(prev => {
      const newSelections = { ...prev };
      if (!newSelections[questionId]) {
        newSelections[questionId] = new Set();
      }
      
      if (checked) {
        newSelections[questionId].add(judgeId);
      } else {
        newSelections[questionId].delete(judgeId);
      }
      
      return newSelections;
    });
  };

  const handleSaveAssignments = async () => {
    if (!queueId) return;
    
    setSaving(true);
    
    for (const [questionId, judgeIds] of Object.entries(selectedJudges)) {
      await dataService.assignJudges(queueId, questionId, Array.from(judgeIds));
    }
    
    await loadData();
    setSaving(false);
  };

  const handleRunEvaluations = async () => {
    if (!queueId) return;
    
    setRunning(true);
    setRunProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setRunProgress(prev => Math.min(prev + 10, 90));
    }, 200);
    
    const run = await dataService.runEvaluations(queueId);
    
    clearInterval(progressInterval);
    setRunProgress(100);
    
    setTimeout(() => {
      setRunning(false);
      setRunProgress(0);
      navigate('/results');
    }, 1000);
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
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleSaveAssignments}
            disabled={saving || running}
          >
            {saving ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Assignments
              </>
            )}
          </Button>
          <Button
            onClick={handleRunEvaluations}
            disabled={running || totalAssignments === 0}
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
                <CardTitle>Assign Judges to Questions</CardTitle>
                <CardDescription>
                  Select which judges should evaluate each question in this queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {questions.map((question) => (
                    <div key={question.id} className="space-y-3">
                      <div className="space-y-1">
                        <h4 className="font-medium">{question.text}</h4>
                        <Badge variant="outline" className="text-xs">
                          {question.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {judges.map((judge) => (
                          <div key={judge.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${question.id}-${judge.id}`}
                              checked={selectedJudges[question.id]?.has(judge.id) || false}
                              onCheckedChange={(checked) => 
                                handleJudgeToggle(question.id, judge.id, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`${question.id}-${judge.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {judge.name}
                            </label>
                          </div>
                        ))}
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