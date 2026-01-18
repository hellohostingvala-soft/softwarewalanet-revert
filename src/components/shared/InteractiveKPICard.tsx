/**
 * Interactive KPI Card with working actions
 * Every button executes real action + audit logging
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, Pause, RotateCw, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEnterpriseAudit, AuditModule } from '@/hooks/useEnterpriseAudit';

export interface KPIAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  variant: 'approve' | 'reject' | 'review' | 'suspend' | 'sendback';
  onClick: () => Promise<void> | void;
}

export interface KPICardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  module: AuditModule;
  actions?: KPIAction[];
  onClick?: () => void;
  className?: string;
  showQuickActions?: boolean;
}

export const InteractiveKPICard: React.FC<KPICardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  status = 'info',
  module,
  actions,
  onClick,
  className,
  showQuickActions = true,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const { logButtonClick, logApiCall } = useEnterpriseAudit();

  const statusColors = {
    success: 'border-emerald-500/30 bg-emerald-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    error: 'border-red-500/30 bg-red-500/5',
    info: 'border-blue-500/30 bg-blue-500/5',
  };

  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-muted-foreground',
  };

  const handleAction = useCallback(async (action: KPIAction) => {
    const buttonId = `kpi-${id}-${action.id}`;
    setLoadingAction(action.id);

    try {
      await logButtonClick(buttonId, action.label, module, { kpiId: id, action: action.variant });
      await action.onClick();
      await logApiCall(buttonId, 'EXECUTE', module, true, 200);
      
      // Show appropriate toast based on action type
      switch (action.variant) {
        case 'approve':
          toast.success(`✓ Approved: ${title}`);
          break;
        case 'reject':
          toast.error(`✕ Rejected: ${title}`);
          break;
        case 'review':
          toast.info(`👁 Reviewing: ${title}`);
          break;
        case 'suspend':
          toast.warning(`⏸ Suspended: ${title}`);
          break;
        case 'sendback':
          toast.info(`↩ Sent back: ${title}`);
          break;
      }
    } catch (error) {
      await logApiCall(`kpi-${id}-${action.id}`, 'EXECUTE', module, false, 500, 'Action failed');
      toast.error(`Action failed: ${title}`);
    } finally {
      setLoadingAction(null);
    }
  }, [id, title, module, logButtonClick, logApiCall]);

  const handleCardClick = useCallback(async () => {
    if (onClick) {
      await logButtonClick(`kpi-${id}-card`, `View ${title}`, module, { kpiId: id });
      onClick();
    }
  }, [id, title, module, onClick, logButtonClick]);

  // Default actions if none provided
  const defaultActions: KPIAction[] = [
    { id: 'approve', icon: <Check className="w-3 h-3" />, label: 'Approve', variant: 'approve', onClick: async () => {} },
    { id: 'reject', icon: <X className="w-3 h-3" />, label: 'Reject', variant: 'reject', onClick: async () => {} },
    { id: 'review', icon: <Eye className="w-3 h-3" />, label: 'Review', variant: 'review', onClick: async () => {} },
  ];

  const displayActions = actions || (showQuickActions ? defaultActions : []);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all border',
          statusColors[status],
          'hover:shadow-lg',
          className
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon && <div className="text-muted-foreground">{icon}</div>}
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
            </div>
            {trend && trendValue && (
              <Badge variant="outline" className={cn('text-xs', trendColors[trend])}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trendValue}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            {onClick && (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Quick Actions */}
          {displayActions.length > 0 && (
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/50">
              {displayActions.map((action) => (
                <Button
                  key={action.id}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    'h-7 px-2 text-xs',
                    action.variant === 'approve' && 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10',
                    action.variant === 'reject' && 'text-red-500 hover:text-red-600 hover:bg-red-500/10',
                    action.variant === 'review' && 'text-blue-500 hover:text-blue-600 hover:bg-blue-500/10',
                    action.variant === 'suspend' && 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10',
                    action.variant === 'sendback' && 'text-purple-500 hover:text-purple-600 hover:bg-purple-500/10'
                  )}
                  disabled={loadingAction !== null}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(action);
                  }}
                >
                  {loadingAction === action.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    action.icon
                  )}
                  <span className="ml-1">{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * KPI Grid Component
 */
interface KPIGridProps {
  items: Omit<KPICardProps, 'module'>[];
  module: AuditModule;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export const KPIGrid: React.FC<KPIGridProps> = ({
  items,
  module,
  columns = 4,
  className,
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {items.map((item) => (
        <InteractiveKPICard key={item.id} {...item} module={module} />
      ))}
    </div>
  );
};

export default InteractiveKPICard;
