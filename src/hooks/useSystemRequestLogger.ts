import { supabase } from '@/integrations/supabase/client';

export type SystemRequestStatus = 'NEW' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SystemRequestInput {
  action_type: string;
  role_type?: string | null;
  source?: string;
  status?: SystemRequestStatus;
  payload_json?: Record<string, unknown>;
  user_id?: string | null;
}

/**
 * Logic-only: creates a single backend record representing a user/system request.
 * This is the canonical queue the Boss Panel can ingest.
 */
export async function createSystemRequest(input: SystemRequestInput) {
  const {
    action_type,
    role_type = null,
    source = 'frontend',
    status = 'NEW',
    payload_json = {},
    user_id,
  } = input;

  const finalUserId = typeof user_id === 'string' ? user_id : null;

  console.log('[SYSTEM_REQUEST] Creating request:', { action_type, role_type, source, status, user_id: finalUserId });

  const { data, error } = await supabase.from('system_requests').insert([
    {
      action_type,
      role_type,
      user_id: finalUserId,
      source,
      status,
      payload_json: JSON.parse(JSON.stringify(payload_json)),
    },
  ]).select();

  if (error) {
    console.error('[SYSTEM_REQUEST] Insert FAILED:', error);
    return { data: null, error };
  }

  console.log('[SYSTEM_REQUEST] Insert SUCCESS:', data);
  return { data, error: null };
}
