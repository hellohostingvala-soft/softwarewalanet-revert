import { supabase } from '@/integrations/supabase/client';
import {
  getWalletBalance,
  placeHold,
  releaseHold,
  deductFunds,
  checkSufficientFunds,
} from './wallet-ledger';
import { trackApiCost, estimateCost } from './cost-tracker';
import { detectAnomalies } from './anomaly-detector';

const ESTIMATED_TOKENS_DEFAULT = 1000;
const SIMULATED_LATENCY_MIN_MS = 50;
const SIMULATED_LATENCY_RANGE_MS = 150;

export async function executeApiCall(
  tenantId: string,
  serviceId: string,
  payload: object,
  userId: string
) {
  // 1. Check kill switch in system_state
  const { data: killSwitch } = await supabase
    .from('system_state')
    .select('value')
    .eq('tenant_id', tenantId)
    .eq('key', 'kill_all')
    .single();

  if (killSwitch?.value === 'true') {
    return { data: null, error: new Error('System kill switch is active. All API calls are blocked.') };
  }

  // 2. Fetch the service to get model and estimated cost
  const { data: service, error: svcErr } = await supabase
    .from('api_services')
    .select('*')
    .eq('id', serviceId)
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .eq('is_paused', false)
    .single();

  if (svcErr || !service) {
    return { data: null, error: svcErr ?? new Error('Service not found or unavailable') };
  }

  const model = service.provider;
  const estimatedTokens = (payload as any).max_tokens ?? ESTIMATED_TOKENS_DEFAULT;
  const estimatedCostAmt = estimateCost(model, estimatedTokens);
  const callId = crypto.randomUUID();

  // 3. Check wallet has sufficient funds
  const hasFunds = await checkSufficientFunds(tenantId, estimatedCostAmt);
  if (!hasFunds) {
    return { data: null, error: new Error('Insufficient wallet balance for this API call') };
  }

  // 4. Place hold on estimated cost
  try {
    await placeHold(tenantId, estimatedCostAmt, callId);
  } catch (holdErr: any) {
    return { data: null, error: holdErr };
  }

  const startTime = Date.now();
  let result: any = null;
  let actualCost = estimatedCostAmt;
  let actualTokens = estimatedTokens;
  let callError: any = null;

  try {
    // 5. Simulate API execution (browser context – real adapters are in provider-integrations/)
    await new Promise(resolve => setTimeout(resolve, SIMULATED_LATENCY_MIN_MS + Math.random() * SIMULATED_LATENCY_RANGE_MS));
    result = {
      id: callId,
      model,
      choices: [{ message: { content: '[simulated response]' } }],
      usage: { total_tokens: estimatedTokens },
    };
    actualTokens = result.usage?.total_tokens ?? estimatedTokens;
    actualCost = estimateCost(model, actualTokens);
  } catch (err: any) {
    callError = err;
    await supabase.from('api_failure_logs').insert({
      tenant_id: tenantId,
      service_id: serviceId,
      error_code: err?.code ?? 'UNKNOWN',
      error_message: err?.message ?? 'Unknown error',
    });
  }

  const latencyMs = Date.now() - startTime;

  // 6. Deduct actual cost and release unused hold
  if (!callError) {
    try {
      await deductFunds(tenantId, actualCost, `API call to ${model}`, callId);
      const unusedHold = Math.max(0, estimatedCostAmt - actualCost);
      if (unusedHold > 0) await releaseHold(tenantId, unusedHold, callId);
    } catch (deductErr: any) {
      callError = deductErr;
    }
  } else {
    await releaseHold(tenantId, estimatedCostAmt, callId);
  }

  // 7. Log usage and access
  if (!callError) {
    await Promise.all([
      supabase.from('api_service_usage').insert({
        tenant_id: tenantId,
        service_id: serviceId,
        tokens_used: actualTokens,
        cost: actualCost,
      }),
      supabase.from('api_access_logs').insert({
        tenant_id: tenantId,
        service_id: serviceId,
        user_id: userId,
        endpoint: model,
        status_code: 200,
      }),
      supabase.from('latency_metrics').insert({
        tenant_id: tenantId,
        service_id: serviceId,
        latency_ms: latencyMs,
      }),
      trackApiCost(tenantId, serviceId, actualTokens, model, actualCost),
    ]);
  }

  // Background anomaly detection (non-blocking)
  detectAnomalies(tenantId, serviceId).catch(() => {});

  if (callError) return { data: null, error: callError };
  return { data: result, error: null };
}

export async function getSystemState(tenantId: string) {
  return supabase
    .from('system_state')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false });
}

export async function setSystemState(
  tenantId: string,
  key: string,
  value: string,
  userId: string
) {
  const { data: existing } = await supabase
    .from('system_state')
    .select('id, value')
    .eq('tenant_id', tenantId)
    .eq('key', key)
    .single();

  await supabase.from('config_change_logs').insert({
    tenant_id: tenantId,
    changed_by: userId,
    key,
    old_value: existing?.value ?? null,
    new_value: value,
  });

  if (existing?.id) {
    return supabase
      .from('system_state')
      .update({ value, updated_at: new Date().toISOString(), updated_by: userId })
      .eq('id', existing.id)
      .select()
      .single();
  }

  return supabase
    .from('system_state')
    .insert({ tenant_id: tenantId, key, value, updated_by: userId })
    .select()
    .single();
}

export async function logAuditEvent(
  tenantId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  ipAddress: string,
  details: object
) {
  return supabase.from('audit_logs').insert({
    tenant_id: tenantId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    ip_address: ipAddress,
    details,
  }).select().single();
}
