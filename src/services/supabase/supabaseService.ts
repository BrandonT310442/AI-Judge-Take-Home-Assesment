import { supabase, isSupabaseConfigured } from './client';
import type { 
  Submission, 
  Judge, 
  Evaluation, 
  Queue, 
  JudgeAssignment, 
  EvaluationRun,
  FilterOptions
} from '@/types';

export class SupabaseService {
  private useSupabase: boolean;

  constructor() {
    this.useSupabase = isSupabaseConfigured();
    if (!this.useSupabase) {
      console.warn('Supabase not configured. Using in-memory storage.');
    }
  }

  // ========== Queues ==========
  async getQueues(): Promise<Queue[]> {
    if (!this.useSupabase) return this.getLocalQueues();

    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching queues:', error);
      return [];
    }

    // Transform database response to Queue type
    return (data || []).map(item => this.mapDbQueueToQueue(item));
  }

  async getQueue(id: string): Promise<Queue | null> {
    if (!this.useSupabase) {
      const queues = await this.getLocalQueues();
      return queues.find(q => q.id === id) || null;
    }

    const { data, error } = await supabase
      .from('queues')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching queue:', error);
      return null;
    }

    return data ? this.mapDbQueueToQueue(data) : null;
  }

  async upsertQueues(queues: Queue[]): Promise<void> {
    if (!this.useSupabase) {
      // For local storage, append to existing queues instead of replacing
      const existingQueues = this.getLocalQueues();
      this.setLocalQueues([...existingQueues, ...queues]);
      return;
    }

    // Transform Queue objects to match database schema (snake_case)
    const dbQueues = queues.map(queue => ({
      id: queue.id,
      name: queue.name,
      description: queue.description,
      created_at: new Date(queue.createdAt).toISOString(),
      submission_count: queue.submissionCount
    }));

    // Use insert instead of upsert to always create new records
    const { error } = await supabase
      .from('queues')
      .insert(dbQueues);

    if (error) {
      console.error('Error inserting queues:', error);
      throw error;
    }
  }

  // ========== Submissions ==========
  async uploadSubmissions(submissions: Submission[]): Promise<void> {
    if (!this.useSupabase) {
      // For local storage, append to existing submissions instead of replacing
      const existingSubmissions = this.getLocalSubmissions();
      this.setLocalSubmissions([...existingSubmissions, ...submissions]);
      return;
    }

    // Transform Submission objects to match database schema (snake_case)
    const dbSubmissions = submissions.map(submission => ({
      id: submission.id,
      queue_id: submission.queueId,
      labeling_task_id: submission.labelingTaskId,
      created_at: new Date(submission.createdAt).toISOString(),
      questions: submission.questions,
      answers: submission.answers
    }));

    // Use insert instead of upsert to always create new records
    const { error } = await supabase
      .from('submissions')
      .insert(dbSubmissions);

    if (error) {
      console.error('Error uploading submissions:', error);
      throw error;
    }
  }

  async getSubmissions(): Promise<Submission[]> {
    if (!this.useSupabase) return this.getLocalSubmissions();

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }

    // Transform database response to Submission type
    return (data || []).map(item => this.mapDbSubmissionToSubmission(item));
  }

  async getSubmissionsByQueue(queueId: string): Promise<Submission[]> {
    if (!this.useSupabase) {
      const submissions = await this.getLocalSubmissions();
      return submissions.filter(s => s.queueId === queueId);
    }

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('queue_id', queueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }

    // Transform database response to Submission type
    return (data || []).map(item => this.mapDbSubmissionToSubmission(item));
  }

  // ========== Judges ==========
  async createJudge(judge: Omit<Judge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Judge> {
    if (!this.useSupabase) {
      const newJudge = {
        ...judge,
        id: `judge_${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const judges = await this.getLocalJudges();
      judges.push(newJudge);
      this.setLocalJudges(judges);
      return newJudge;
    }

    const { data, error } = await supabase
      .from('judges')
      .insert({
        name: judge.name,
        system_prompt: judge.systemPrompt,
        model_name: judge.modelName,
        is_active: judge.isActive
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating judge:', error);
      throw error;
    }

    return this.mapDbJudgeToJudge(data);
  }

  async updateJudge(id: string, updates: Partial<Judge>): Promise<Judge> {
    if (!this.useSupabase) {
      const judges = await this.getLocalJudges();
      const index = judges.findIndex(j => j.id === id);
      if (index !== -1) {
        judges[index] = { ...judges[index], ...updates, updatedAt: Date.now() };
        this.setLocalJudges(judges);
        return judges[index];
      }
      throw new Error('Judge not found');
    }

    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.systemPrompt) dbUpdates.system_prompt = updates.systemPrompt;
    if (updates.modelName) dbUpdates.model_name = updates.modelName;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('judges')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating judge:', error);
      throw error;
    }

    return this.mapDbJudgeToJudge(data);
  }

  async deleteJudge(id: string): Promise<void> {
    if (!this.useSupabase) {
      const judges = await this.getLocalJudges();
      this.setLocalJudges(judges.filter(j => j.id !== id));
      return;
    }

    const { error } = await supabase
      .from('judges')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting judge:', error);
      throw error;
    }
  }

  async getJudges(): Promise<Judge[]> {
    if (!this.useSupabase) return this.getLocalJudges();

    const { data, error } = await supabase
      .from('judges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching judges:', error);
      return [];
    }

    return (data || []).map(this.mapDbJudgeToJudge);
  }

  async getActiveJudges(): Promise<Judge[]> {
    if (!this.useSupabase) {
      const judges = await this.getLocalJudges();
      return judges.filter(j => j.isActive);
    }

    const { data, error } = await supabase
      .from('judges')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active judges:', error);
      return [];
    }

    return (data || []).map(this.mapDbJudgeToJudge);
  }

  // ========== Judge Assignments ==========
  async assignJudges(queueId: string, questionId: string, judgeIds: string[]): Promise<void> {
    console.log(`📝 Assigning ${judgeIds.length} judges to question ${questionId} in queue ${queueId}`);
    
    if (!this.useSupabase) {
      const assignments = await this.getLocalAssignments();
      // Remove existing assignments for this queue/question
      const filtered = assignments.filter(
        a => !(a.queueId === queueId && a.questionId === questionId)
      );
      // Add new assignments
      const newAssignments = judgeIds.map(judgeId => ({
        id: `assign_${Date.now()}_${judgeId}`,
        queueId,
        questionId,
        judgeId,
        createdAt: Date.now()
      }));
      this.setLocalAssignments([...filtered, ...newAssignments]);
      console.log(`✅ Stored ${newAssignments.length} assignments locally`);
      return;
    }

    // Delete existing assignments
    console.log('🗑️ Deleting existing assignments for queue:', queueId, 'question:', questionId);
    const { data: deleteData, error: deleteError } = await supabase
      .from('judge_assignments')
      .delete()
      .eq('queue_id', queueId)
      .eq('question_id', questionId)
      .select();
    
    if (deleteError) {
      console.error('❌ Error deleting existing assignments:', deleteError);
    } else {
      console.log(`🗑️ Deleted ${deleteData?.length || 0} existing assignments`);
    }

    // Insert new assignments
    if (judgeIds.length > 0) {
      const assignments = judgeIds.map(judgeId => ({
        queue_id: queueId,
        question_id: questionId,
        judge_id: judgeId
      }));

      console.log('📤 Inserting assignments to Supabase:', JSON.stringify(assignments, null, 2));
      const { data: insertData, error } = await supabase
        .from('judge_assignments')
        .insert(assignments)
        .select();

      if (error) {
        console.error('❌ Error assigning judges - Full error:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      console.log(`✅ Successfully assigned ${assignments.length} judges. Inserted records:`, insertData);
    } else {
      console.log('ℹ️ No judges to assign (empty judgeIds array)');
    }
  }

  async getJudgeAssignments(queueId?: string): Promise<JudgeAssignment[]> {
    if (!this.useSupabase) {
      const assignments = await this.getLocalAssignments();
      return queueId ? assignments.filter(a => a.queueId === queueId) : assignments;
    }

    console.log(`🔍 Fetching judge assignments for queue: ${queueId || 'all'}`);
    let query = supabase.from('judge_assignments').select('*');
    if (queueId) {
      query = query.eq('queue_id', queueId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching assignments:', error);
      return [];
    }

    console.log(`📋 Raw assignments from Supabase:`, data);
    
    const mapped = (data || []).map(item => ({
      id: item.id,
      queueId: item.queue_id,
      questionId: item.question_id,
      judgeId: item.judge_id,
      createdAt: new Date(item.created_at).getTime()
    }));
    
    console.log(`✅ Mapped ${mapped.length} assignments:`, mapped);
    return mapped;
  }

  // ========== Evaluations ==========
  async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'createdAt'>): Promise<Evaluation> {
    if (!this.useSupabase) {
      const newEval = {
        ...evaluation,
        id: `eval_${Date.now()}`,
        createdAt: Date.now()
      };
      const evaluations = await this.getLocalEvaluations();
      evaluations.push(newEval);
      this.setLocalEvaluations(evaluations);
      return newEval;
    }

    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        submission_id: evaluation.submissionId,
        question_id: evaluation.questionId,
        judge_id: evaluation.judgeId,
        verdict: evaluation.verdict,
        reasoning: evaluation.reasoning,
        execution_time: evaluation.executionTime,
        error: evaluation.error
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }

    return this.mapDbEvaluationToEvaluation(data);
  }

  async getEvaluations(filters?: FilterOptions): Promise<Evaluation[]> {
    if (!this.useSupabase) {
      let evaluations = await this.getLocalEvaluations();
      
      if (filters) {
        if (filters.judges?.length) {
          evaluations = evaluations.filter(e => filters.judges!.includes(e.judgeId));
        }
        if (filters.questions?.length) {
          evaluations = evaluations.filter(e => filters.questions!.includes(e.questionId));
        }
        if (filters.verdicts?.length) {
          evaluations = evaluations.filter(e => filters.verdicts!.includes(e.verdict));
        }
      }
      
      return evaluations;
    }

    let query = supabase.from('evaluations').select('*');

    if (filters) {
      if (filters.judges?.length) {
        query = query.in('judge_id', filters.judges);
      }
      if (filters.questions?.length) {
        query = query.in('question_id', filters.questions);
      }
      if (filters.verdicts?.length) {
        query = query.in('verdict', filters.verdicts);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching evaluations:', error);
      return [];
    }

    return (data || []).map(this.mapDbEvaluationToEvaluation);
  }

  // ========== Evaluation Runs ==========
  async createEvaluationRun(queueId: string): Promise<EvaluationRun> {
    if (!this.useSupabase) {
      const newRun: EvaluationRun = {
        id: `run_${Date.now()}`,
        queueId,
        startedAt: Date.now(),
        status: 'running',
        totalEvaluations: 0,
        completedEvaluations: 0,
        failedEvaluations: 0
      };
      const runs = await this.getLocalRuns();
      runs.push(newRun);
      this.setLocalRuns(runs);
      return newRun;
    }

    const { data, error } = await supabase
      .from('evaluation_runs')
      .insert({
        queue_id: queueId,
        status: 'running'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating evaluation run:', error);
      throw error;
    }

    return this.mapDbRunToRun(data);
  }

  async updateEvaluationRun(id: string, updates: Partial<EvaluationRun>): Promise<void> {
    if (!this.useSupabase) {
      const runs = await this.getLocalRuns();
      const index = runs.findIndex(r => r.id === id);
      if (index !== -1) {
        runs[index] = { ...runs[index], ...updates };
        this.setLocalRuns(runs);
      }
      return;
    }

    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.completedAt) dbUpdates.completed_at = new Date(updates.completedAt).toISOString();
    if (updates.totalEvaluations !== undefined) dbUpdates.total_evaluations = updates.totalEvaluations;
    if (updates.completedEvaluations !== undefined) dbUpdates.completed_evaluations = updates.completedEvaluations;
    if (updates.failedEvaluations !== undefined) dbUpdates.failed_evaluations = updates.failedEvaluations;

    const { error } = await supabase
      .from('evaluation_runs')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating evaluation run:', error);
      throw error;
    }
  }

  // ========== Helper Methods ==========
  private mapDbQueueToQueue(dbQueue: any): Queue {
    return {
      id: dbQueue.id,
      name: dbQueue.name,
      description: dbQueue.description,
      createdAt: new Date(dbQueue.created_at).getTime(),
      submissionCount: dbQueue.submission_count
    };
  }

  private mapDbSubmissionToSubmission(dbSubmission: any): Submission {
    return {
      id: dbSubmission.id,
      queueId: dbSubmission.queue_id,
      labelingTaskId: dbSubmission.labeling_task_id,
      createdAt: new Date(dbSubmission.created_at).getTime(),
      questions: dbSubmission.questions,
      answers: dbSubmission.answers
    };
  }

  private mapDbJudgeToJudge(dbJudge: any): Judge {
    return {
      id: dbJudge.id,
      name: dbJudge.name,
      systemPrompt: dbJudge.system_prompt,
      modelName: dbJudge.model_name,
      isActive: dbJudge.is_active,
      createdAt: new Date(dbJudge.created_at).getTime(),
      updatedAt: new Date(dbJudge.updated_at).getTime()
    };
  }

  private mapDbEvaluationToEvaluation(dbEval: any): Evaluation {
    return {
      id: dbEval.id,
      submissionId: dbEval.submission_id,
      questionId: dbEval.question_id,
      judgeId: dbEval.judge_id,
      verdict: dbEval.verdict,
      reasoning: dbEval.reasoning,
      executionTime: dbEval.execution_time,
      error: dbEval.error,
      createdAt: new Date(dbEval.created_at).getTime()
    };
  }

  private mapDbRunToRun(dbRun: any): EvaluationRun {
    return {
      id: dbRun.id,
      queueId: dbRun.queue_id,
      startedAt: new Date(dbRun.started_at).getTime(),
      completedAt: dbRun.completed_at ? new Date(dbRun.completed_at).getTime() : undefined,
      status: dbRun.status,
      totalEvaluations: dbRun.total_evaluations,
      completedEvaluations: dbRun.completed_evaluations,
      failedEvaluations: dbRun.failed_evaluations
    };
  }

  // ========== Local Storage Fallback ==========
  private getLocalQueues(): Queue[] {
    const stored = localStorage.getItem('ai-judge-queues');
    return stored ? JSON.parse(stored) : [];
  }

  private setLocalQueues(queues: Queue[]): void {
    localStorage.setItem('ai-judge-queues', JSON.stringify(queues));
  }

  private getLocalSubmissions(): Submission[] {
    const stored = localStorage.getItem('ai-judge-submissions');
    return stored ? JSON.parse(stored) : [];
  }

  private setLocalSubmissions(submissions: Submission[]): void {
    localStorage.setItem('ai-judge-submissions', JSON.stringify(submissions));
  }

  private getLocalJudges(): Judge[] {
    const stored = localStorage.getItem('ai-judge-judges');
    return stored ? JSON.parse(stored) : [];
  }

  private setLocalJudges(judges: Judge[]): void {
    localStorage.setItem('ai-judge-judges', JSON.stringify(judges));
  }

  private getLocalAssignments(): JudgeAssignment[] {
    const stored = localStorage.getItem('ai-judge-assignments');
    return stored ? JSON.parse(stored) : [];
  }

  private setLocalAssignments(assignments: JudgeAssignment[]): void {
    localStorage.setItem('ai-judge-assignments', JSON.stringify(assignments));
  }

  private getLocalEvaluations(): Evaluation[] {
    const stored = localStorage.getItem('ai-judge-evaluations');
    return stored ? JSON.parse(stored) : [];
  }

  private setLocalEvaluations(evaluations: Evaluation[]): void {
    localStorage.setItem('ai-judge-evaluations', JSON.stringify(evaluations));
  }

  private getLocalRuns(): EvaluationRun[] {
    const stored = localStorage.getItem('ai-judge-runs');
    return stored ? JSON.parse(stored) : [];
  }

  private setLocalRuns(runs: EvaluationRun[]): void {
    localStorage.setItem('ai-judge-runs', JSON.stringify(runs));
  }
}

export const supabaseService = new SupabaseService();