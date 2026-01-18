/**
 * Action Button Factory - Creates pre-configured enterprise buttons
 * Eliminates dead clicks by ensuring every button has a handler
 */

import React, { useCallback } from 'react';
import { Play, Pause, Square, RotateCw, Eye, Check, X, AlertTriangle, Send, Archive, Ban, Unlock, Lock, RefreshCw, Download, Upload, Trash2, Edit, Plus, Settings, Save } from 'lucide-react';
import { EnterpriseButton, EnterpriseButtonProps } from './EnterpriseButton';
import { AuditModule } from '@/hooks/useEnterpriseAudit';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ActionButtonConfig {
  icon: React.ReactNode;
  label: string;
  variant?: EnterpriseButtonProps['variant'];
  className?: string;
  requiresConfirmation?: boolean;
}

const actionConfigs: Record<string, ActionButtonConfig> = {
  // Approval actions
  approve: { icon: <Check className="w-4 h-4" />, label: 'Approve', variant: 'default', className: 'bg-emerald-600 hover:bg-emerald-700' },
  reject: { icon: <X className="w-4 h-4" />, label: 'Reject', variant: 'destructive', requiresConfirmation: true },
  
  // View actions
  view: { icon: <Eye className="w-4 h-4" />, label: 'View', variant: 'outline' },
  edit: { icon: <Edit className="w-4 h-4" />, label: 'Edit', variant: 'outline' },
  
  // Control actions
  start: { icon: <Play className="w-4 h-4" />, label: 'Start', variant: 'default', className: 'bg-emerald-600 hover:bg-emerald-700' },
  stop: { icon: <Square className="w-4 h-4" />, label: 'Stop', variant: 'destructive', requiresConfirmation: true },
  pause: { icon: <Pause className="w-4 h-4" />, label: 'Pause', variant: 'outline', className: 'border-amber-500 text-amber-500' },
  restart: { icon: <RotateCw className="w-4 h-4" />, label: 'Restart', variant: 'outline', requiresConfirmation: true },
  refresh: { icon: <RefreshCw className="w-4 h-4" />, label: 'Refresh', variant: 'ghost' },
  
  // CRUD actions
  add: { icon: <Plus className="w-4 h-4" />, label: 'Add', variant: 'default' },
  save: { icon: <Save className="w-4 h-4" />, label: 'Save', variant: 'default' },
  update: { icon: <RefreshCw className="w-4 h-4" />, label: 'Update', variant: 'default' },
  delete: { icon: <Trash2 className="w-4 h-4" />, label: 'Delete', variant: 'destructive', requiresConfirmation: true },
  archive: { icon: <Archive className="w-4 h-4" />, label: 'Archive', variant: 'outline', requiresConfirmation: true },
  
  // State actions
  suspend: { icon: <AlertTriangle className="w-4 h-4" />, label: 'Suspend', variant: 'outline', className: 'border-amber-500 text-amber-500', requiresConfirmation: true },
  ban: { icon: <Ban className="w-4 h-4" />, label: 'Ban', variant: 'destructive', requiresConfirmation: true },
  unlock: { icon: <Unlock className="w-4 h-4" />, label: 'Unlock', variant: 'outline' },
  lock: { icon: <Lock className="w-4 h-4" />, label: 'Lock', variant: 'outline', requiresConfirmation: true },
  
  // Transfer actions
  send: { icon: <Send className="w-4 h-4" />, label: 'Send', variant: 'default' },
  sendBack: { icon: <RotateCw className="w-4 h-4" />, label: 'Send Back', variant: 'outline' },
  download: { icon: <Download className="w-4 h-4" />, label: 'Download', variant: 'outline' },
  upload: { icon: <Upload className="w-4 h-4" />, label: 'Upload', variant: 'outline' },
  
  // Settings
  settings: { icon: <Settings className="w-4 h-4" />, label: 'Settings', variant: 'ghost' },
};

export type ActionType = keyof typeof actionConfigs;

