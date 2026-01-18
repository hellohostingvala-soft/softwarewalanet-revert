/**
 * ACTION BOX COMPONENT — CORE THEME LOCKED
 * ==========================================
 * Every box MUST have actions. No static/decorative boxes allowed.
 * Actions depend on box context + user permissions.
 * 
 * LOCKED STRUCTURE - BOSS APPROVAL REQUIRED FOR CHANGES
 */

import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Eye, Edit3, RefreshCw, Send, CheckCircle, XCircle,
  Pause, Play, StopCircle, Trash2, Brain, FileText,
  MoreHorizontal, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// ===== BOX TYPES =====
export type BoxType = 'data' | 'process' | 'ai' | 'approval' | 'live';

// ===== STATUS TYPES =====
export type BoxStatus = 'active' | 'pending' | 'suspended' | 'stopped' | 'error';

// ===== PERMISSION LEVELS =====
export type PermissionLevel = 'boss' | 'ceo' | 'manager' | 'readonly';

// ===== ACTION DEFINITIONS =====
interface ActionConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  colorClass?: string;
  requiredPermission: PermissionLevel[];
}

// All possible actions
const ALL_ACTIONS: Record<string, ActionConfig> = {
  view: { id: 'view', label: 'View', icon: Eye, variant: 'outline', requiredPermission: ['boss', 'ceo', 'manager', 'readonly'] },
  edit: { id: 'edit', label: 'Edit', icon: Edit3, variant: 'outline', requiredPermission: ['boss', 'ceo', 'manager'] },
  update: { id: 'update', label: 'Update', icon: RefreshCw, variant: 'outline', requiredPermission: ['boss', 'ceo', 'manager'] },
  post: { id: 'post', label: 'Post', icon: Send, variant: 'default', colorClass: 'bg-blue-600 hover:bg-blue-700', requiredPermission: ['boss', 'ceo', 'manager'] },
  approve: { id: 'approve', label: 'Approve', icon: CheckCircle, variant: 'default', colorClass: 'bg-emerald-600 hover:bg-emerald-700', requiredPermission: ['boss', 'ceo', 'manager'] },
  reject: { id: 'reject', label: 'Reject', icon: XCircle, variant: 'destructive', requiredPermission: ['boss', 'ceo', 'manager'] },
  suspend: { id: 'suspend', label: 'Suspend', icon: Pause, variant: 'outline', colorClass: 'border-amber-500 text-amber-500 hover:bg-amber-500/10', requiredPermission: ['boss', 'ceo'] },
  resume: { id: 'resume', label: 'Resume', icon: Play, variant: 'outline', colorClass: 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10', requiredPermission: ['boss', 'ceo', 'manager'] },
  stop: { id: 'stop', label: 'Stop', icon: StopCircle, variant: 'destructive', requiredPermission: ['boss', 'ceo'] },
  start: { id: 'start', label: 'Start', icon: Play, variant: 'default', colorClass: 'bg-emerald-600 hover:bg-emerald-700', requiredPermission: ['boss', 'ceo', 'manager'] },
  delete: { id: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive', requiredPermission: ['boss'] },
  startAi: { id: 'startAi', label: 'Start AI', icon: Brain, variant: 'default', colorClass: 'bg-cyan-600 hover:bg-cyan-700', requiredPermission: ['boss', 'ceo'] },
  stopAi: { id: 'stopAi', label: 'Stop AI', icon: StopCircle, variant: 'outline', colorClass: 'border-cyan-500 text-cyan-500', requiredPermission: ['boss', 'ceo'] },
  viewLogs: { id: 'viewLogs', label: 'View Logs', icon: FileText, variant: 'outline', requiredPermission: ['boss', 'ceo', 'manager'] },
  pauseMonitoring: { id: 'pauseMonitoring', label: 'Pause Monitoring', icon: Pause, variant: 'outline', requiredPermission: ['boss', 'ceo', 'manager'] },
};

// Actions per box type
const BOX_TYPE_ACTIONS: Record<BoxType, string[]> = {
  data: ['view', 'edit', 'update', 'delete'],
  process: ['view', 'start', 'stop', 'resume'],
  ai: ['view', 'startAi', 'stopAi', 'viewLogs'],
  approval: ['view', 'approve', 'reject', 'suspend'],
  live: ['view', 'pauseMonitoring'],
};

// Status badge colors
const STATUS_COLORS: Record<BoxStatus, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  suspended: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  stopped: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  error: 'bg-red-500/20 text-red-400 border-red-500/50',
};

// ===== PROPS =====
interface ActionBoxProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  boxType: BoxType;
  status: BoxStatus;
  userPermission: PermissionLevel;
  entityId: string;
  onAction: (actionId: string, entityId: string) => void;
  children?: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  compact?: boolean;
}

