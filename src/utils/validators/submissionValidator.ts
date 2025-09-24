import { z } from 'zod';

// Question schema
const QuestionSchema = z.object({
  rev: z.number(),
  data: z.object({
    id: z.string(),
    questionType: z.enum([
      'single_choice',
      'single_choice_with_reasoning',
      'multiple_choice',
      'free_form'
    ]),
    questionText: z.string()
  })
});

// Answer schema - flexible to accommodate different answer types
const AnswerSchema = z.object({
  choice: z.string().optional(),
  reasoning: z.string().optional(),
  text: z.string().optional(),
}).refine(
  (data) => data.choice || data.reasoning || data.text,
  { message: "Answer must have at least one field (choice, reasoning, or text)" }
);

// Submission schema
const SubmissionSchema = z.object({
  id: z.string(),
  queueId: z.string(),
  labelingTaskId: z.string(),
  createdAt: z.number(),
  questions: z.array(QuestionSchema),
  answers: z.record(z.string(), AnswerSchema)
});

// Array of submissions
export const SubmissionArraySchema = z.array(SubmissionSchema);

// Type exports
export type ValidatedQuestion = z.infer<typeof QuestionSchema>;
export type ValidatedAnswer = z.infer<typeof AnswerSchema>;
export type ValidatedSubmission = z.infer<typeof SubmissionSchema>;

// Validation function with detailed error messages
export function validateSubmissions(data: unknown): {
  success: boolean;
  data?: ValidatedSubmission[];
  error?: string;
  details?: z.ZodError;
} {
  try {
    const validated = SubmissionArraySchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      
      return {
        success: false,
        error: `Validation failed: ${errorMessage}`,
        details: error
      };
    }
    
    return {
      success: false,
      error: 'Unknown validation error occurred'
    };
  }
}