import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  FileJson,
  Clock,
  Hash,
  ClipboardList,
  Trash2
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { Submission, Queue } from '@/types';

export function Submissions() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [submissionsData, queuesData] = await Promise.all([
      dataService.getSubmissions(),
      dataService.getQueues()
    ]);
    setSubmissions(submissionsData.sort((a, b) => b.createdAt - a.createdAt));
    setQueues(queuesData);
    setLoading(false);
  };

  const getQueueName = (queueId: string) => {
    const queue = queues.find(q => q.id === queueId);
    return queue?.name || queueId;
  };

  const getQuestionTypeColor = (type: string) => {
    switch(type) {
      case 'single_choice':
      case 'single_choice_with_reasoning':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'multiple_choice':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'free_form':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      // Check if this is the last submission in its queue
      const submission = submissions.find(s => s.id === id);
      const sameQueueSubmissions = submissions.filter(s => s.queueId === submission?.queueId);
      const isLastInQueue = sameQueueSubmissions.length === 1;
      
      await dataService.deleteSubmission(id);
      await loadData();
      
      toast({
        title: "Submission Deleted",
        description: isLastInQueue 
          ? `Submission ${id} and its queue have been deleted.`
          : `Submission ${id} and its evaluations have been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: "Error",
        description: "Failed to delete submission. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
        <p className="text-muted-foreground mt-2">
          View all uploaded submissions and their details
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileJson className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Queues</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queues.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.reduce((acc, sub) => acc + sub.questions.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading submissions...</p>
          </CardContent>
        </Card>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileJson className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
            <p className="text-muted-foreground">
              Upload JSON files from the dashboard to see submissions here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      Submission {submission.id}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <ClipboardList className="h-4 w-4 mr-1" />
                        {getQueueName(submission.queueId)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {submission.questions.length} questions
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to delete submission {submission.id}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will also delete all associated evaluations. If this is the last submission in its queue, the queue will also be deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSubmission(submission.id)}>
                            OK
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submission.questions.map((question, index) => (
                    <div key={question.data.id} className="border-l-2 border-muted pl-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <p className="font-medium text-sm">
                            Q{index + 1}: {question.data.questionText}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getQuestionTypeColor(question.data.questionType)}`}
                          >
                            {question.data.questionType.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {submission.answers[question.data.id] && (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase">Answer</p>
                          {submission.answers[question.data.id].choice && (
                            <div>
                              <p className="text-xs text-muted-foreground">Choice:</p>
                              <p className="text-sm">{submission.answers[question.data.id].choice}</p>
                            </div>
                          )}
                          {submission.answers[question.data.id].reasoning && (
                            <div>
                              <p className="text-xs text-muted-foreground">Reasoning:</p>
                              <p className="text-sm">{submission.answers[question.data.id].reasoning}</p>
                            </div>
                          )}
                          {submission.answers[question.data.id].text && (
                            <div>
                              <p className="text-xs text-muted-foreground">Response:</p>
                              <p className="text-sm">{submission.answers[question.data.id].text}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}