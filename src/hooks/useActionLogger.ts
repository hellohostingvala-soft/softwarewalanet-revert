/**
 * ACTION LOGGER HOOK
 * Universal button action logging for Software Vala Enterprise Platform
 * Every button click = 1 DB action minimum
 */
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type ActionType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'PROCESS' | 'NAVIGATE';
export type ActionResult = 'success' | 'failure' | 'retry' | 'blocked';

interface LogActionParams {
  buttonId: string;
  moduleName: string;
  actionType: ActionType;
  actionResult: ActionResult;
  responseTimeMs?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

interface UseActionLoggerReturn {
  logAction: (params: LogActionParams) => Promise<void>;
  logButtonClick: (buttonId: string, moduleName: string, actionType: ActionType) => () => Promise<{ 
    complete: (result: ActionResult, error?: string) => Promise<void>;
    startTime: number;
  }>;
}

export function useActionLogger(): UseActionLoggerReturn {
  const logAction = useCallback(async (params: LogActionParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use raw SQL insert to avoid type issues with new tables
      const insertData = {
        user_id: user?.id || null,
        button_id: params.buttonId,
        module_name: params.moduleName,
        action_type: params.actionType,
        action_result: params.actionResult,
        response_time_ms: params.responseTimeMs || null,
        error_message: params.errorMessage || null,
        metadata: (params.metadata || null) as Json,
        user_agent: navigator.userAgent,
      };

      await supabase.from('action_logs' as 'action_logs').insert(insertData as never);
    } catch (error) {
      // Silent fail - logging should never break the app
      console.error('[ActionLogger] Failed to log action:', error);
    }
  }, []);

  const logButtonClick = useCallback((buttonId: string, moduleName: string, actionType: ActionType) => {
    return async () => {
      const startTime = performance.now();
      
      return {
        startTime,
        complete: async (result: ActionResult, error?: string) => {
          const responseTimeMs = Math.round(performance.now() - startTime);
          await logAction({
            buttonId,
            moduleName,
            actionType,
            actionResult: result,
            responseTimeMs,
            errorMessage: error,
          });
        }
      };
    };
  }, [logAction]);

  return { logAction, logButtonClick };
}

/**
 * Higher-order function to wrap any button action with logging
 */
export function withActionLogging<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  buttonId: string,
  moduleName: string,
  actionType: ActionType
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const startTime = performance.now();
    let result: ActionResult = 'success';
    let errorMessage: string | undefined;
    
    try {
      const response = await fn(...args);
      return response as ReturnType<T>;
    } catch (error) {
      result = 'failure';
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      const responseTimeMs = Math.round(performance.now() - startTime);
      
      // Log asynchronously without blocking
      supabase.auth.getUser().then(({ data: { user } }) => {
        const insertData = {
          user_id: user?.id || null,
          button_id: buttonId,
          module_name: moduleName,
          action_type: actionType,
          action_result: result,
          response_time_ms: responseTimeMs,
          error_message: errorMessage || null,
          user_agent: navigator.userAgent,
        };
        supabase.from('action_logs' as 'action_logs').insert(insertData as never);
      });
    }
  };
}

export default useActionLogger;
