/**
 * Hardened Timer & Promise Engine - Enterprise Security
 * - Backend validation for all timer operations
 * - No task without promise enforcement
 * - SLA violation detection with automatic penalties
 * - Audit logging for all actions
 */

import { supabase } from '@/integrations/supabase/client';
import { AppRole } from './rbac';

export interface TimerState {
  taskId: string;
  developerId: string;
  startTime: string | null;
  pauseTime: string | null;
  stopTime: string | null;
  totalSeconds: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'breached';
  slaDeadline: string | null;
  promiseId: string | null;
}

export interface PromiseLog {
  id: string;
  developerId: string;
  taskId: string;
  promisedDeadline: string;
  actualDeadline?: string;
  status: 'promised' | 'in_progress' | 'completed' | 'breached' | 'extended';
  breachReason?: string;
  scoreEffect: number;
  extensionCount: number;
  createdAt: string;
}

// SLA penalty configuration
export const SLA_PENALTY_CONFIG = {
  warning: { threshold: 0.5, penaltyPercent: 0 }, // 50% time remaining
  critical: { threshold: 0.25, penaltyPercent: 5 }, // 25% time remaining
  overdue: { threshold: 0, penaltyPercent: 10 }, // Past deadline
  severeOverdue: { threshold: -0.5, penaltyPercent: 20 }, // 50% past deadline
} as const;

// Create a new promise (required before starting timer)
export const createPromise = async (
  developerId: string,
  taskId: string,
  estimatedHours: number
): Promise<{ success: boolean; promiseId?: string; error?: string }> => {
  try {
    // Check for existing active promise on same task
    const { data: existingPromise } = await supabase
      .from('promise_logs')
      .select('id, status')
      .eq('task_id', taskId)
      .eq('developer_id', developerId)
      .in('status', ['promised', 'in_progress'])
      .single();

    if (existingPromise) {
      return { success: false, error: 'Active promise already exists for this task' };
    }

    // Check workload threshold (max 3 concurrent tasks)
    const { data: activePromises } = await supabase
      .from('promise_logs')
      .select('id')
      .eq('developer_id', developerId)
      .in('status', ['promised', 'in_progress']);

    if (activePromises && activePromises.length >= 3) {
      return { success: false, error: 'Maximum concurrent tasks (3) reached' };
    }

    const deadline = new Date();
    deadline.setHours(deadline.getHours() + estimatedHours);

    const { data, error } = await supabase.from('promise_logs').insert({
      developer_id: developerId,
      task_id: taskId,
      deadline: deadline.toISOString(),
      status: 'promised',
      score_effect: 0,
      extension_count: 0,
    }).select().single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log audit trail
    await logTimerEvent('promise_created', taskId, developerId, {
      promise_id: data.id,
      deadline: deadline.toISOString(),
      estimated_hours: estimatedHours,
    });

    return { success: true, promiseId: data.id };
  } catch (err) {
    return { success: false, error: 'Failed to create promise' };
  }
};

// Start timer (requires existing promise)
export const startTimer = async (
  taskId: string,
  developerId: string
): Promise<{ success: boolean; timerId?: string; error?: string }> => {
  try {
    // Verify promise exists
    const { data: promise } = await supabase
      .from('promise_logs')
      .select('id, status, deadline')
      .eq('task_id', taskId)
      .eq('developer_id', developerId)
      .in('status', ['promised', 'in_progress'])
      .single();

    if (!promise) {
      return { success: false, error: 'No active promise found. Promise required before starting timer.' };
    }

    // Update promise status to in_progress
    await supabase
      .from('promise_logs')
      .update({ status: 'in_progress' })
      .eq('id', promise.id);

    // Check for existing timer
    const { data: existingTimer } = await supabase
      .from('dev_timer')
      .select('timer_id')
      .eq('task_id', taskId)
      .eq('dev_id', developerId)
      .is('stop_timestamp', null)
      .single();

    if (existingTimer) {
      // Resume existing timer
      await supabase
        .from('dev_timer')
        .update({ 
          pause_timestamp: null,
          start_timestamp: new Date().toISOString(),
        })
        .eq('timer_id', existingTimer.timer_id);

      return { success: true, timerId: existingTimer.timer_id };
    }

    // Create new timer
    const { data, error } = await supabase.from('dev_timer').insert({
      task_id: taskId,
      dev_id: developerId,
      start_timestamp: new Date().toISOString(),
      total_seconds: 0,
    }).select().single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Log audit trail
    await logTimerEvent('timer_started', taskId, developerId, {
      timer_id: data.timer_id,
      promise_id: promise.id,
    });

    return { success: true, timerId: data.timer_id };
  } catch (err) {
    return { success: false, error: 'Failed to start timer' };
  }
};

