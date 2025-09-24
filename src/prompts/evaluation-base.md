# AI Judge Evaluation

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
```json
{
  "verdict": "pass" | "fail" | "inconclusive",
  "reasoning": "Your explanation here"
}
```