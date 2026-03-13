/**
 * API Manager – CRUD operations for api_services table
 * Handles service creation, key encryption/rotation, status management.
 * API keys are NEVER returned in plaintext from any function here.
 */

import { supabase } from '@/integrations/supabase/client';
import {
  encryptApiKey,
  serializeEncryptedKey,
  maskKey,
} from './encryption';

export interface APIServiceConfig {
  id?: string;
  service_name: string;
  base_url: string;
  /** Plaintext key – will be encrypted before storage */
  api_key_plaintext: string;
  status?: 'active' | 'disabled' | 'maintenance';
  rate_limit?: string;
  usage_cost_tracking?: boolean;
  fallback_service_id?: string | null;
  max_monthly_cost?: number | null;
  created_by?: string | null;
}

export interface APIServiceRecord {
  id: string;
  service_name: string;
  base_url: string;
  /** Serialized EncryptedKey – never the raw key */
  api_key: string;
  status: 'active' | 'disabled' | 'maintenance';
  rate_limit: string | null;
  usage_cost_tracking: boolean;
  fallback_service_id: string | null;
  max_monthly_cost: number | null;
  created_by: string | null;
  updated_by: string | null;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Write an audit log entry for service mutations */
async function writeAuditLog(
  serviceId: string,
  action: string,
  details: Record<string, unknown>,
  userId?: string
) {
  await supabase.from('api_service_audit_log').insert({
    service_id: serviceId,
    user_id: userId ?? null,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Create a new API service config.
 * The raw key is encrypted before storing – never logged.
 */
export async function createAPIService(
  config: APIServiceConfig
): Promise<{ data: APIServiceRecord | null; error: string | null }> {
  const encrypted = await encryptApiKey(config.api_key_plaintext);
  const storedKey = serializeEncryptedKey(encrypted);

  const { data, error } = await supabase
    .from('api_services')
    .insert({
      service_name: config.service_name,
      base_url: config.base_url,
      api_key: storedKey,
      status: config.status ?? 'active',
      rate_limit: config.rate_limit ?? null,
      usage_cost_tracking: config.usage_cost_tracking ?? true,
      fallback_service_id: config.fallback_service_id ?? null,
      max_monthly_cost: config.max_monthly_cost ?? null,
      created_by: config.created_by ?? null,
    })
    .select('*')
    .single();

  if (error) return { data: null, error: error.message };

  await writeAuditLog(data.id, 'create', {
    service_name: config.service_name,
    base_url: config.base_url,
    api_key_ref: maskKey(storedKey),
  }, config.created_by ?? undefined);

  return { data: data as APIServiceRecord, error: null };
}

/**
 * Update service config (excluding key – use rotateApiKey for that).
 */
export async function updateAPIService(
  id: string,
  updates: Partial<Omit<APIServiceConfig, 'api_key_plaintext'>>,
  updatedBy?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('api_services')
    .update({ ...updates, updated_by: updatedBy ?? null })
    .eq('id', id);

  if (!error) {
    await writeAuditLog(id, 'update', { updates }, updatedBy);
  }

  return { error: error?.message ?? null };
}

/**
 * List all API services (keys are masked in returned data).
 */
export async function listAPIServices(): Promise<APIServiceRecord[]> {
  const { data, error } = await supabase
    .from('api_services')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  // Mask keys before returning
  return (data as APIServiceRecord[]).map(svc => ({
    ...svc,
    api_key: maskKey(svc.api_key),
  }));
}

/**
 * Get a single service record (key masked).
 */
export async function getAPIService(
  id: string
): Promise<APIServiceRecord | null> {
  const { data, error } = await supabase
    .from('api_services')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const record = data as APIServiceRecord;
  return { ...record, api_key: maskKey(record.api_key) };
}

/**
 * Rotate the API key for a service.
 * Old key is overwritten; new key is encrypted before storage.
 */
export async function rotateApiKey(
  id: string,
  newKeyPlaintext: string,
  updatedBy?: string
): Promise<{ error: string | null }> {
  const encrypted = await encryptApiKey(newKeyPlaintext);
  const storedKey = serializeEncryptedKey(encrypted);

  const { error } = await supabase
    .from('api_services')
    .update({ api_key: storedKey, updated_by: updatedBy ?? null })
    .eq('id', id);

  if (!error) {
    await writeAuditLog(id, 'rotate_key', {
      new_key_ref: maskKey(storedKey),
    }, updatedBy);
  }

  return { error: error?.message ?? null };
}

/**
 * Update the status of a service (active / disabled / maintenance).
 */
export async function setServiceStatus(
  id: string,
  status: 'active' | 'disabled' | 'maintenance',
  updatedBy?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('api_services')
    .update({ status, updated_by: updatedBy ?? null })
    .eq('id', id);

  if (!error) {
    await writeAuditLog(id, status === 'disabled' ? 'disable' : 'update', { status }, updatedBy);
  }

  return { error: error?.message ?? null };
}

/**
 * Get audit log entries for a service.
 */
export async function getServiceAuditLog(serviceId?: string) {
  let query = supabase
    .from('api_service_audit_log')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(200);

  if (serviceId) {
    query = query.eq('service_id', serviceId);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}
