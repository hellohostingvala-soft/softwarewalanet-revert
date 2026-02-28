export interface FCMTokenPayload {
  type: 'token';
  token: string;
  title: string;
  body: string;
  image_url?: string;
  data?: Record<string, string>;
  android?: FCMAndroidConfig;
  apns?: FCMApnsConfig;
}

export interface FCMTopicPayload {
  type: 'topic';
  topic: string;
  title: string;
  body: string;
  image_url?: string;
  data?: Record<string, string>;
  android?: FCMAndroidConfig;
}

export interface FCMMulticastPayload {
  type: 'multicast';
  tokens: string[];
  title: string;
  body: string;
  image_url?: string;
  data?: Record<string, string>;
}

export interface FCMAndroidConfig {
  priority?: 'normal' | 'high';
  ttl?: string;
  channel_id?: string;
}

export interface FCMApnsConfig {
  headers?: Record<string, string>;
  payload?: Record<string, any>;
}

export type FCMPayload = FCMTokenPayload | FCMTopicPayload | FCMMulticastPayload;

export interface FCMResponse {
  name?: string;
  successCount?: number;
  failureCount?: number;
  responses?: { success: boolean; messageId?: string; error?: string }[];
}

const FCM_BASE_URL = 'https://fcm.googleapis.com/v1/projects';

/** Nominal cost per FCM message in USD. */
const COST_PER_MESSAGE = 0.00001;

export class FirebaseFCMAdapter {
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  async executeCall(payload: FCMPayload, apiKey: string): Promise<FCMResponse> {
    const notification = {
      title: payload.title,
      body: payload.body,
      ...(('image_url' in payload && payload.image_url) ? { image: payload.image_url } : {}),
    };

    if (payload.type === 'multicast') {
      const url = `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:sendEach`;
      const messages = payload.tokens.map(token => ({
        token,
        notification,
        data: payload.data,
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Firebase FCM error ${response.status}: ${errBody}`);
      }

      return response.json();
    }

    const url = `${FCM_BASE_URL}/${this.projectId}/messages:send`;
    let message: Record<string, any>;

    if (payload.type === 'token') {
      message = {
        token: payload.token,
        notification,
        data: payload.data,
        ...(payload.android ? { android: payload.android } : {}),
        ...(payload.apns ? { apns: payload.apns } : {}),
      };
    } else {
      message = {
        topic: payload.topic,
        notification,
        data: payload.data,
        ...(payload.android ? { android: payload.android } : {}),
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Firebase FCM error ${response.status}: ${errBody}`);
    }

    return response.json();
  }

  estimateCost(payload: FCMPayload): number {
    if (payload.type === 'multicast') {
      return payload.tokens.length * COST_PER_MESSAGE;
    }
    return COST_PER_MESSAGE;
  }
}
