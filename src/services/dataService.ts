import { apiService } from './api';
import { dataService as mockDataService } from './mockServices';
import { isSupabaseConfigured } from './supabase/client';
import type { 
  Submission, 
  Judge, 
  Evaluation, 
  Queue, 
  JudgeAssignment, 
  EvaluationRun 
} from '@/types';

// Check if we should use real services or mock
const USE_REAL_BACKEND = isSupabaseConfigured();

class DataService {
  private service = USE_REAL_BACKEND ? apiService : mockDataService;

  constructor() {
    console.log(`Using ${USE_REAL_BACKEND ? 'real backend' : 'mock'} services`);
  }

  // Submissions
  async uploadSubmissions(file: File): Promise<void> {
    if (USE_REAL_BACKEND) {
      return apiService.ingestSubmissions(file);
    } else {
      // For mock, parse the file and store in memory
      const text = await file.text();
      const data = JSON.parse(text);
      return mockDataService.uploadSubmissions(Array.isArray(data) ? data : [data]);
    }
  }

  async getSubmissions(): Promise<Submission[]> {
    return USE_REAL_BACKEND 
      ? apiService.getSubmissions()
      : mockDataService.getSubmissions();
  }

  async getSubmissionsByQueue(queueId: string): Promise<Submission[]> {
    return USE_REAL_BACKEND
      ? apiService.getSubmissionsByQueue(queueId)
      : mockDataService.getSubmissionsByQueue(queueId);
  }

  // Judges
  async getJudges(): Promise<Judge[]> {
    return USE_REAL_BACKEND
      ? apiService.getJudges()
      : mockDataService.getJudges();
  }

  async getActiveJudges(): Promise<Judge[]> {
    return USE_REAL_BACKEND
      ? apiService.getActiveJudges()
      : mockDataService.getActiveJudges();
  }

  async createJudge(judge: Omit<Judge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Judge> {
    return USE_REAL_BACKEND
      ? apiService.createJudge(judge)
      : mockDataService.createJudge(judge);
  }

  async updateJudge(id: string, updates: Partial<Judge>): Promise<Judge> {
    return USE_REAL_BACKEND
      ? apiService.updateJudge(id, updates)
      : mockDataService.updateJudge(id, updates);
  }

  async deleteJudge(id: string): Promise<void> {
    return USE_REAL_BACKEND
      ? apiService.deleteJudge(id)
      : mockDataService.deleteJudge(id);
  }

  // Judge Assignments
  async getJudgeAssignments(queueId?: string): Promise<JudgeAssignment[]> {
    return USE_REAL_BACKEND
      ? apiService.getJudgeAssignments(queueId)
      : mockDataService.getJudgeAssignments(queueId);
  }

  async assignJudges(queueId: string, questionId: string, judgeIds: string[]): Promise<void> {
    return USE_REAL_BACKEND
      ? apiService.assignJudges(queueId, questionId, judgeIds)
      : mockDataService.assignJudges(queueId, questionId, judgeIds);
  }

  // Evaluations
  async getEvaluations(): Promise<Evaluation[]> {
    return USE_REAL_BACKEND
      ? apiService.getEvaluations()
      : mockDataService.getEvaluations();
  }

  async getEvaluationsByQueue(queueId: string): Promise<Evaluation[]> {
    return USE_REAL_BACKEND
      ? apiService.getEvaluationsByQueue(queueId)
      : mockDataService.getEvaluationsByQueue(queueId);
  }

  async runEvaluations(queueId: string): Promise<EvaluationRun> {
    return USE_REAL_BACKEND
      ? apiService.runEvaluations(queueId)
      : mockDataService.runEvaluations(queueId);
  }

  // Queues
  async getQueues(): Promise<Queue[]> {
    return USE_REAL_BACKEND
      ? apiService.getQueues()
      : mockDataService.getQueues();
  }

  async getQueue(id: string): Promise<Queue | undefined> {
    if (USE_REAL_BACKEND) {
      const queue = await apiService.getQueue(id);
      return queue || undefined;
    }
    return mockDataService.getQueue(id);
  }

  async deleteQueue(id: string): Promise<void> {
    return USE_REAL_BACKEND
      ? apiService.deleteQueue(id)
      : mockDataService.deleteQueue?.(id) || Promise.resolve();
  }

  async deleteSubmission(id: string): Promise<void> {
    return USE_REAL_BACKEND
      ? apiService.deleteSubmission(id)
      : mockDataService.deleteSubmission?.(id) || Promise.resolve();
  }

  async deleteEvaluation(id: string): Promise<void> {
    return USE_REAL_BACKEND
      ? apiService.deleteEvaluation(id)
      : mockDataService.deleteEvaluation?.(id) || Promise.resolve();
  }

  // Evaluation Runs
  async getEvaluationRuns(queueId?: string): Promise<EvaluationRun[]> {
    return USE_REAL_BACKEND
      ? apiService.getEvaluationRuns(queueId)
      : mockDataService.getEvaluationRuns(queueId);
  }
}

// Export singleton instance
export const dataService = new DataService();