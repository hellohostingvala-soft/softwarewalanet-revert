export interface OpenAIPayload {
  model: string;
  messages: { role: string; content: string }[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  model: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const OPENAI_BASE_URL = 'https://api.openai.com/v1';

const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o':        { input: 0.000005,  output: 0.000015 },
  'gpt-4-turbo':   { input: 0.00001,   output: 0.00003 },
  'gpt-4':         { input: 0.00003,   output: 0.00006 },
  'gpt-3.5-turbo': { input: 0.0000005, output: 0.0000015 },
};

export class OpenAIAdapter {
  async executeCall(payload: OpenAIPayload, apiKey: string): Promise<OpenAIResponse> {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errBody}`);
    }

    return response.json();
  }

  estimateCost(payload: OpenAIPayload): number {
    const model = payload.model ?? 'gpt-4o';
    const costs = TOKEN_COSTS[model] ?? TOKEN_COSTS['gpt-4o'];
    const estimatedPromptTokens = payload.messages
      .reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0);
    const estimatedCompletionTokens = payload.max_tokens ?? 500;
    return (
      estimatedPromptTokens * costs.input +
      estimatedCompletionTokens * costs.output
    );
  }
}
