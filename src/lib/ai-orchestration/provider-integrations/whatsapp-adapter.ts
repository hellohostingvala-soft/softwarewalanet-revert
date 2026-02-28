export interface WhatsAppTextPayload {
  type: 'text';
  to: string;
  message: string;
  preview_url?: boolean;
}

export interface WhatsAppTemplatePayload {
  type: 'template';
  to: string;
  template_name: string;
  language_code: string;
  components?: object[];
}

export interface WhatsAppMediaPayload {
  type: 'image' | 'audio' | 'document' | 'video';
  to: string;
  media_url: string;
  caption?: string;
}

export type WhatsAppPayload =
  | WhatsAppTextPayload
  | WhatsAppTemplatePayload
  | WhatsAppMediaPayload;

export interface WhatsAppResponse {
  messaging_product: string;
  contacts: { input: string; wa_id: string }[];
  messages: { id: string }[];
}

/** Meta Cloud API base URL. phone_number_id must be set per-tenant in config. */
const META_GRAPH_BASE = 'https://graph.facebook.com/v19.0';

const COST_PER_MESSAGE = 0.005;

export class WhatsAppAdapter {
  private phoneNumberId: string;

  constructor(phoneNumberId: string) {
    this.phoneNumberId = phoneNumberId;
  }

  async executeCall(payload: WhatsAppPayload, apiKey: string): Promise<WhatsAppResponse> {
    const url = `${META_GRAPH_BASE}/${this.phoneNumberId}/messages`;

    let body: object;

    if (payload.type === 'text') {
      body = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: payload.to,
        type: 'text',
        text: { body: payload.message, preview_url: payload.preview_url ?? false },
      };
    } else if (payload.type === 'template') {
      body = {
        messaging_product: 'whatsapp',
        to: payload.to,
        type: 'template',
        template: {
          name: payload.template_name,
          language: { code: payload.language_code },
          components: payload.components ?? [],
        },
      };
    } else {
      body = {
        messaging_product: 'whatsapp',
        to: payload.to,
        type: payload.type,
        [payload.type]: { link: payload.media_url, caption: payload.caption },
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`WhatsApp API error ${response.status}: ${errBody}`);
    }

    return response.json();
  }

  estimateCost(_payload: WhatsAppPayload): number {
    return COST_PER_MESSAGE;
  }
}
