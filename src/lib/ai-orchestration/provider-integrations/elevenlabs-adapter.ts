export interface ElevenLabsPayload {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface ElevenLabsResponse {
  audio: ArrayBuffer;
  content_type: string;
}

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

/** Cost per character in USD (approximate). */
const COST_PER_CHAR = 0.000030;

export class ElevenLabsAdapter {
  async executeCall(payload: ElevenLabsPayload, apiKey: string): Promise<ElevenLabsResponse> {
    const { voice_id, text, model_id = 'eleven_monolingual_v1', voice_settings } = payload;

    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id,
        voice_settings: voice_settings ?? {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`ElevenLabs API error ${response.status}: ${errBody}`);
    }

    const audio = await response.arrayBuffer();
    const content_type = response.headers.get('content-type') ?? 'audio/mpeg';

    return { audio, content_type };
  }

  estimateCost(payload: ElevenLabsPayload): number {
    return payload.text.length * COST_PER_CHAR;
  }
}
