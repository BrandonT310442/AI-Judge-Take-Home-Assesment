export interface Question {
  rev: number;
  data: {
    id: string;
    questionType: 'single_choice' | 'single_choice_with_reasoning' | 'multiple_choice' | 'free_form';
    questionText: string;
  };
}

export interface Answer {
  choice?: string;
  reasoning?: string;
  text?: string;
}

export interface Submission {
  id: string;
  queueId: string;
  labelingTaskId: string;
  createdAt: number;
  questions: Question[];
  answers: Record<string, Answer>;
}

export interface Judge {
  id: string;
  name: string;
  systemPrompt: string;
  modelName: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface JudgeAssignment {
  id: string;
  queueId: string;
  questionId: string;
  judgeId: string;
  createdAt: number;
}

export interface Evaluation {
  id: string;
  submissionId: string;
  questionId: string;
  judgeId: string;
  verdict: 'pass' | 'fail' | 'inconclusive';
  reasoning: string;
  createdAt: number;
  executionTime?: number;
  error?: string;
}

export interface Queue {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  submissionCount?: number;
}

export interface EvaluationRun {
  id: string;
  queueId: string;
  startedAt: number;
  completedAt?: number;
  status: 'running' | 'completed' | 'failed';
  totalEvaluations: number;
  completedEvaluations: number;
  failedEvaluations: number;
}

export interface EvaluationWithMetadata extends Evaluation {
  submission: Submission;
  judge: Judge;
  question: Question;
}

export interface FilterOptions {
  judges: string[];
  questions: string[];
  verdicts: ('pass' | 'fail' | 'inconclusive')[];
}

export interface Statistics {
  totalEvaluations: number;
  passCount: number;
  failCount: number;
  inconclusiveCount: number;
  passRate: number;
}

export interface LLMResponse {
  verdict: 'pass' | 'fail' | 'inconclusive';
  reasoning: string;
}