// ===== MAIN COMPONENT =====
export const ActionBox = memo<ActionBoxProps>(({
  title,
  subtitle,
  icon: Icon,
  boxType,
  status,
  userPermission,
  entityId,
  onAction,
  children,
  className,
  headerRight,
  compact = false,
}) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Get available actions based on box type and user permission
  const availableActions = BOX_TYPE_ACTIONS[boxType]
    .map(actionId => ALL_ACTIONS[actionId])
    .filter(action => action.requiredPermission.includes(userPermission));

  // Handle action click
  const handleAction = useCallback(async (actionId: string) => {
    setIsProcessing(actionId);
    
    try {
      await onAction(actionId, entityId);
      toast.success(`${ALL_ACTIONS[actionId].label} completed successfully`);
    } catch (error) {
      toast.error(`${ALL_ACTIONS[actionId].label} failed`);
    } finally {
      setIsProcessing(null);
    }
  }, [onAction, entityId]);

  // Render action buttons (max 3 visible, rest in dropdown)
  const visibleActions = availableActions.slice(0, compact ? 2 : 3);
  const dropdownActions = availableActions.slice(compact ? 2 : 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("group", className)}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        "bg-card/50 backdrop-blur border-border/50",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      )}>
        {/* Header */}
        <CardHeader className={cn("pb-2", compact && "p-4")}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {Icon && (
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base font-semibold text-foreground truncate">
                  {title}
                </CardTitle>
                {subtitle && (
                  <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
                )}
              </div>
            </div>
            
            {/* Status Badge + Custom Header Right */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {headerRight}
              <Badge className={cn("text-xs font-medium capitalize", STATUS_COLORS[status])}>
                {status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        {children && (
          <CardContent className={cn("pt-0", compact && "px-4 pb-4")}>
            {children}
          </CardContent>
        )}

        {/* Action Buttons - Always visible, never hidden */}
        <div className={cn(
          "px-4 py-3 border-t border-border/30 flex items-center gap-2 flex-wrap",
          "bg-gradient-to-r from-transparent via-muted/5 to-transparent"
        )}>
          {visibleActions.map((action) => {
            const ActionIcon = action.icon;
            const isLoading = isProcessing === action.id;
            
            return (
              <Button
                key={action.id}
                size="sm"
                variant={action.variant}
                className={cn(
                  "gap-1.5 text-xs font-medium h-8",
                  action.colorClass
                )}
                onClick={() => handleAction(action.id)}
                disabled={isLoading}
              >
                <ActionIcon className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                {action.label}
              </Button>
            );
          })}

          {/* Dropdown for additional actions */}
          {dropdownActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1 text-xs h-8">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                  More
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {dropdownActions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      className="gap-2 text-sm"
                    >
                      <ActionIcon className="w-4 h-4" />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </Card>
    </motion.div>
  );
});

ActionBox.displayName = 'ActionBox';

// ===== QUICK STAT BOX (For dashboard stats with actions) =====
interface QuickStatBoxProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  status: BoxStatus;
  boxType: BoxType;
  userPermission: PermissionLevel;
  entityId: string;
  onAction: (actionId: string, entityId: string) => void;
  colorClass?: string;
}

export const QuickStatBox = memo<QuickStatBoxProps>(({
  title,
  value,
  icon: Icon,
  trend,
  status,
  boxType,
  userPermission,
  entityId,
  onAction,
  colorClass = 'from-blue-500/10 to-cyan-500/10 border-blue-500/30',
}) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const availableActions = BOX_TYPE_ACTIONS[boxType]
    .map(actionId => ALL_ACTIONS[actionId])
    .filter(action => action.requiredPermission.includes(userPermission))
    .slice(0, 2); // Max 2 actions for stat boxes

  const handleAction = useCallback(async (actionId: string) => {
    setIsProcessing(actionId);
    try {
      await onAction(actionId, entityId);
      toast.success(`${ALL_ACTIONS[actionId].label} completed`);
    } finally {
      setIsProcessing(null);
    }
  }, [onAction, entityId]);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="group"
    >
      <Card className={cn("bg-gradient-to-br border overflow-hidden", colorClass)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {trend && (
                <p className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-emerald-400" : "text-red-400"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <Icon className="w-8 h-8 text-primary/30" />
              <Badge className={cn("text-[10px]", STATUS_COLORS[status])}>
                {status}
              </Badge>
            </div>
          </div>
          
          {/* Actions row */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-border/20">
            {availableActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={action.id}
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => handleAction(action.id)}
                  disabled={isProcessing === action.id}
                >
                  <ActionIcon className="w-3 h-3" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

QuickStatBox.displayName = 'QuickStatBox';

export default ActionBox;
