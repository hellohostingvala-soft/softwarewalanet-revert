/**
 * ElevenLabs Adapter
 * Routes all ElevenLabs calls through AI_GATEWAY – no direct fetch allowed.
 */

import AI_GATEWAY from '../ai-gateway';

export interface TextToSpeechOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  userId?: string;
  tenantId?: string;
}

/**
 * Convert text to speech using ElevenLabs via AI_GATEWAY.
 */
export async function textToSpeech(opts: TextToSpeechOptions) {
  return AI_GATEWAY({
    provider: 'elevenlabs',
    endpoint: `/text-to-speech/${opts.voiceId ?? 'EXAVITQu4vr4xnSDxMaL'}`,
    method: 'POST',
    body: {
      text: opts.text,
      model_id: opts.modelId ?? 'eleven_monolingual_v1',
      voice_settings: {
        stability: opts.stability ?? 0.5,
        similarity_boost: opts.similarityBoost ?? 0.75,
      },
    },
    userId: opts.userId,
    tenantId: opts.tenantId,
  });
}

/**
 * List available voices.
 */
export async function listVoices(opts?: { userId?: string; tenantId?: string }) {
  return AI_GATEWAY({
    provider: 'elevenlabs',
    endpoint: '/voices',
    method: 'GET',
    userId: opts?.userId,
    tenantId: opts?.tenantId,
  });
}
