import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ClipboardList, 
  ArrowRight,
  FileJson,
  Clock,
  BarChart3,
  Trash2
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { Queue, Submission, EvaluationRun } from '@/types';

export function Queues() {
  const { toast } = useToast();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [runs, setRuns] = useState<EvaluationRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [queuesData, submissionsData, runsData] = await Promise.all([
      dataService.getQueues(),
      dataService.getSubmissions(),
      dataService.getEvaluationRuns()
    ]);
    setQueues(queuesData);
    setSubmissions(submissionsData);
    setRuns(runsData);
    setLoading(false);
  };

  const getQueueStats = (queueId: string) => {
    const queueSubmissions = submissions.filter(s => s.queueId === queueId);
    const queueRuns = runs.filter(r => r.queueId === queueId);
    const latestRun = queueRuns.sort((a, b) => b.startedAt - a.startedAt)[0];
    
    let totalQuestions = 0;
    queueSubmissions.forEach(sub => {
      totalQuestions += sub.questions.length;
    });

    return {
      submissionCount: queueSubmissions.length,
      questionCount: totalQuestions,
      latestRun
    };
  };

  const handleDeleteQueue = async (id: string, name: string) => {
    try {
      await dataService.deleteQueue(id);
      await loadData();
      toast({
        title: "Queue Deleted",
        description: `Queue "${name}" and all associated data has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting queue:', error);
      toast({
        title: "Error",
        description: "Failed to delete queue. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Queues</h2>
        <p className="text-muted-foreground mt-2">
          Manage submission queues and configure judge assignments
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading queues...</p>
          </CardContent>
        </Card>
      ) : queues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No queues found</h3>
            <p className="text-muted-foreground">
              Upload submissions to create queues automatically
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {queues.map((queue) => {
            const stats = getQueueStats(queue.id);
            
            return (
              <Card key={queue.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{queue.name}</CardTitle>
                      {queue.description && (
                        <CardDescription>{queue.description}</CardDescription>
                      )}
                    </div>
                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Submissions</p>
                        <div className="flex items-center">
                          <FileJson className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="font-semibold">{stats.submissionCount}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Questions</p>
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="font-semibold">{stats.questionCount}</span>
                        </div>
                      </div>
                    </div>

                    {stats.latestRun && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Latest Run</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(stats.latestRun.startedAt).toLocaleDateString()}
                          </div>
                          <Badge 
                            variant={stats.latestRun.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {stats.latestRun.status}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link to={`/queue/${queue.id}`} className="flex-1">
                        <Button className="w-full" variant="outline">
                          View Queue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to delete queue "{queue.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will also delete all associated submissions and evaluations.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteQueue(queue.id, queue.name)}>
                              OK
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}