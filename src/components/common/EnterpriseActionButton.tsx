/**
 * Enterprise Action Button Component
 * Unified button with loading, confirmation, and audit logging
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Check, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEnterpriseActions, ActionConfig } from '@/hooks/useEnterpriseActions';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface EnterpriseActionButtonProps {
  config: ActionConfig;
  label: string;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  onSuccess?: (result: unknown) => void;
  onError?: (error: string) => void;
  handler?: () => Promise<unknown>;
  children?: React.ReactNode;
}

export function EnterpriseActionButton({
  config,
  label,
  icon,
  variant = 'default',
  size = 'default',
  className,
  disabled,
  onSuccess,
  onError,
  handler,
  children
}: EnterpriseActionButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { execute } = useEnterpriseActions();

  const performAction = useCallback(async () => {
    setStatus('loading');
    
    const result = await execute(config, handler);
    
    if (result.success) {
      setStatus('success');
      onSuccess?.(result.data);
      // Reset after animation
      setTimeout(() => setStatus('idle'), 1500);
    } else {
      setStatus('error');
      onError?.(result.error || 'Action failed');
      setTimeout(() => setStatus('idle'), 2000);
    }
  }, [execute, config, handler, onSuccess, onError]);

  const handleClick = useCallback(() => {
    if (config.requiresConfirmation) {
      setShowConfirm(true);
    } else {
      performAction();
    }
  }, [config.requiresConfirmation, performAction]);

  const handleConfirm = useCallback(() => {
    setShowConfirm(false);
    performAction();
  }, [performAction]);

  const buttonContent = () => {
    switch (status) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </motion.div>
        );
      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-emerald-400"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </motion.div>
        );
      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-red-400"
          >
            <X className="w-4 h-4" />
            <span>Failed</span>
          </motion.div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            {icon}
            <span>{label}</span>
          </div>
        );
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(
          'transition-all duration-200',
          status === 'success' && 'bg-emerald-500/20 border-emerald-500/50',
          status === 'error' && 'bg-red-500/20 border-red-500/50',
          className
        )}
        disabled={disabled || status === 'loading'}
        onClick={handleClick}
      >
        <AnimatePresence mode="wait">
          <motion.div key={status}>
            {children || buttonContent()}
          </motion.div>
        </AnimatePresence>
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card border-amber-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Confirm Action
            </AlertDialogTitle>
            <AlertDialogDescription>
              {config.confirmMessage || `Are you sure you want to ${config.action} ${config.target}?`}
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                This action will be logged for audit purposes.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              className={cn(
                config.action === 'delete' || config.action === 'suspend' 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-primary hover:bg-primary/90'
              )}
            >
              Confirm {config.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Quick action button variants
export function CreateButton({ module, target, ...props }: Omit<EnterpriseActionButtonProps, 'config' | 'label'> & { module: string; target: string }) {
  return (
    <EnterpriseActionButton
      config={{ module: module as any, action: 'create', target }}
      label={`Create ${target}`}
      variant="default"
      {...props}
    />
  );
}

export function DeleteButton({ module, target, targetId, ...props }: Omit<EnterpriseActionButtonProps, 'config' | 'label'> & { module: string; target: string; targetId: string }) {
  return (
    <EnterpriseActionButton
      config={{ module: module as any, action: 'delete', target, targetId, requiresConfirmation: true }}
      label="Delete"
      variant="destructive"
      {...props}
    />
  );
}

export function ApproveButton({ module, target, targetId, ...props }: Omit<EnterpriseActionButtonProps, 'config' | 'label'> & { module: string; target: string; targetId: string }) {
  return (
    <EnterpriseActionButton
      config={{ module: module as any, action: 'approve', target, targetId }}
      label="Approve"
      variant="default"
      className="bg-emerald-500 hover:bg-emerald-600"
      {...props}
    />
  );
}

export function RejectButton({ module, target, targetId, ...props }: Omit<EnterpriseActionButtonProps, 'config' | 'label'> & { module: string; target: string; targetId: string }) {
  return (
    <EnterpriseActionButton
      config={{ module: module as any, action: 'reject', target, targetId }}
      label="Reject"
      variant="destructive"
      {...props}
    />
  );
}