// Pause timer (requires valid reason)
export const pauseTimer = async (
  taskId: string,
  developerId: string,
  pauseReason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!pauseReason || pauseReason.trim().length < 10) {
      return { success: false, error: 'Pause reason must be at least 10 characters' };
    }

    const { data: timer } = await supabase
      .from('dev_timer')
      .select('*')
      .eq('task_id', taskId)
      .eq('dev_id', developerId)
      .is('stop_timestamp', null)
      .single();

    if (!timer) {
      return { success: false, error: 'No active timer found' };
    }

    // Calculate elapsed time
    const startTime = new Date(timer.start_timestamp);
    const pauseTime = new Date();
    const elapsedSeconds = Math.floor((pauseTime.getTime() - startTime.getTime()) / 1000);

    const { error } = await supabase
      .from('dev_timer')
      .update({
        pause_timestamp: pauseTime.toISOString(),
        total_seconds: (timer.total_seconds || 0) + elapsedSeconds,
      })
      .eq('timer_id', timer.timer_id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log audit trail with pause reason
    await logTimerEvent('timer_paused', taskId, developerId, {
      timer_id: timer.timer_id,
      pause_reason: pauseReason,
      elapsed_seconds: elapsedSeconds,
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to pause timer' };
  }
};

// Complete timer and mark task done
export const completeTimer = async (
  taskId: string,
  developerId: string
): Promise<{ success: boolean; scoreEffect?: number; error?: string }> => {
  try {
    const { data: timer } = await supabase
      .from('dev_timer')
      .select('*')
      .eq('task_id', taskId)
      .eq('dev_id', developerId)
      .is('stop_timestamp', null)
      .single();

    if (!timer) {
      return { success: false, error: 'No active timer found' };
    }

    const { data: promise } = await supabase
      .from('promise_logs')
      .select('*')
      .eq('task_id', taskId)
      .eq('developer_id', developerId)
      .in('status', ['promised', 'in_progress'])
      .single();

    const now = new Date();
    let scoreEffect = 5; // Base positive score for completion

    if (promise) {
      const deadline = new Date(promise.deadline);
      if (now > deadline) {
        // Calculate overdue penalty
        const overdueMinutes = Math.floor((now.getTime() - deadline.getTime()) / 60000);
        scoreEffect = -Math.min(20, Math.floor(overdueMinutes / 30) * 5); // -5 per 30 mins overdue, max -20
      } else {
        // Bonus for early completion
        const earlyMinutes = Math.floor((deadline.getTime() - now.getTime()) / 60000);
        scoreEffect = Math.min(10, 5 + Math.floor(earlyMinutes / 60)); // +1 per hour early, max +10
      }

      // Update promise
      await supabase
        .from('promise_logs')
        .update({
          status: 'completed',
          actual_completion: now.toISOString(),
          score_effect: scoreEffect,
        })
        .eq('id', promise.id);
    }

    // Stop timer
    const startTime = new Date(timer.start_timestamp);
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    await supabase
      .from('dev_timer')
      .update({
        stop_timestamp: now.toISOString(),
        total_seconds: (timer.total_seconds || 0) + elapsedSeconds,
      })
      .eq('timer_id', timer.timer_id);

    // Log audit trail
    await logTimerEvent('timer_completed', taskId, developerId, {
      timer_id: timer.timer_id,
      promise_id: promise?.id,
      score_effect: scoreEffect,
      total_seconds: (timer.total_seconds || 0) + elapsedSeconds,
    });

    return { success: true, scoreEffect };
  } catch {
    return { success: false, error: 'Failed to complete timer' };
  }
};

// Check SLA status for a task
export const checkSLAStatus = (
  remainingSeconds: number,
  totalSeconds: number
): { status: 'on-track' | 'warning' | 'critical' | 'overdue'; penaltyPercent: number } => {
  const ratio = remainingSeconds / totalSeconds;

  if (ratio <= SLA_PENALTY_CONFIG.overdue.threshold) {
    return { status: 'overdue', penaltyPercent: SLA_PENALTY_CONFIG.overdue.penaltyPercent };
  }
  if (ratio <= SLA_PENALTY_CONFIG.critical.threshold) {
    return { status: 'critical', penaltyPercent: SLA_PENALTY_CONFIG.critical.penaltyPercent };
  }
  if (ratio <= SLA_PENALTY_CONFIG.warning.threshold) {
    return { status: 'warning', penaltyPercent: SLA_PENALTY_CONFIG.warning.penaltyPercent };
  }
  return { status: 'on-track', penaltyPercent: 0 };
};

// Record SLA violation
export const recordSLAViolation = async (
  taskId: string,
  developerId: string,
  severity: 'warning' | 'critical' | 'breach',
  penaltyPercent: number
): Promise<void> => {
  try {
    await supabase.from('developer_violations').insert({
      developer_id: developerId,
      task_id: taskId,
      violation_type: 'sla_breach',
      severity: severity === 'breach' ? 'critical' : 'strike',
      description: `SLA violation - ${severity} level`,
      penalty_amount: penaltyPercent,
      auto_generated: true,
    });

    // Create buzzer for super_admin
    await supabase.from('buzzer_queue').insert({
      trigger_type: 'sla_violation',
      priority: severity === 'breach' ? 'urgent' : 'high',
      role_target: 'super_admin',
      task_id: taskId,
      status: 'pending',
      auto_escalate_after: 180,
    });
  } catch (error) {
    console.error('Failed to record SLA violation:', error);
  }
};

// Log timer event for audit
const logTimerEvent = async (
  action: string,
  taskId: string,
  developerId: string,
  details: Record<string, any>
): Promise<void> => {
  try {
    await supabase.from('audit_logs').insert({
      action,
      module: 'timer_promise',
      user_id: developerId,
      meta_json: {
        task_id: taskId,
        ...details,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to log timer event:', error);
  }
};

// Format seconds to HH:MM:SS
export const formatTimerDisplay = (seconds: number): string => {
  const hrs = Math.floor(Math.abs(seconds) / 3600);
  const mins = Math.floor((Math.abs(seconds) % 3600) / 60);
  const secs = Math.abs(seconds) % 60;
  const sign = seconds < 0 ? '-' : '';
  return `${sign}${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
