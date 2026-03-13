/**
 * WhatsApp Cloud API Adapter
 * Routes all WhatsApp calls through AI_GATEWAY – no direct fetch allowed.
 */

import AI_GATEWAY from '../ai-gateway';

export interface SendTextMessageOptions {
  phoneNumberId: string;
  to: string;
  message: string;
  userId?: string;
  tenantId?: string;
}

export interface SendTemplateMessageOptions {
  phoneNumberId: string;
  to: string;
  templateName: string;
  languageCode?: string;
  components?: unknown[];
  userId?: string;
  tenantId?: string;
}

/**
 * Send a plain text WhatsApp message via AI_GATEWAY.
 */
export async function sendTextMessage(opts: SendTextMessageOptions) {
  return AI_GATEWAY({
    provider: 'whatsapp',
    endpoint: `/${opts.phoneNumberId}/messages`,
    method: 'POST',
    body: {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: opts.to,
      type: 'text',
      text: { preview_url: false, body: opts.message },
    },
    userId: opts.userId,
    tenantId: opts.tenantId,
  });
}

/**
 * Send a template-based WhatsApp message.
 */
export async function sendTemplateMessage(opts: SendTemplateMessageOptions) {
  return AI_GATEWAY({
    provider: 'whatsapp',
    endpoint: `/${opts.phoneNumberId}/messages`,
    method: 'POST',
    body: {
      messaging_product: 'whatsapp',
      to: opts.to,
      type: 'template',
      template: {
        name: opts.templateName,
        language: { code: opts.languageCode ?? 'en_US' },
        components: opts.components ?? [],
      },
    },
    userId: opts.userId,
    tenantId: opts.tenantId,
  });
}