interface ActionButtonProps {
  action: ActionType;
  module: AuditModule;
  targetId?: string;
  targetType?: string;
  onAction: () => Promise<void> | void;
  label?: string;
  className?: string;
  size?: EnterpriseButtonProps['size'];
  disabled?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Factory function to create action buttons with proper audit logging
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  module,
  targetId,
  targetType,
  onAction,
  label,
  className,
  size = 'sm',
  disabled,
  successMessage,
  errorMessage,
}) => {
  const config = actionConfigs[action];
  if (!config) {
    console.error(`Unknown action type: ${action}`);
    return null;
  }

  const buttonId = `${action}-${targetType || 'item'}-${targetId || 'unknown'}`;
  const buttonLabel = label || config.label;

  return (
    <EnterpriseButton
      buttonId={buttonId}
      label={buttonLabel}
      module={module}
      onClick={onAction}
      variant={config.variant}
      size={size}
      requiresConfirmation={config.requiresConfirmation}
      icon={config.icon}
      className={cn(config.className, className)}
      disabled={disabled}
      successMessage={successMessage || `${buttonLabel} successful`}
      errorMessage={errorMessage}
      auditContext={{ targetId, targetType, action }}
    >
      {buttonLabel}
    </EnterpriseButton>
  );
};

/**
 * Quick action group for common button patterns
 */
interface ActionGroupProps {
  module: AuditModule;
  targetId: string;
  targetType: string;
  actions: ActionType[];
  onAction: (action: ActionType) => Promise<void> | void;
  size?: EnterpriseButtonProps['size'];
  className?: string;
}

export const ActionGroup: React.FC<ActionGroupProps> = ({
  module,
  targetId,
  targetType,
  actions,
  onAction,
  size = 'sm',
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {actions.map((action) => (
        <ActionButton
          key={action}
          action={action}
          module={module}
          targetId={targetId}
          targetType={targetType}
          onAction={() => onAction(action)}
          size={size}
        />
      ))}
    </div>
  );
};

/**
 * Approval action group (Approve / Reject / Review)
 */
interface ApprovalActionsProps {
  module: AuditModule;
  targetId: string;
  targetType?: string;
  onApprove: () => Promise<void> | void;
  onReject: (reason?: string) => Promise<void> | void;
  onReview?: () => Promise<void> | void;
  size?: EnterpriseButtonProps['size'];
  className?: string;
}

export const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  module,
  targetId,
  targetType = 'approval',
  onApprove,
  onReject,
  onReview,
  size = 'sm',
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ActionButton
        action="approve"
        module={module}
        targetId={targetId}
        targetType={targetType}
        onAction={onApprove}
        size={size}
      />
      <ActionButton
        action="reject"
        module={module}
        targetId={targetId}
        targetType={targetType}
        onAction={() => onReject()}
        size={size}
      />
      {onReview && (
        <ActionButton
          action="view"
          module={module}
          targetId={targetId}
          targetType={targetType}
          onAction={onReview}
          label="Review"
          size={size}
        />
      )}
    </div>
  );
};

/**
 * Control actions group (Start / Stop / Pause / Restart)
 */
interface ControlActionsProps {
  module: AuditModule;
  targetId: string;
  targetType?: string;
  status: 'running' | 'stopped' | 'paused';
  onStart?: () => Promise<void> | void;
  onStop?: () => Promise<void> | void;
  onPause?: () => Promise<void> | void;
  onRestart?: () => Promise<void> | void;
  size?: EnterpriseButtonProps['size'];
  className?: string;
}

export const ControlActions: React.FC<ControlActionsProps> = ({
  module,
  targetId,
  targetType = 'service',
  status,
  onStart,
  onStop,
  onPause,
  onRestart,
  size = 'sm',
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {status === 'stopped' && onStart && (
        <ActionButton
          action="start"
          module={module}
          targetId={targetId}
          targetType={targetType}
          onAction={onStart}
          size={size}
        />
      )}
      {status === 'running' && (
        <>
          {onPause && (
            <ActionButton
              action="pause"
              module={module}
              targetId={targetId}
              targetType={targetType}
              onAction={onPause}
              size={size}
            />
          )}
          {onStop && (
            <ActionButton
              action="stop"
              module={module}
              targetId={targetId}
              targetType={targetType}
              onAction={onStop}
              size={size}
            />
          )}
        </>
      )}
      {status === 'paused' && onStart && (
        <ActionButton
          action="start"
          module={module}
          targetId={targetId}
          targetType={targetType}
          onAction={onStart}
          label="Resume"
          size={size}
        />
      )}
      {onRestart && status !== 'stopped' && (
        <ActionButton
          action="restart"
          module={module}
          targetId={targetId}
          targetType={targetType}
          onAction={onRestart}
          size={size}
        />
      )}
    </div>
  );
};

export default ActionButton;
