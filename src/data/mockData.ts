import type { Submission, Judge, Evaluation, Queue, JudgeAssignment, EvaluationRun } from '@/types';

export const mockSubmissions: Submission[] = [
  {
    id: 'sub_1',
    queueId: 'queue_1',
    labelingTaskId: 'task_1',
    createdAt: 1690000000000,
    questions: [
      {
        rev: 1,
        data: {
          id: 'q_template_1',
          questionType: 'single_choice_with_reasoning',
          questionText: 'Is the sky blue?'
        }
      }
    ],
    answers: {
      'q_template_1': {
        choice: 'yes',
        reasoning: 'Observed on a clear day.'
      }
    }
  },
  {
    id: 'sub_2',
    queueId: 'queue_1',
    labelingTaskId: 'task_2',
    createdAt: 1690100000000,
    questions: [
      {
        rev: 1,
        data: {
          id: 'q_template_1',
          questionType: 'single_choice_with_reasoning',
          questionText: 'Is the sky blue?'
        }
      },
      {
        rev: 1,
        data: {
          id: 'q_template_2',
          questionType: 'free_form',
          questionText: 'What is machine learning?'
        }
      }
    ],
    answers: {
      'q_template_1': {
        choice: 'no',
        reasoning: 'It was cloudy today.'
      },
      'q_template_2': {
        text: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.'
      }
    }
  },
  {
    id: 'sub_3',
    queueId: 'queue_2',
    labelingTaskId: 'task_3',
    createdAt: 1690200000000,
    questions: [
      {
        rev: 1,
        data: {
          id: 'q_template_3',
          questionType: 'multiple_choice',
          questionText: 'Which of the following are programming languages?'
        }
      }
    ],
    answers: {
      'q_template_3': {
        choice: 'Python, JavaScript, Java',
      }
    }
  }
];

export const mockJudges: Judge[] = [
  {
    id: 'judge_1',
    name: 'Accuracy Judge',
    systemPrompt: 'You are an expert judge evaluating the accuracy of answers. Be strict but fair. Focus on factual correctness and logical reasoning.',
    modelName: 'gpt-4-turbo-preview',
    isActive: true,
    createdAt: 1689900000000,
    updatedAt: 1689900000000
  },
  {
    id: 'judge_2',
    name: 'Reasoning Quality',
    systemPrompt: 'Evaluate the quality of reasoning provided in answers. Consider clarity, logical flow, and completeness of explanations.',
    modelName: 'claude-3-opus',
    isActive: true,
    createdAt: 1689910000000,
    updatedAt: 1689910000000
  },
  {
    id: 'judge_3',
    name: 'Technical Expert',
    systemPrompt: 'You are a technical expert. Evaluate answers for technical accuracy, proper terminology, and depth of understanding.',
    modelName: 'gemini-pro',
    isActive: true,
    createdAt: 1689920000000,
    updatedAt: 1689920000000
  },
  {
    id: 'judge_4',
    name: 'Clarity Assessor',
    systemPrompt: 'Assess the clarity and comprehensibility of answers. Focus on communication quality rather than technical accuracy.',
    modelName: 'gpt-3.5-turbo',
    isActive: false,
    createdAt: 1689930000000,
    updatedAt: 1689930000000
  }
];

export const mockEvaluations: Evaluation[] = [
  {
    id: 'eval_1',
    submissionId: 'sub_1',
    questionId: 'q_template_1',
    judgeId: 'judge_1',
    verdict: 'pass',
    reasoning: 'The answer correctly identifies that the sky appears blue on clear days, with appropriate reasoning.',
    createdAt: 1690300000000,
    executionTime: 1234
  },
  {
    id: 'eval_2',
    submissionId: 'sub_1',
    questionId: 'q_template_1',
    judgeId: 'judge_2',
    verdict: 'pass',
    reasoning: 'The reasoning is concise and directly supports the answer.',
    createdAt: 1690301000000,
    executionTime: 987
  },
  {
    id: 'eval_3',
    submissionId: 'sub_2',
    questionId: 'q_template_1',
    judgeId: 'judge_1',
    verdict: 'inconclusive',
    reasoning: 'While the observation about cloudy weather is valid, the general statement about sky color is more complex.',
    createdAt: 1690302000000,
    executionTime: 1567
  },
  {
    id: 'eval_4',
    submissionId: 'sub_2',
    questionId: 'q_template_2',
    judgeId: 'judge_3',
    verdict: 'pass',
    reasoning: 'The definition of machine learning is accurate and comprehensive.',
    createdAt: 1690303000000,
    executionTime: 2103
  },
  {
    id: 'eval_5',
    submissionId: 'sub_3',
    questionId: 'q_template_3',
    judgeId: 'judge_1',
    verdict: 'pass',
    reasoning: 'All three mentioned items are indeed programming languages.',
    createdAt: 1690304000000,
    executionTime: 892
  }
];

export const mockQueues: Queue[] = [
  {
    id: 'queue_1',
    name: 'General Knowledge Q&A',
    description: 'Questions about general knowledge and reasoning',
    createdAt: 1689800000000,
    submissionCount: 2
  },
  {
    id: 'queue_2',
    name: 'Technical Assessment',
    description: 'Technical questions for programming and computer science',
    createdAt: 1689810000000,
    submissionCount: 1
  },
  {
    id: 'queue_3',
    name: 'Science & Nature',
    description: 'Questions about science and the natural world',
    createdAt: 1689820000000,
    submissionCount: 0
  }
];

export const mockJudgeAssignments: JudgeAssignment[] = [
  {
    id: 'assign_1',
    queueId: 'queue_1',
    questionId: 'q_template_1',
    judgeId: 'judge_1',
    createdAt: 1689950000000
  },
  {
    id: 'assign_2',
    queueId: 'queue_1',
    questionId: 'q_template_1',
    judgeId: 'judge_2',
    createdAt: 1689951000000
  },
  {
    id: 'assign_3',
    queueId: 'queue_1',
    questionId: 'q_template_2',
    judgeId: 'judge_3',
    createdAt: 1689952000000
  },
  {
    id: 'assign_4',
    queueId: 'queue_2',
    questionId: 'q_template_3',
    judgeId: 'judge_1',
    createdAt: 1689953000000
  }
];

export const mockEvaluationRuns: EvaluationRun[] = [
  {
    id: 'run_1',
    queueId: 'queue_1',
    startedAt: 1690299000000,
    completedAt: 1690305000000,
    status: 'completed',
    totalEvaluations: 4,
    completedEvaluations: 4,
    failedEvaluations: 0
  },
  {
    id: 'run_2',
    queueId: 'queue_2',
    startedAt: 1690304000000,
    completedAt: 1690305000000,
    status: 'completed',
    totalEvaluations: 1,
    completedEvaluations: 1,
    failedEvaluations: 0
  }
];