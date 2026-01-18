/**
 * CONTROL PANEL SIDEBAR - STRUCTURAL REBUILD
 * ONLY NAVIGATION - NO DATA, NO STATS, NO ACTIVITY
 * 12 ROLE BUTTONS + STATUS STRIP
 * LOCKED STRUCTURE - BOSS APPROVAL REQUIRED
 */

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Crown, Eye, Globe2, Flag, Server, Building2, Headphones, 
  Handshake, Target, Box, Terminal, ChevronLeft, ChevronRight, LogOut, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

// ===== LOCKED COLORS =====
const COLORS = {
  bg: '#0a1628',
  bgGradient: 'linear-gradient(180deg, #0a1628 0%, #0d1b2a 100%)',
  border: '#1e3a5f',
  activeHighlight: '#2563eb',
  hoverBg: 'rgba(37, 99, 235, 0.15)',
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  iconColor: '#60a5fa',
};

// ===== 12 ROLE CATEGORIES (EXACT ORDER - LOCKED) =====
const ROLE_CATEGORIES = [
  { id: 'boss_owner', label: 'Boss / Owner', icon: Crown },
  { id: 'ceo', label: 'CEO', icon: Eye },
  { id: 'vala_ai', label: 'Vala AI', icon: Brain },
  { id: 'server_manager', label: 'Server Manager', icon: Server },
  { id: 'continent_super_admin', label: 'Continent Admin', icon: Globe2 },
  { id: 'country_head', label: 'Country Head', icon: Flag },
  { id: 'franchise_manager', label: 'Franchise Manager', icon: Building2 },
  { id: 'sales_support_manager', label: 'Sales & Support Manager', icon: Headphones },
  { id: 'reseller_manager', label: 'Reseller Manager', icon: Handshake },
  { id: 'lead_manager', label: 'Lead Manager', icon: Target },
  { id: 'product_manager', label: 'Product Manager', icon: Box },
  { id: 'demo_manager', label: 'Demo Manager', icon: Terminal },
] as const;

type RoleId = typeof ROLE_CATEGORIES[number]['id'];

interface ControlPanelSidebarProps {
  activeRole?: RoleId;
  onRoleSelect: (roleId: RoleId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

// ===== ROLE BUTTON (UNIFORM SIZE) =====
const RoleButton = memo<{
  role: typeof ROLE_CATEGORIES[number];
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  index: number;
}>(({ role, isActive, collapsed, onClick, index }) => {
  const Icon = role.icon;
  
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.02 }}
          onClick={onClick}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg transition-all duration-100",
            collapsed ? "justify-center px-2 py-3" : "px-3 py-3",
            isActive ? "text-white font-semibold" : "text-white/80 hover:text-white"
          )}
          style={{
            background: isActive ? COLORS.activeHighlight : 'transparent',
            borderLeft: isActive ? `3px solid ${COLORS.text}` : '3px solid transparent',
          }}
          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = COLORS.hoverBg; }}
          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
        >
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            isActive ? "bg-white/20" : "bg-white/10"
          )}>
            <Icon className="w-5 h-5" style={{ color: isActive ? COLORS.text : COLORS.iconColor }} />
          </div>
          {!collapsed && (
            <span className="text-sm font-medium truncate">{role.label}</span>
          )}
          {!collapsed && isActive && (
            <ChevronRight className="w-4 h-4 text-white/80 ml-auto flex-shrink-0" />
          )}
        </motion.button>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right" sideOffset={10} className="text-sm">{role.label}</TooltipContent>
      )}
    </Tooltip>
  );
});
RoleButton.displayName = 'RoleButton';

// ===== MAIN SIDEBAR COMPONENT =====
export const ControlPanelSidebar = memo<ControlPanelSidebarProps>(({
  activeRole,
  onRoleSelect,
  collapsed,
  onToggleCollapse,
  onLogout,
}) => {
  const handleRoleClick = useCallback((roleId: RoleId) => {
    onRoleSelect(roleId);
  }, [onRoleSelect]);

  return (
    <aside
      className="flex flex-col border-r transition-all duration-150 h-screen flex-shrink-0"
      style={{
        width: collapsed ? 72 : 280,
        background: COLORS.bgGradient,
        borderColor: COLORS.border,
      }}
    >
      {/* HEADER - Title Only */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        {!collapsed ? (
          <div>
            <h1 className="text-lg font-bold text-white">Control Panel</h1>
            <p className="text-xs text-white/60 mt-0.5">Super Admin</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <Crown className="w-6 h-6" style={{ color: COLORS.iconColor }} />
          </div>
        )}
      </div>

      {/* NAVIGATION - ONLY ROLES, NO DATA */}
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-0.5 px-2">
          {ROLE_CATEGORIES.map((role, index) => (
            <RoleButton
              key={role.id}
              role={role}
              isActive={activeRole === role.id}
              collapsed={collapsed}
              onClick={() => handleRoleClick(role.id)}
              index={index}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* STATUS STRIP - RUNNING | AI: ACTIVE | SYSTEM: HEALTHY */}
      <div className="px-2 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${COLORS.border}` }}>
        {!collapsed ? (
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-400">RUNNING</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-cyan-400">AI: ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-blue-500/10 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[10px] font-semibold text-blue-400">HEALTHY</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Running" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" title="AI Active" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" title="Healthy" />
          </div>
        )}
      </div>

      {/* FOOTER - Collapse & Logout */}
      <div className="p-2 space-y-1 flex-shrink-0" style={{ borderTop: `1px solid ${COLORS.border}` }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn(
            "w-full text-white hover:bg-white/10 h-9",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4 mr-2" /><span className="text-sm">Collapse</span></>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className={cn(
            "w-full text-white/70 hover:text-white hover:bg-red-500/20 h-9",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-sm ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
});

ControlPanelSidebar.displayName = 'ControlPanelSidebar';
export default ControlPanelSidebar;
export type { RoleId };
