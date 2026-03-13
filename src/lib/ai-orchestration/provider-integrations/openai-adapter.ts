/**
 * OpenAI Adapter
 * Routes all OpenAI calls through AI_GATEWAY – no direct fetch allowed.
 */

import AI_GATEWAY from '../ai-gateway';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  userId?: string;
  tenantId?: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: { message: ChatMessage; finish_reason: string }[];
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

/**
 * Send a chat completion request via AI_GATEWAY.
 */
export async function chatCompletion(opts: ChatCompletionOptions) {
  return AI_GATEWAY<ChatCompletionResponse>({
    provider: 'openai',
    endpoint: '/chat/completions',
    method: 'POST',
    body: {
      model: opts.model ?? 'gpt-4o',
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens,
    },
    userId: opts.userId,
    tenantId: opts.tenantId,
  });
}

/**
 * Analyze code or repository content using OpenAI.
 */
export async function analyzeCode(
  code: string,
  instruction: string,
  opts?: { userId?: string; tenantId?: string }
) {
  return chatCompletion({
    messages: [
      { role: 'system', content: 'You are a code analysis assistant.' },
      { role: 'user', content: `${instruction}\n\n\`\`\`\n${code}\n\`\`\`` },
    ],
    userId: opts?.userId,
    tenantId: opts?.tenantId,
  });
}
