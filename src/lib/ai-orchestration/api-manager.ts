import { supabase } from '@/integrations/supabase/client';

export interface ApiService {
  id: string;
  tenant_id: string;
  name: string;
  provider: string;
  encrypted_key: string;
  is_active: boolean;
  is_paused: boolean;
  daily_limit: number;
  monthly_limit: number;
  created_at: string;
}

export interface ApiServiceHealth {
  id: string;
  service_id: string;
  status: string;
  latency_ms: number | null;
  error_count: number;
  checked_at: string;
}

export async function listApiServices(tenantId: string) {
  return supabase
    .from('api_services')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
}

export async function getApiService(id: string, tenantId: string) {
  return supabase
    .from('api_services')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single();
}

export async function createApiService(data: Partial<ApiService>, tenantId: string) {
  return supabase
    .from('api_services')
    .insert({ ...data, tenant_id: tenantId })
    .select()
    .single();
}

export async function updateApiService(
  id: string,
  data: Partial<ApiService>,
  tenantId: string
) {
  const { tenant_id: _tid, id: _id, ...safeData } = data as any;
  return supabase
    .from('api_services')
    .update(safeData)
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();
}

export async function pauseApiService(id: string, tenantId: string) {
  return supabase
    .from('api_services')
    .update({ is_paused: true })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();
}

export async function resumeApiService(id: string, tenantId: string) {
  return supabase
    .from('api_services')
    .update({ is_paused: false })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();
}

/** Soft-deletes the service by setting is_active = false. */
export async function deleteApiService(id: string, tenantId: string) {
  return supabase
    .from('api_services')
    .update({ is_active: false })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single();
}

export async function getServiceHealth(serviceId: string, tenantId: string) {
  return supabase
    .from('api_service_health')
    .select('*, api_services!inner(tenant_id)')
    .eq('service_id', serviceId)
    .eq('api_services.tenant_id', tenantId)
    .order('checked_at', { ascending: false })
    .limit(10);
}
