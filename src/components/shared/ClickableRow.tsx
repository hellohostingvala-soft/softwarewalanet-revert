/**
 * Clickable Data Row with working actions
 * Every row action executes real handler + audit logging
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, MoreHorizontal, Check, X, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEnterpriseAudit, AuditModule } from '@/hooks/useEnterpriseAudit';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export interface RowAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  onClick: () => Promise<void> | void;
}

export interface ClickableRowProps {
  id: string;
  module: AuditModule;
  entityType: string;
  children: React.ReactNode;
  onClick?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => Promise<void> | void;
  actions?: RowAction[];
  status?: 'active' | 'pending' | 'inactive' | 'error';
  className?: string;
  showDefaultActions?: boolean;
}

export const ClickableRow: React.FC<ClickableRowProps> = ({
  id,
  module,
  entityType,
  children,
  onClick,
  onView,
  onEdit,
  onDelete,
  actions,
  status,
  className,
  showDefaultActions = true,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: RowAction | null }>({ open: false, action: null });
  const { logButtonClick, logApiCall, logCrudOperation } = useEnterpriseAudit();

  const statusColors = {
    active: 'border-l-emerald-500',
    pending: 'border-l-amber-500',
    inactive: 'border-l-gray-500',
    error: 'border-l-red-500',
  };

  const handleRowClick = useCallback(async () => {
    if (onClick) {
      await logButtonClick(`row-${id}`, `Select ${entityType}`, module, { entityId: id, entityType });
      onClick();
    }
  }, [id, entityType, module, onClick, logButtonClick]);

  const handleAction = useCallback(async (action: RowAction) => {
    if (action.requiresConfirmation) {
      setConfirmDialog({ open: true, action });
      return;
    }

    await executeAction(action);
  }, []);

  const executeAction = useCallback(async (action: RowAction) => {
    const buttonId = `row-${id}-${action.id}`;
    setLoadingAction(action.id);

    try {
      await logButtonClick(buttonId, action.label, module, { entityId: id, entityType, action: action.id });
      await action.onClick();
      await logApiCall(buttonId, 'EXECUTE', module, true, 200);
      toast.success(`${action.label} successful`);
    } catch (error) {
      await logApiCall(buttonId, 'EXECUTE', module, false, 500, 'Action failed');
      toast.error(`${action.label} failed`);
    } finally {
      setLoadingAction(null);
      setConfirmDialog({ open: false, action: null });
    }
  }, [id, entityType, module, logButtonClick, logApiCall]);

  const handleView = useCallback(async () => {
    if (onView) {
      await logButtonClick(`row-${id}-view`, 'View', module, { entityId: id, entityType });
      onView();
    }
  }, [id, entityType, module, onView, logButtonClick]);

  const handleEdit = useCallback(async () => {
    if (onEdit) {
      await logButtonClick(`row-${id}-edit`, 'Edit', module, { entityId: id, entityType });
      onEdit();
    }
  }, [id, entityType, module, onEdit, logButtonClick]);

  const handleDelete = useCallback(async () => {
    if (onDelete) {
      setLoadingAction('delete');
      try {
        await logButtonClick(`row-${id}-delete`, 'Delete', module, { entityId: id, entityType });
        await onDelete();
        await logCrudOperation('soft_delete', entityType, id, module);
        toast.success('Deleted successfully');
      } catch (error) {
        toast.error('Delete failed');
      } finally {
        setLoadingAction(null);
      }
    }
  }, [id, entityType, module, onDelete, logButtonClick, logCrudOperation]);

  // Build default actions
  const defaultActions: RowAction[] = [];
  if (showDefaultActions) {
    if (onView) {
      defaultActions.push({
        id: 'view',
        label: 'View Details',
        icon: <Eye className="w-4 h-4" />,
        onClick: handleView,
      });
    }
    if (onEdit) {
      defaultActions.push({
        id: 'edit',
        label: 'Edit',
        icon: <Edit className="w-4 h-4" />,
        onClick: handleEdit,
      });
    }
    if (onDelete) {
      defaultActions.push({
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="w-4 h-4" />,
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationMessage: `Are you sure you want to delete this ${entityType}?`,
        onClick: handleDelete,
      });
    }
  }

  const allActions = [...defaultActions, ...(actions || [])];

  return (
    <>
      <motion.div
        whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
        className={cn(
          'flex items-center justify-between p-4 border-b border-l-4 cursor-pointer transition-colors',
          status ? statusColors[status] : 'border-l-transparent',
          className
        )}
        onClick={handleRowClick}
      >
        <div className="flex-1">{children}</div>

        <div className="flex items-center gap-2">
          {/* Quick action buttons */}
          {onView && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleView();
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}

          {/* More actions dropdown */}
          {allActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {loadingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="w-4 h-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {allActions.map((action, index) => (
                  <React.Fragment key={action.id}>
                    {index > 0 && action.variant === 'destructive' && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      className={cn(
                        action.variant === 'destructive' && 'text-destructive focus:text-destructive',
                        action.variant === 'warning' && 'text-amber-500 focus:text-amber-500'
                      )}
                      onClick={() => handleAction(action)}
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </DropdownMenuItem>
                  </React.Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => setConfirmDialog({ open, action: open ? confirmDialog.action : null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action?.confirmationMessage || 'Are you sure you want to perform this action?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog.action && executeAction(confirmDialog.action)}
              className={cn(
                confirmDialog.action?.variant === 'destructive' && 'bg-destructive hover:bg-destructive/90'
              )}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClickableRow;
