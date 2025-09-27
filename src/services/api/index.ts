import { supabaseService } from '@/services/supabase/supabaseService';
import { groqService } from '@/services/llm/groqService';
import { JSONParser } from '@/services/parser/jsonParser';
import type { 
  Submission, 
  Judge, 
  Evaluation, 
  Queue, 
  JudgeAssignment, 
  EvaluationRun,
  FilterOptions,
  Statistics
} from '@/types';

export class APIService {
  // ========== Data Ingestion ==========
  async ingestSubmissions(file: File): Promise<void> {
    try {
      // Parse and validate the JSON file
      const { queues, submissions } = await JSONParser.parseSubmissionsFile(file);
      
      console.log(`Processing ${queues.length} queues and ${submissions.length} submissions...`);
      
      // Store queues first with retry logic
      let queueCreationAttempts = 0;
      const maxAttempts = 3;
      
      while (queueCreationAttempts < maxAttempts) {
        try {
          await supabaseService.upsertQueues(queues);
          console.log(`Successfully created/updated ${queues.length} queues on attempt ${queueCreationAttempts + 1}`);
          break;
        } catch (queueError) {
          queueCreationAttempts++;
          console.error(`Failed to create queues (attempt ${queueCreationAttempts}):`, queueError);
          
          if (queueCreationAttempts >= maxAttempts) {
            throw new Error(`Failed to create queues after ${maxAttempts} attempts: ${queueError instanceof Error ? queueError.message : 'Unknown error'}`);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 500 * queueCreationAttempts));
        }
      }
      
      // Add a small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify queues exist before uploading submissions
      const missingQueues: string[] = [];
      
      for (const queue of queues) {
        const existingQueue = await supabaseService.getQueue(queue.id);
        if (!existingQueue) {
          missingQueues.push(queue.id);
        }
      }
      
      if (missingQueues.length > 0) {
        console.error('Missing queues after creation:', missingQueues);
        throw new Error(`Failed to create queues: ${missingQueues.join(', ')}`);
      }
      
      // Store submissions with better error handling
      try {
        await supabaseService.uploadSubmissions(submissions);
        console.log(`Successfully uploaded ${submissions.length} submissions`);
      } catch (submissionError) {
        console.error('Failed to upload submissions:', submissionError);
        
        // If it's a foreign key error, provide more context
        if (submissionError instanceof Error && submissionError.message.includes('foreign key constraint')) {
          // Try to diagnose which queues are missing
          const allQueues = await supabaseService.getQueues();
          console.error('Available queues in database:', allQueues.map(q => q.id));
          console.error('Required queues for submissions:', [...new Set(submissions.map(s => s.queueId))]);
        }
        
        throw new Error(`Failed to upload submissions: ${submissionError instanceof Error ? submissionError.message : 'Unknown error'}`);
      }
      
      console.log(`✅ Successfully ingested ${submissions.length} submissions across ${queues.length} queues`);
    } catch (error) {
      console.error('Error ingesting submissions:', error);
      throw error;
    }
  }

  // ========== Submissions ==========
  async getSubmissions(): Promise<Submission[]> {
    return supabaseService.getSubmissions();
  }

  async getSubmissionsByQueue(queueId: string): Promise<Submission[]> {
    return supabaseService.getSubmissionsByQueue(queueId);
  }

  async deleteSubmission(id: string): Promise<void> {
    return supabaseService.deleteSubmission(id);
  }

  // ========== Queues ==========
  async getQueues(): Promise<Queue[]> {
    return supabaseService.getQueues();
  }

  async getQueue(id: string): Promise<Queue | null> {
    return supabaseService.getQueue(id);
  }

  async deleteQueue(id: string): Promise<void> {
    return supabaseService.deleteQueue(id);
  }

  // ========== Judges ==========
  async createJudge(judge: Omit<Judge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Judge> {
    return supabaseService.createJudge(judge);
  }

  async updateJudge(id: string, updates: Partial<Judge>): Promise<Judge> {
    return supabaseService.updateJudge(id, updates);
  }

  async deleteJudge(id: string): Promise<void> {
    return supabaseService.deleteJudge(id);
  }

  async getJudges(): Promise<Judge[]> {
    return supabaseService.getJudges();
  }

  async getActiveJudges(): Promise<Judge[]> {
    return supabaseService.getActiveJudges();
  }

  // ========== Judge Assignments ==========
  async assignJudges(queueId: string, questionId: string, judgeIds: string[]): Promise<void> {
    return supabaseService.assignJudges(queueId, questionId, judgeIds);
  }

  async getJudgeAssignments(queueId?: string): Promise<JudgeAssignment[]> {
    return supabaseService.getJudgeAssignments(queueId);
  }

  // ========== Evaluations ==========
  async runEvaluations(queueId: string, onProgress?: (progress: number) => void): Promise<EvaluationRun> {
    console.log('🚀 Starting evaluations for queue:', queueId);
    
    // Create evaluation run
    const run = await supabaseService.createEvaluationRun(queueId);
    console.log('📝 Created evaluation run:', run);
    
    try {
      // Get all submissions for the queue
      const submissions = await supabaseService.getSubmissionsByQueue(queueId);
      console.log(`📊 Found ${submissions.length} submissions for queue ${queueId}`);
      
      // Get all judge assignments for the queue
      const assignments = await supabaseService.getJudgeAssignments(queueId);
      console.log(`⚖️ Found ${assignments.length} judge assignments for queue ${queueId}`);
      
      // Get all judges
      const judges = await supabaseService.getJudges();
      const judgeMap = new Map(judges.map(j => [j.id, j]));
      console.log(`👨‍⚖️ Found ${judges.length} total judges`);
      
      // Calculate total evaluations needed
      let totalEvaluations = 0;
      const evaluationTasks: Array<{
        submission: Submission;
        questionId: string;
        question: any;
        judgeId: string;
        judge: Judge;
      }> = [];

      for (const submission of submissions) {
        for (const question of submission.questions) {
          const questionAssignments = assignments.filter(
            a => a.questionId === question.data.id
          );
          console.log(`📋 Question ${question.data.id} has ${questionAssignments.length} assigned judges`);
          
          for (const assignment of questionAssignments) {
            const judge = judgeMap.get(assignment.judgeId);
            if (judge && judge.isActive) {
              totalEvaluations++;
              evaluationTasks.push({
                submission,
                questionId: question.data.id,
                question: question,
                judgeId: assignment.judgeId,
                judge
              });
              console.log(`✅ Added evaluation task: submission ${submission.id}, question ${question.data.id}, judge ${judge.name}`);
            } else {
              console.log(`⚠️ Skipping inactive or missing judge: ${assignment.judgeId}`);
            }
          }
        }
      }

      // Update run with total count
      console.log(`🎯 Total evaluations to run: ${totalEvaluations}`);
      
      if (totalEvaluations === 0) {
        console.warn('⚠️ No evaluations to run! Check if judges are assigned and active.');
        await supabaseService.updateEvaluationRun(run.id, {
          status: 'completed',
          completedAt: Date.now(),
          totalEvaluations: 0,
          completedEvaluations: 0,
          failedEvaluations: 0
        });
        return {
          ...run,
          status: 'completed',
          completedAt: Date.now(),
          totalEvaluations: 0,
          completedEvaluations: 0,
          failedEvaluations: 0
        };
      }
      
      await supabaseService.updateEvaluationRun(run.id, {
        totalEvaluations
      });

      // Process evaluations
      let completedCount = 0;
      let failedCount = 0;

      console.log(`🔄 Processing ${evaluationTasks.length} evaluation tasks...`);
      
      for (const task of evaluationTasks) {
        try {
          const startTime = Date.now();
          
          // Get the answer for this question
          const answer = task.submission.answers[task.questionId];
          console.log(`🔍 Evaluating submission ${task.submission.id}, question ${task.questionId} with judge ${task.judge.name}`);
          
          // Call LLM for evaluation
          const result = await groqService.evaluateSubmission({
            systemPrompt: task.judge.systemPrompt,
            question: task.question,
            answer: answer || { text: 'No answer provided' },
            modelName: task.judge.modelName
          });
          console.log(`🤖 LLM evaluation result:`, result);
          
          // Store evaluation result
          await supabaseService.createEvaluation({
            submissionId: task.submission.id,
            questionId: task.questionId,
            judgeId: task.judgeId,
            verdict: result.verdict,
            reasoning: result.reasoning,
            executionTime: Date.now() - startTime
          });
          console.log(`💾 Saved evaluation to database`);
          
          completedCount++;
        } catch (error) {
          console.error('❌ Error evaluating:', error);
          
          // Store failed evaluation
          await supabaseService.createEvaluation({
            submissionId: task.submission.id,
            questionId: task.questionId,
            judgeId: task.judgeId,
            verdict: 'inconclusive',
            reasoning: 'Evaluation failed due to an error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          failedCount++;
        }
        
        // Report progress
        if (onProgress) {
          const progress = Math.round(((completedCount + failedCount) / totalEvaluations) * 100);
          onProgress(progress);
        }
      }

      // Update run as completed
      await supabaseService.updateEvaluationRun(run.id, {
        status: 'completed',
        completedAt: Date.now(),
        completedEvaluations: completedCount,
        failedEvaluations: failedCount
      });

      return {
        ...run,
        status: 'completed',
        completedAt: Date.now(),
        totalEvaluations,
        completedEvaluations: completedCount,
        failedEvaluations: failedCount
      };
    } catch (error) {
      // Update run as failed
      await supabaseService.updateEvaluationRun(run.id, {
        status: 'failed',
        completedAt: Date.now()
      });
      
      throw error;
    }
  }

  async getEvaluations(filters?: FilterOptions): Promise<Evaluation[]> {
    return supabaseService.getEvaluations(filters);
  }

  async deleteEvaluation(id: string): Promise<void> {
    return supabaseService.deleteEvaluation(id);
  }

  async getEvaluationsByQueue(queueId: string): Promise<Evaluation[]> {
    const submissions = await supabaseService.getSubmissionsByQueue(queueId);
    const submissionIds = submissions.map(s => s.id);
    const allEvaluations = await supabaseService.getEvaluations();
    return allEvaluations.filter(e => submissionIds.includes(e.submissionId));
  }

  // ========== Statistics ==========
  async getStatistics(filters?: FilterOptions): Promise<Statistics> {
    const evaluations = await this.getEvaluations(filters);
    
    const passCount = evaluations.filter(e => e.verdict === 'pass').length;
    const failCount = evaluations.filter(e => e.verdict === 'fail').length;
    const inconclusiveCount = evaluations.filter(e => e.verdict === 'inconclusive').length;
    
    return {
      totalEvaluations: evaluations.length,
      passCount,
      failCount,
      inconclusiveCount,
      passRate: evaluations.length > 0 
        ? (passCount / evaluations.length) * 100 
        : 0
    };
  }

  // ========== Evaluation Runs ==========
  async getEvaluationRuns(queueId?: string): Promise<EvaluationRun[]> {
    // For now, we'll return mock data as runs are stored locally
    return [];
  }
}

// Export singleton instance
export const apiService = new APIService();