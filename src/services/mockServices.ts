import type { 
  Submission, 
  Judge, 
  Evaluation, 
  Queue, 
  JudgeAssignment, 
  EvaluationRun,
  LLMResponse 
} from '@/types';
import { 
  mockSubmissions, 
  mockJudges, 
  mockEvaluations, 
  mockQueues, 
  mockJudgeAssignments,
  mockEvaluationRuns
} from '@/data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDataService {
  private submissions: Submission[] = [...mockSubmissions];
  private judges: Judge[] = [...mockJudges];
  private evaluations: Evaluation[] = [...mockEvaluations];
  private queues: Queue[] = [...mockQueues];
  private judgeAssignments: JudgeAssignment[] = [...mockJudgeAssignments];
  private evaluationRuns: EvaluationRun[] = [...mockEvaluationRuns];

  // Submissions
  async getSubmissions(): Promise<Submission[]> {
    await delay(300);
    return [...this.submissions];
  }

  async getSubmissionsByQueue(queueId: string): Promise<Submission[]> {
    await delay(300);
    return this.submissions.filter(s => s.queueId === queueId);
  }

  async uploadSubmissions(jsonData: any[]): Promise<void> {
    await delay(500);
    const newSubmissions: Submission[] = jsonData.map((item, index) => ({
      ...item,
      id: `sub_${Date.now()}_${index}`
    }));
    this.submissions.push(...newSubmissions);
    
    // Update queue submission counts
    const queueCounts = new Map<string, number>();
    newSubmissions.forEach(sub => {
      queueCounts.set(sub.queueId, (queueCounts.get(sub.queueId) || 0) + 1);
    });
    
    this.queues.forEach(queue => {
      const additionalCount = queueCounts.get(queue.id) || 0;
      queue.submissionCount = (queue.submissionCount || 0) + additionalCount;
    });
  }

  // Judges
  async getJudges(): Promise<Judge[]> {
    await delay(200);
    return [...this.judges];
  }

  async getActiveJudges(): Promise<Judge[]> {
    await delay(200);
    return this.judges.filter(j => j.isActive);
  }

  async createJudge(judge: Omit<Judge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Judge> {
    await delay(300);
    const newJudge: Judge = {
      ...judge,
      id: `judge_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.judges.push(newJudge);
    return newJudge;
  }

  async updateJudge(id: string, updates: Partial<Judge>): Promise<Judge> {
    await delay(300);
    const index = this.judges.findIndex(j => j.id === id);
    if (index === -1) throw new Error('Judge not found');
    
    this.judges[index] = {
      ...this.judges[index],
      ...updates,
      updatedAt: Date.now()
    };
    return this.judges[index];
  }

  async deleteJudge(id: string): Promise<void> {
    await delay(200);
    const index = this.judges.findIndex(j => j.id === id);
    if (index === -1) throw new Error('Judge not found');
    this.judges.splice(index, 1);
  }

  // Judge Assignments
  async getJudgeAssignments(queueId?: string): Promise<JudgeAssignment[]> {
    await delay(200);
    if (queueId) {
      return this.judgeAssignments.filter(a => a.queueId === queueId);
    }
    return [...this.judgeAssignments];
  }

  async assignJudges(queueId: string, questionId: string, judgeIds: string[]): Promise<void> {
    await delay(300);
    // Remove existing assignments
    this.judgeAssignments = this.judgeAssignments.filter(
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
    this.judgeAssignments.push(...newAssignments);
  }

  // Evaluations
  async getEvaluations(): Promise<Evaluation[]> {
    await delay(300);
    return [...this.evaluations];
  }

  async getEvaluationsByQueue(queueId: string): Promise<Evaluation[]> {
    await delay(300);
    const queueSubmissions = this.submissions.filter(s => s.queueId === queueId);
    const submissionIds = new Set(queueSubmissions.map(s => s.id));
    return this.evaluations.filter(e => submissionIds.has(e.submissionId));
  }

  async runEvaluations(queueId: string): Promise<EvaluationRun> {
    await delay(500);
    
    const submissions = this.submissions.filter(s => s.queueId === queueId);
    const assignments = this.judgeAssignments.filter(a => a.queueId === queueId);
    
    const run: EvaluationRun = {
      id: `run_${Date.now()}`,
      queueId,
      startedAt: Date.now(),
      status: 'running',
      totalEvaluations: 0,
      completedEvaluations: 0,
      failedEvaluations: 0
    };
    
    this.evaluationRuns.push(run);
    
    // Simulate evaluations
    for (const submission of submissions) {
      for (const question of submission.questions) {
        const questionAssignments = assignments.filter(
          a => a.questionId === question.data.id
        );
        
        for (const assignment of questionAssignments) {
          run.totalEvaluations++;
          
          // Simulate LLM call
          await delay(100);
          
          const llmResponse = await this.callLLM(
            submission,
            question.data,
            this.judges.find(j => j.id === assignment.judgeId)!
          );
          
          const evaluation: Evaluation = {
            id: `eval_${Date.now()}_${Math.random()}`,
            submissionId: submission.id,
            questionId: question.data.id,
            judgeId: assignment.judgeId,
            verdict: llmResponse.verdict,
            reasoning: llmResponse.reasoning,
            createdAt: Date.now(),
            executionTime: Math.floor(Math.random() * 2000) + 500
          };
          
          this.evaluations.push(evaluation);
          run.completedEvaluations++;
        }
      }
    }
    
    run.completedAt = Date.now();
    run.status = 'completed';
    
    return run;
  }

  private async callLLM(
    submission: Submission,
    question: any,
    judge: Judge
  ): Promise<LLMResponse> {
    // Simulate LLM response
    await delay(200);
    
    const verdicts: LLMResponse['verdict'][] = ['pass', 'fail', 'inconclusive'];
    const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
    
    const reasonings = {
      pass: [
        'The answer demonstrates a clear understanding of the concept.',
        'Correct answer with appropriate reasoning provided.',
        'The response accurately addresses all aspects of the question.'
      ],
      fail: [
        'The answer contains factual errors that affect its validity.',
        'Insufficient reasoning to support the conclusion.',
        'The response does not adequately address the question.'
      ],
      inconclusive: [
        'The answer partially addresses the question but lacks clarity.',
        'More context is needed to fully evaluate this response.',
        'The reasoning is ambiguous and open to interpretation.'
      ]
    };
    
    const reasoningOptions = reasonings[randomVerdict];
    const randomReasoning = reasoningOptions[Math.floor(Math.random() * reasoningOptions.length)];
    
    return {
      verdict: randomVerdict,
      reasoning: randomReasoning
    };
  }

  // Queues
  async getQueues(): Promise<Queue[]> {
    await delay(200);
    return [...this.queues];
  }

  async getQueue(id: string): Promise<Queue | undefined> {
    await delay(200);
    return this.queues.find(q => q.id === id);
  }

  // Evaluation Runs
  async getEvaluationRuns(queueId?: string): Promise<EvaluationRun[]> {
    await delay(200);
    if (queueId) {
      return this.evaluationRuns.filter(r => r.queueId === queueId);
    }
    return [...this.evaluationRuns];
  }
}

// Export singleton instance
export const dataService = new MockDataService();