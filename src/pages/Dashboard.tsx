import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileJson, 
  Users, 
  Gavel, 
  ChartBar,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { Queue, Judge, Evaluation, Submission } from '@/types';

export function Dashboard() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [queuesData, judgesData, evaluationsData, submissionsData] = await Promise.all([
      dataService.getQueues(),
      dataService.getJudges(),
      dataService.getEvaluations(),
      dataService.getSubmissions()
    ]);
    setQueues(queuesData);
    setJudges(judgesData);
    setEvaluations(evaluationsData);
    setSubmissions(submissionsData);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Check if it's a JSON file (by type or extension)
    const isJsonFile = file.type === 'application/json' || 
                       file.type === '' || 
                       (file.name && file.name.endsWith('.json'));
    
    if (!isJsonFile) {
      setUploadError('Please upload a JSON file');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Pass the file object directly
      await dataService.uploadSubmissions(file);
      setUploadSuccess(true);
      await loadData();
      
      // Reset after success
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadProgress(0);
      }, 3000);
    } catch (error) {
      setUploadError('Failed to parse JSON file. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  const activeJudges = judges.filter(j => j.isActive);
  const passCount = evaluations.filter(e => e.verdict === 'pass').length;
  const failCount = evaluations.filter(e => e.verdict === 'fail').length;
  const inconclusiveCount = evaluations.filter(e => e.verdict === 'inconclusive').length;
  const passRate = evaluations.length > 0 
    ? Math.round((passCount / evaluations.length) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Welcome to AI Judge - Upload submissions and manage automated evaluations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileJson className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {queues.length} queues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Judges</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJudges.length}</div>
            <p className="text-xs text-muted-foreground">
              {judges.length - activeJudges.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluations.length}</div>
            <p className="text-xs text-muted-foreground">
              {passRate}% pass rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluation Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="bg-green-600">{passCount}</Badge>
              <Badge variant="destructive">{failCount}</Badge>
              <Badge variant="secondary">{inconclusiveCount}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pass / Fail / Inconclusive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* File Upload Card */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle>Upload Submissions</CardTitle>
          <CardDescription>
            Upload a JSON file containing submission data to be evaluated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-all ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 text-muted-foreground">
                <Upload className="h-12 w-12" />
              </div>
              
              {uploading ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                  <Progress value={uploadProgress} className="w-64 mx-auto" />
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-lg font-medium">
                      Drop your JSON file here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Only .json files are accepted
                    </p>
                  </div>
                  <Button variant="secondary" className="pointer-events-none">
                    Select File
                  </Button>
                </>
              )}
            </div>
          </div>

          {uploadSuccess && (
            <Alert className="mt-4 border-green-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                File uploaded successfully! The submissions have been added to the system.
              </AlertDescription>
            </Alert>
          )}

          {uploadError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Evaluations</CardTitle>
          <CardDescription>
            Latest evaluation results across all queues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {evaluations.slice(0, 5).map((evaluation) => {
              const submission = submissions.find(s => s.id === evaluation.submissionId);
              const judge = judges.find(j => j.id === evaluation.judgeId);
              
              return (
                <div key={evaluation.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Clock className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {judge?.name || 'Unknown Judge'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Evaluated submission {submission?.id || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      evaluation.verdict === 'pass' ? 'default' : 
                      evaluation.verdict === 'fail' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {evaluation.verdict}
                  </Badge>
                </div>
              );
            })}
            
            {evaluations.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No evaluations yet. Upload submissions and run evaluations to see results.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}