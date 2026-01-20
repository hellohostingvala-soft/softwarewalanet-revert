/**
 * MASTER ENTERPRISE SYSTEM HOOK
 * Complete end-to-end binding: BUTTON → DB → API → AI → LOG → PERMISSION → UI
 * 
 * This is the single entry point for all enterprise-grade operations.
 * NO STATIC UI • NO DUMMY FLOW • ONE CLICK = ONE VERIFIED OPERATION
 */

import { useUnifiedButtonAction } from './useUnifiedButtonAction';
import { useButtonExecution } from './useButtonExecution';
import { useApprovalEngine } from './useApprovalEngine';
import { useAIPipeline } from './useAIPipeline';
import { useSystemVerification } from './useSystemVerification';
import { useSystemLock } from './useSystemLock';
import { useEnterpriseAudit } from './useEnterpriseAudit';
import { useEnterpriseAction } from './useEnterpriseAction';
import { useGlobalActions } from './useGlobalActions';
import { useCRUDOperations } from './useCRUDOperations';
import { useActionLogger } from './useActionLogger';
import { useSilentErrorHandler } from './useSilentErrorHandler';
import { useDebounceClick } from './useDebounceClick';
import { useAPIOptimization } from './useAPIOptimization';
import { useDataCache } from './useDataCache';

/**
 * Master hook that provides complete enterprise system access
 */
export function useEnterpriseSystem() {
  // Core unified action system
  const unifiedAction = useUnifiedButtonAction();
  
  // Button execution tracking
  const buttonExecution = useButtonExecution();
  
  // Boss-controlled approval engine
  const approvalEngine = useApprovalEngine();
  
  // AI pipeline (never auto-executes)
  const aiPipeline = useAIPipeline();
  
  // System verification & lock
  const systemVerification = useSystemVerification();
  const systemLock = useSystemLock();
  
  // Audit & logging
  const audit = useEnterpriseAudit();
  const actionLogger = useActionLogger();
  
  // Enterprise actions
  const enterpriseAction = useEnterpriseAction();
  const globalActions = useGlobalActions();
  
  // Error handling & performance
  const errorHandler = useSilentErrorHandler();
  const debounce = useDebounceClick();
  const apiOptimization = useAPIOptimization();
  const dataCache = useDataCache();

  return {
    // Primary action system
    action: unifiedAction,
    
    // Execution tracking
    execution: buttonExecution,
    
    // Approval workflow
    approval: approvalEngine,
    
    // AI assistance
    ai: aiPipeline,
    
    // System state
    verification: systemVerification,
    lock: systemLock,
    
    // Logging
    audit,
    logger: actionLogger,
    
    // Enterprise operations
    enterprise: enterpriseAction,
    global: globalActions,
    
    // Performance & error handling
    error: errorHandler,
    debounce,
    api: apiOptimization,
    cache: dataCache,
    
    // Quick access
    isLocked: systemLock.lockState.isLocked,
    isVerified: systemVerification.lastReport?.readyForLock ?? false,
    canApprove: approvalEngine.canApprove,
    canApproveAI: aiPipeline.canApproveAI,
  };
}

/**
 * Re-export all hooks for direct access
 */
export { useUnifiedButtonAction } from './useUnifiedButtonAction';
export { useButtonExecution } from './useButtonExecution';
export { useApprovalEngine } from './useApprovalEngine';
export { useAIPipeline } from './useAIPipeline';
export { useSystemVerification } from './useSystemVerification';
export { useSystemLock } from './useSystemLock';
export { useEnterpriseAudit } from './useEnterpriseAudit';
export { useEnterpriseAction } from './useEnterpriseAction';
export { useGlobalActions } from './useGlobalActions';
export { useCRUDOperations } from './useCRUDOperations';
export { useActionLogger } from './useActionLogger';
export { useSilentErrorHandler } from './useSilentErrorHandler';
export { useDebounceClick, createSafeClick } from './useDebounceClick';
export { useAPIOptimization, createOptimizedQuery } from './useAPIOptimization';
export { useDataCache, globalCache } from './useDataCache';

/**
 * Type exports
 */
export type { ActionState, ActionType, ActionConfig } from './useEnterpriseAction';
export type { LockableArea, SystemLockState } from './useSystemLock';
export type { VerificationResult, SystemVerificationReport } from './useSystemVerification';
export type { AIJobType, AIJobStatus, AIJob } from './useAIPipeline';
export type { ApprovalRequest } from './useApprovalEngine';
