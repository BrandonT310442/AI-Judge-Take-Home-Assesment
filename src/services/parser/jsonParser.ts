import { validateSubmissions, type ValidatedSubmission } from '@/utils/validators/submissionValidator';
import type { Submission, Queue } from '@/types';

export interface ParsedSubmissions {
  queues: Queue[];
  submissions: Submission[];
}

export class JSONParser {
  static async parseSubmissionsFile(file: File): Promise<ParsedSubmissions> {
    // Check file type - allow empty type for local files or check extension
    const isJsonFile = file.type === 'application/json' || 
                       file.type === '' || 
                       (file.name && file.name.endsWith('.json'));
    
    if (!isJsonFile) {
      throw new Error('Invalid file type. Please upload a JSON file.');
    }

    // Read file content
    const text = await file.text();
    
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error('Invalid JSON format. Please check your file.');
    }

    // Validate the data structure
    const validation = validateSubmissions(data);
    if (!validation.success) {
      throw new Error(validation.error || 'Invalid submission data structure');
    }

    const validatedData = validation.data!;
    
    // Generate a single timestamp to use for both queues and submissions
    const timestamp = Date.now();
    console.log(`Using timestamp ${timestamp} for both queues and submissions`);
    
    // Extract unique queues with the timestamp
    const queues = this.extractQueues(validatedData, timestamp);
    
    // Convert validated data to our Submission type with the same timestamp
    const submissions = this.convertToSubmissions(validatedData, timestamp);
    
    // Verify IDs match
    console.log('Generated queue IDs:', queues.map(q => q.id));
    console.log('Generated submission queue IDs:', [...new Set(submissions.map(s => s.queueId))]);
    
    return { queues, submissions };
  }

  private static extractQueues(submissions: ValidatedSubmission[], timestamp: number): Queue[] {
    const queueMap = new Map<string, Queue>();
    
    submissions.forEach(submission => {
      // Create unique queue ID with timestamp
      const uniqueQueueId = `${submission.queueId}_${timestamp}`;
      
      if (!queueMap.has(uniqueQueueId)) {
        queueMap.set(uniqueQueueId, {
          id: uniqueQueueId,
          name: `Queue ${submission.queueId} (${new Date(timestamp).toLocaleString()})`,
          description: `Imported queue from submissions at ${new Date(timestamp).toLocaleString()}`,
          createdAt: timestamp,
          submissionCount: 0
        });
      }
      
      const queue = queueMap.get(uniqueQueueId)!;
      queue.submissionCount = (queue.submissionCount || 0) + 1;
    });
    
    return Array.from(queueMap.values());
  }

  private static convertToSubmissions(validatedData: ValidatedSubmission[], timestamp: number): Submission[] {
    return validatedData.map(item => ({
      // Create unique submission ID with timestamp
      id: `${item.id}_${timestamp}`,
      // Update queue ID to match the new unique queue ID - MUST USE SAME TIMESTAMP
      queueId: `${item.queueId}_${timestamp}`,
      labelingTaskId: item.labelingTaskId,
      createdAt: item.createdAt,
      questions: item.questions.map(q => ({
        rev: q.rev,
        data: {
          id: q.data.id,
          questionType: q.data.questionType as any, // Type assertion for enum
          questionText: q.data.questionText
        }
      })),
      answers: Object.entries(item.answers).reduce((acc, [key, value]) => {
        acc[key] = {
          choice: value.choice,
          reasoning: value.reasoning,
          text: value.text
        };
        return acc;
      }, {} as Record<string, any>)
    }));
  }

  static extractUniqueQuestions(submissions: Submission[]): Array<{
    id: string;
    text: string;
    type: string;
  }> {
    const questionsMap = new Map<string, { text: string; type: string }>();
    
    submissions.forEach(submission => {
      submission.questions.forEach(question => {
        if (!questionsMap.has(question.data.id)) {
          questionsMap.set(question.data.id, {
            text: question.data.questionText,
            type: question.data.questionType
          });
        }
      });
    });
    
    return Array.from(questionsMap.entries()).map(([id, data]) => ({
      id,
      text: data.text,
      type: data.type
    }));
  }
}