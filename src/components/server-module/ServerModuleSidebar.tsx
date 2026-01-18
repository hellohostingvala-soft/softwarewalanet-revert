/**
 * SERVER MODULE SIDEBAR
 * Ultra-simple sidebar with exactly 9 items as specified
 * Includes Back to Boss button for navigation
 * 
 * SINGLE-CONTEXT ENFORCEMENT:
 * - Only renders when activeContext === 'module' AND category matches
 * - Back button triggers full context switch to Boss
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Plus, Server, Activity, Shield, 
  Database, FileText, Brain, Settings, ArrowLeft 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore, useShouldRenderSidebar } from '@/stores/sidebarStore';

export type ServerModuleSection = 
  | 'overview'
  | 'add-server'
  | 'active-servers'
  | 'health-load'
  | 'security'
  | 'backups'
  | 'logs'
  | 'ai-actions'
  | 'settings';

interface ServerModuleSidebarProps {
  activeSection: ServerModuleSection;
  onSectionChange: (section: ServerModuleSection) => void;
  onBack?: () => void;
}

const sidebarItems: { id: ServerModuleSection; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'add-server', label: 'Add Server', icon: Plus },
  { id: 'active-servers', label: 'Active Servers', icon: Server },
  { id: 'health-load', label: 'Health & Load', icon: Activity },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'backups', label: 'Backups', icon: Database },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'ai-actions', label: 'AI Actions', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const ServerModuleSidebar: React.FC<ServerModuleSidebarProps> = ({
  activeSection,
  onSectionChange,
  onBack,
}) => {
  // SINGLE-CONTEXT ENFORCEMENT: Use store for clean context transitions
  const { exitToGlobal } = useSidebarStore();
  
  // Use the dedicated hook to check if this sidebar should render
  const shouldRender = useShouldRenderSidebar('category', 'server-manager');
  
  // Handle back navigation - triggers FULL context switch to Boss
  const handleBack = () => {
    // 1. Update store state (Boss context)
    exitToGlobal();
    // 2. Call parent callback to update navigation state
    onBack?.();
  };
  
  // STRICT ISOLATION: Only render when in Module context with matching category
  // This prevents double sidebars completely
  if (!shouldRender) {
    return null;
  }
  
  return (
    <div className="w-56 bg-card/50 border-r border-border/50 flex flex-col shrink-0">
      {/* Back Button - Triggers context switch */}
      <div className="p-2 border-b border-border/50">
        <motion.button
          onClick={handleBack}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Boss</span>
        </motion.button>
      </div>
      
      {/* Module Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Server className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">Servers</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-auto">
        {sidebarItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Status Footer */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400">AI Active</span>
        </div>
      </div>
    </div>
  );
};

export default ServerModuleSidebar;
