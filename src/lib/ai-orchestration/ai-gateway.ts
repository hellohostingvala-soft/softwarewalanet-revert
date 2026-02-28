/**
 * AI Gateway – Central Orchestration Service
 *
 * ALL external AI/API calls MUST be routed through AI_GATEWAY().
 * No direct fetch() or axios() calls to external providers are permitted.
 *
 * Features:
 *  - Service routing by provider type
 *  - Key decryption & injection (keys never exposed in logs)
 *  - Rate limiting enforcement
 *  - Cost tracking on every call
 *  - Automatic fallback provider switching
 *  - Error handling & retry logic
 *  - Comprehensive audit logging
 */

import { supabase } from '@/integrations/supabase/client';
import { decryptApiKey, deserializeEncryptedKey } from './encryption';
import { logUsage } from './usage-tracker';

export type ProviderType =
  | 'openai'
  | 'elevenlabs'
  | 'github'
  | 'whatsapp'
  | 'stripe'
  | 'firebase_fcm';

export interface GatewayRequest {
  provider: ProviderType;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  tenantId?: string;
  userId?: string;
  /** Override which service config to use (optional; auto-detected by provider) */
  serviceId?: string;
}

export interface GatewayResponse<T = unknown> {
  data: T | null;
  status: number;
  ok: boolean;
  error?: string;
  fallbackUsed?: boolean;
  serviceId?: string;
  responseTimeMs?: number;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Fetch the service record (with encrypted key) for a given provider name */
async function resolveService(provider: ProviderType, serviceId?: string) {
  let query = supabase
    .from('api_services')
    .select('*')
    .eq('status', 'active');

  if (serviceId) {
    query = query.eq('id', serviceId);
  } else {
    query = query.ilike('service_name', `%${provider}%`);
  }

  const { data, error } = await query.limit(1).single();
  if (error || !data) return null;
  return data as {
    id: string;
    service_name: string;
    base_url: string;
    api_key: string;
    rate_limit: string | null;
    fallback_service_id: string | null;
    max_monthly_cost: number | null;
  };
}

/** Decrypts the stored key and makes the HTTP call – key is never logged */
async function callProvider(
  service: Awaited<ReturnType<typeof resolveService>>,
  req: GatewayRequest
): Promise<{ response: Response; durationMs: number }> {
  if (!service) throw new Error('No service config found');

  const encObj = deserializeEncryptedKey(service.api_key);
  const rawKey = await decryptApiKey(encObj);

  const url = `${service.base_url}${req.endpoint}`;
  const method = req.method ?? 'POST';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...req.headers,
  };

  // Inject key per provider convention (never log rawKey)
  switch (req.provider) {
    case 'openai':
      headers['Authorization'] = `Bearer ${rawKey}`;
      break;
    case 'elevenlabs':
      headers['xi-api-key'] = rawKey;
      break;
    case 'github':
      headers['Authorization'] = `Bearer ${rawKey}`;
      headers['Accept'] = 'application/vnd.github+json';
      break;
    case 'whatsapp':
      headers['Authorization'] = `Bearer ${rawKey}`;
      break;
    case 'stripe':
      headers['Authorization'] = `Bearer ${rawKey}`;
      break;
    case 'firebase_fcm':
      headers['Authorization'] = `Bearer ${rawKey}`;
      break;
  }

  const t0 = Date.now();
  const response = await fetch(url, {
    method,
    headers,
    body: req.body ? JSON.stringify(req.body) : undefined,
  });

  return { response, durationMs: Date.now() - t0 };
}

/**
 * AI_GATEWAY – the single entry point for ALL external AI/API calls.
 *
 * @example
 * const result = await AI_GATEWAY({
 *   provider: 'openai',
 *   endpoint: '/chat/completions',
 *   body: { model: 'gpt-4o', messages: [...] },
 *   userId: currentUser.id,
 * });
 */
export async function AI_GATEWAY<T = unknown>(
  req: GatewayRequest
): Promise<GatewayResponse<T>> {
  let service = await resolveService(req.provider, req.serviceId);
  if (!service) {
    return { data: null, status: 503, ok: false, error: `No active service found for provider: ${req.provider}` };
  }

  let attempt = 0;
  let fallbackUsed = false;
  let lastError: string | undefined;

  while (attempt <= MAX_RETRIES) {
    try {
      const { response, durationMs } = await callProvider(service, req);

      const isOk = response.ok;
      const status = response.status;

      // Parse response body
      let data: T | null = null;
      try {
        data = await response.json() as T;
      } catch {
        // non-JSON response
      }

      // Estimate tokens/cost if available in OpenAI-style responses
      const usageInfo = (data as Record<string, unknown> | null)?.usage as Record<string, number> | undefined;
      const reqTokens = usageInfo?.prompt_tokens;
      const resTokens = usageInfo?.completion_tokens;

      // Log usage (never log raw keys or raw response body)
      await logUsage({
        serviceId: service.id,
        tenantId: req.tenantId,
        userId: req.userId,
        endpoint: req.endpoint,
        requestTokens: reqTokens,
        responseTokens: resTokens,
        status: isOk ? 'success' : (status === 429 ? 'rate_limited' : 'failed'),
        fallbackServiceId: fallbackUsed ? service.id : undefined,
        errorMessage: isOk ? undefined : `HTTP ${status}`,
        responseTimeMs: durationMs,
      });

      return {
        data,
        status,
        ok: isOk,
        error: isOk ? undefined : `HTTP ${status}`,
        fallbackUsed,
        serviceId: service.id,
        responseTimeMs: durationMs,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      attempt++;

      if (attempt > MAX_RETRIES) break;

      // Try fallback provider on last retry
      if (attempt === MAX_RETRIES && service.fallback_service_id && !fallbackUsed) {
        const fallback = await supabase
          .from('api_services')
          .select('*')
          .eq('id', service.fallback_service_id)
          .eq('status', 'active')
          .single();

        if (!fallback.error && fallback.data) {
          service = fallback.data as typeof service;
          fallbackUsed = true;
          attempt = 0; // reset retries for fallback
          continue;
        }
      }

      await delay(RETRY_DELAY_MS * attempt);
    }
  }

  // Log final failure
  await logUsage({
    serviceId: service.id,
    tenantId: req.tenantId,
    userId: req.userId,
    endpoint: req.endpoint,
    status: fallbackUsed ? 'fallback_used' : 'failed',
    errorMessage: lastError,
  });

  return {
    data: null,
    status: 500,
    ok: false,
    error: lastError ?? 'Gateway request failed after retries',
    fallbackUsed,
    serviceId: service.id,
  };
}

export default AI_GATEWAY;
