export class PromptService {
  private promptCache: Map<string, string> = new Map();

  async loadPromptTemplate(templateName: string): Promise<string> {
    if (this.promptCache.has(templateName)) {
      return this.promptCache.get(templateName)!;
    }

    try {
      // In browser environment, we need to fetch the file
      const response = await fetch(`/src/prompts/${templateName}`);
      if (!response.ok) {
        throw new Error(`Failed to load prompt template: ${templateName}`);
      }
      const template = await response.text();
      this.promptCache.set(templateName, template);
      return template;
    } catch (error) {
      console.error(`Error loading prompt template ${templateName}:`, error);
      // Return a fallback template if file loading fails
      return this.getFallbackTemplate();
    }
  }

  processTemplate(
    template: string,
    variables: Record<string, string>
  ): string {
    let processed = template;
    
    // Replace all {{variable}} placeholders with actual values
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(placeholder, value);
    });

    return processed;
  }

  private getFallbackTemplate(): string {
    return `# AI Judge Evaluation

## Judge Instructions
{{systemPrompt}}

## Question
{{question}}

## User's Answer
{{answer}}

## Task
Evaluate the answer according to the judge instructions above and provide:

1. **Verdict**: "pass", "fail", or "inconclusive"
2. **Reasoning**: Brief explanation (1-2 sentences)

Return your evaluation as JSON:
\`\`\`json
{
  "verdict": "pass" | "fail" | "inconclusive",
  "reasoning": "Your explanation here"
}
\`\`\``;
  }
}

export const promptService = new PromptService();