/**
 * Firebase FCM Adapter
 * Routes all Firebase Cloud Messaging calls through AI_GATEWAY – no direct fetch allowed.
 */

import AI_GATEWAY from '../ai-gateway';

export interface SendNotificationOptions {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  userId?: string;
  tenantId?: string;
}

export interface SendTopicNotificationOptions {
  topic: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  userId?: string;
  tenantId?: string;
}

/**
 * Send a push notification to a specific device token.
 */
export async function sendNotification(opts: SendNotificationOptions) {
  return AI_GATEWAY({
    provider: 'firebase_fcm',
    endpoint: '/v1/projects/:projectId/messages:send',
    method: 'POST',
    body: {
      message: {
        token: opts.token,
        notification: { title: opts.title, body: opts.body },
        data: opts.data ?? {},
      },
    },
    userId: opts.userId,
    tenantId: opts.tenantId,
  });
}

/**
 * Send a push notification to a topic (broadcast).
 */
export async function sendTopicNotification(opts: SendTopicNotificationOptions) {
  return AI_GATEWAY({
    provider: 'firebase_fcm',
    endpoint: '/v1/projects/:projectId/messages:send',
    method: 'POST',
    body: {
      message: {
        topic: opts.topic,
        notification: { title: opts.title, body: opts.body },
        data: opts.data ?? {},
      },
    },
    userId: opts.userId,
    tenantId: opts.tenantId,
  });
}

/**
 * Send a deployment alert notification.
 */
export async function sendDeploymentAlert(opts: {
  token: string;
  appName: string;
  status: 'success' | 'failed' | 'in_progress';
  details?: string;
  userId?: string;
  tenantId?: string;
}) {
  return sendNotification({
    token: opts.token,
    title: `Deployment ${opts.status.toUpperCase()} – ${opts.appName}`,
    body: opts.details ?? `Deployment ${opts.status} for ${opts.appName}`,
    data: { appName: opts.appName, status: opts.status },
    userId: opts.userId,
    tenantId: opts.tenantId,
  });
}
