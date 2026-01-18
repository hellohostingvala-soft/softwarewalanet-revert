/**
 * Shared Components Index
 * Export all shared/reusable components
 */

// Enterprise Button System
export { EnterpriseButton, ApproveButton, RejectButton, SuspendButton } from './EnterpriseButton';
export type { EnterpriseButtonProps, ButtonState } from './EnterpriseButton';

// Action Button Factory
export { ActionButton, ActionGroup, ApprovalActions, ControlActions } from './ActionButtonFactory';
export type { ActionType } from './ActionButtonFactory';

// Action Box System (UI-only version)
export { ActionBox, QuickStatBox } from './ActionBox';
export type { BoxType, BoxStatus, PermissionLevel } from './ActionBox';

// Action Box with Real Backend Permissions
export { ActionBoxWithPermissions } from './ActionBoxWithPermissions';

// Interactive Components
export { InteractiveKPICard, KPIGrid } from './InteractiveKPICard';
export type { KPICardProps, KPIAction } from './InteractiveKPICard';

export { ClickableRow } from './ClickableRow';
export type { ClickableRowProps, RowAction } from './ClickableRow';

// Header Components
export { HeaderIconButton } from './HeaderIconButton';
export { GlobalHeaderActions } from './GlobalHeaderActions';

// Button Binding Utilities
export { 
  generateButtonId, 
  useRegistryClickHandler, 
  WithRegistryBinding, 
  EnsureAction,
  ButtonStatusIndicator,
  ClickableCard,
  ClickableRow as ClickableTableRow 
} from './ButtonBindingUtils';

// Loading & Fallback Components
export { 
  RouteNotFoundScreen, 
  LoadingSkeleton, 
  ComingSoonScreen, 
  ContentSkeleton 
} from './RouteLoadingFallback';

// Breadcrumb
export { default as ModuleBreadcrumb } from './ModuleBreadcrumb';
