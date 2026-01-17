/**
 * LEAD MODULE SIDEBAR (Step 9)
 * 10-item sidebar with Back to Boss button
 */
import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, Radio, Globe, Target,
  UserCheck, PhoneCall, TrendingUp, BarChart3, Settings, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export type LeadSection = 
  | 'dashboard'
  | 'all-leads'
  | 'lead-sources'
  | 'country-view'
  | 'lead-scoring'
  | 'assignments'
  | 'follow-ups'
  | 'conversions'
  | 'reports'
  | 'settings';

interface LeadModuleSidebarProps {
  activeSection: LeadSection;
  onSectionChange: (section: LeadSection) => void;
  onBack?: () => void;
}

const menuItems: { id: LeadSection; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'all-leads', label: 'All Leads', icon: Users },
  { id: 'lead-sources', label: 'Lead Sources', icon: Radio },
  { id: 'country-view', label: 'Country View', icon: Globe },
  { id: 'lead-scoring', label: 'Lead Scoring', icon: Target },
  { id: 'assignments', label: 'Assignments', icon: UserCheck },
  { id: 'follow-ups', label: 'Follow-ups', icon: PhoneCall },
  { id: 'conversions', label: 'Conversions', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const LeadModuleSidebar: React.FC<LeadModuleSidebarProps> = ({
  activeSection,
  onSectionChange,
  onBack,
}) => {
  return (
    <div className="w-56 bg-card/50 border-r border-border/50 flex flex-col h-full">
      {/* Back Button */}
      {onBack && (
        <div className="p-2 border-b border-border/50">
          <motion.button
            onClick={onBack}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Boss</span>
          </motion.button>
        </div>
      )}
      
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Lead Manager</h2>
            <p className="text-[10px] text-muted-foreground">AI-Powered CRM</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 py-2">
        <div className="px-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                  isActive 
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-muted-foreground")} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pipeline Active</span>
        </div>
      </div>
    </div>
  );
};
