import { apiService } from './api';
import { isSupabaseConfigured } from './supabase/client';
import type { 
  Submission, 
  Judge, 
  Evaluation, 
  Queue, 
  JudgeAssignment, 
  EvaluationRun 
} from '@/types';

class DataService {
  private service = apiService;

  constructor() {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase is not configured. Please set up your environment variables.');
    }
    console.log('Using real backend services');
  }

  // Submissions
  async uploadSubmissions(file: File): Promise<void> {
    return apiService.ingestSubmissions(file);
  }

  async getSubmissions(): Promise<Submission[]> {
    return apiService.getSubmissions();
  }

  async getSubmissionsByQueue(queueId: string): Promise<Submission[]> {
    return apiService.getSubmissionsByQueue(queueId);
  }

  // Judges
  async getJudges(): Promise<Judge[]> {
    return apiService.getJudges();
  }

  async getActiveJudges(): Promise<Judge[]> {
    return apiService.getActiveJudges();
  }

  async createJudge(judge: Omit<Judge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Judge> {
    return apiService.createJudge(judge);
  }

  async updateJudge(id: string, updates: Partial<Judge>): Promise<Judge> {
    return apiService.updateJudge(id, updates);
  }

  async deleteJudge(id: string): Promise<void> {
    return apiService.deleteJudge(id);
  }

  // Judge Assignments
  async getJudgeAssignments(queueId?: string): Promise<JudgeAssignment[]> {
    return apiService.getJudgeAssignments(queueId);
  }

  async assignJudges(queueId: string, questionId: string, judgeIds: string[]): Promise<void> {
    return apiService.assignJudges(queueId, questionId, judgeIds);
  }

  // Evaluations
  async getEvaluations(): Promise<Evaluation[]> {
    return apiService.getEvaluations();
  }

  async getEvaluationsByQueue(queueId: string): Promise<Evaluation[]> {
    return apiService.getEvaluationsByQueue(queueId);
  }

  async runEvaluations(queueId: string): Promise<EvaluationRun> {
    return apiService.runEvaluations(queueId);
  }

  // Queues
  async getQueues(): Promise<Queue[]> {
    return apiService.getQueues();
  }

  async getQueue(id: string): Promise<Queue | undefined> {
    const queue = await apiService.getQueue(id);
    return queue || undefined;
  }

  async deleteQueue(id: string): Promise<void> {
    return apiService.deleteQueue(id);
  }

  async deleteSubmission(id: string): Promise<void> {
    return apiService.deleteSubmission(id);
  }

  async deleteEvaluation(id: string): Promise<void> {
    return apiService.deleteEvaluation(id);
  }

  // Evaluation Runs
  async getEvaluationRuns(queueId?: string): Promise<EvaluationRun[]> {
    return apiService.getEvaluationRuns(queueId);
  }
}

// Export singleton instance
export const dataService = new DataService();