/**
 * CUSTOMER SUPPORT MANAGER SIDEBAR
 * Comprehensive hierarchical sidebar with 12 main sections
 * Reseller-style structure with collapsible sub-menus
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Activity,
  Gauge,
  Bot,
  AlertTriangle,
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  AlertCircle,
  Globe,
  Mail,
  Smartphone,
  Store,
  MessageSquare,
  Webhook,
  Timer,
  CircleDot,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Bug,
  FileQuestion,
  KeyRound,
  Scale,
  Cpu,
  Sparkles,
  Brain,
  ThumbsUp,
  GraduationCap,
  UserCheck,
  UserMinus,
  Headphones,
  Briefcase,
  Layers,
  ArrowUpCircle,
  Shield,
  User,
  Eye,
  History,
  Package,
  MapPin,
  FileText,
  Send,
  Languages,
  Download,
  Image,
  ClipboardCheck,
  Unlock,
  Star,
  BarChart3,
  PieChart,
  Smile,
  Bell,
  AlertOctagon,
  Zap,
  Settings,
  CalendarClock,
  Moon,
  Siren,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

export type CustomerSupportSection = string;

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
  children?: MenuItem[];
}

const sidebarMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    children: [
      { id: 'dashboard-overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'dashboard-live-status', label: 'Live Support Status', icon: Activity },
      { id: 'dashboard-sla-health', label: 'SLA Health Meter', icon: Gauge },
      { id: 'dashboard-ai-human', label: 'AI vs Human Load', icon: Bot },
      { id: 'dashboard-urgent', label: 'Urgent Alerts', icon: AlertTriangle, badge: 3 },
    ],
  },
  {
    id: 'tickets',
    label: 'Tickets Management',
    icon: Ticket,
    children: [
      { id: 'tickets-all', label: 'All Tickets', icon: Ticket },
      { id: 'tickets-open', label: 'Open', icon: CircleDot, badge: 12 },
      { id: 'tickets-in-progress', label: 'In-Progress', icon: Activity },
      { id: 'tickets-waiting-customer', label: 'Waiting on Customer', icon: Clock },
      { id: 'tickets-waiting-internal', label: 'Waiting on Internal', icon: Users },
      { id: 'tickets-resolved', label: 'Resolved', icon: CheckCircle },
      { id: 'tickets-closed', label: 'Closed', icon: XCircle },
      { id: 'priority-critical', label: 'Critical (Red)', icon: AlertOctagon, badge: 2, badgeColor: 'red' },
      { id: 'priority-high', label: 'High Priority', icon: AlertTriangle },
      { id: 'priority-medium', label: 'Medium Priority', icon: Timer },
      { id: 'priority-low', label: 'Low Priority', icon: Clock },
      { id: 'source-website', label: 'Website', icon: Globe },
      { id: 'source-app', label: 'App', icon: Smartphone },
      { id: 'source-marketplace', label: 'Marketplace', icon: Store },
      { id: 'source-email', label: 'Email', icon: Mail },
      { id: 'source-chat', label: 'Internal Chat', icon: MessageSquare },
      { id: 'source-api', label: 'API / Webhook', icon: Webhook },
      { id: 'sla-met', label: 'SLA Met', icon: CheckCircle },
      { id: 'sla-breached', label: 'SLA Breached', icon: XCircle, badge: 5 },
      { id: 'sla-at-risk', label: 'SLA At Risk', icon: AlertTriangle, badge: 8 },
    ],
  },
  {
    id: 'requests',
    label: 'Customer Requests',
    icon: FileQuestion,
    children: [
      { id: 'req-product', label: 'Product Issues', icon: Package },
      { id: 'req-billing', label: 'Billing Issues', icon: CreditCard },
      { id: 'req-refund', label: 'Refund / Cancellation', icon: RefreshCw },
      { id: 'req-feature', label: 'Feature Request', icon: Sparkles },
      { id: 'req-bug', label: 'Bug Report', icon: Bug },
      { id: 'req-demo', label: 'Demo / Trial Issue', icon: TrendingUp },
      { id: 'req-access', label: 'Account Access Issue', icon: KeyRound },
      { id: 'req-legal', label: 'Legal / Compliance Query', icon: Scale },
    ],
  },
  {
    id: 'ai-support',
    label: 'AI Support System',
    icon: Bot,
    children: [
      { id: 'ai-auto-reply', label: 'AI Auto-Reply Engine', icon: Send },
      { id: 'ai-classification', label: 'AI Ticket Classification', icon: Layers },
      { id: 'ai-priority', label: 'AI Priority Detection', icon: AlertTriangle },
      { id: 'ai-sentiment', label: 'AI Sentiment Analysis', icon: ThumbsUp },
      { id: 'ai-suggested', label: 'AI Suggested Reply', icon: Sparkles },
      { id: 'ai-auto-resolve', label: 'AI Auto-Resolve', icon: CheckCircle },
      { id: 'ai-escalation', label: 'AI Escalation Trigger', icon: ArrowUpCircle },
      { id: 'ai-learning', label: 'AI Learning Logs', icon: GraduationCap },
    ],
  },
  {
    id: 'human-support',
    label: 'Human Support Team',
    icon: Headphones,
    children: [
      { id: 'agents-active', label: 'Active Agents', icon: UserCheck, badge: 8 },
      { id: 'agents-idle', label: 'Idle Agents', icon: Clock },
      { id: 'agents-offline', label: 'Offline Agents', icon: UserMinus },
      { id: 'skill-technical', label: 'Technical', icon: Cpu },
      { id: 'skill-billing', label: 'Billing', icon: CreditCard },
      { id: 'skill-legal', label: 'Legal', icon: Scale },
      { id: 'skill-sales', label: 'Sales', icon: TrendingUp },
      { id: 'workload', label: 'Workload Distribution', icon: PieChart },
      { id: 'shifts', label: 'Shift Management', icon: CalendarClock },
      { id: 'escalation-levels', label: 'Escalation Levels (L1→L4)', icon: Layers },
    ],
  },
  {
    id: 'escalations',
    label: 'Escalations',
    icon: ArrowUpCircle,
    children: [
      { id: 'esc-auto', label: 'Auto Escalations', icon: Zap },
      { id: 'esc-manual', label: 'Manual Escalations', icon: User },
      { id: 'esc-management', label: 'Management Escalations', icon: Briefcase, badge: 2 },
      { id: 'esc-legal', label: 'Legal Escalations', icon: Scale },
      { id: 'esc-sla', label: 'SLA Breach Escalations', icon: AlertTriangle, badge: 4 },
    ],
  },
  {
    id: 'customer-profiles',
    label: 'Customer Profiles',
    icon: User,
    children: [
      { id: 'profile-masked', label: 'Masked Identity View', icon: Eye },
      { id: 'profile-history', label: 'Ticket History', icon: History },
      { id: 'profile-usage', label: 'Product Usage Snapshot', icon: BarChart3 },
      { id: 'profile-payment', label: 'Payment Status (Masked)', icon: CreditCard },
      { id: 'profile-location', label: 'Location (Country-Only)', icon: MapPin },
      { id: 'profile-sla', label: 'Previous SLA Issues', icon: AlertCircle },
    ],
  },
  {
    id: 'communication',
    label: 'Communication Center',
    icon: MessageSquare,
    children: [
      { id: 'comm-notes', label: 'Internal Notes', icon: FileText },
      { id: 'comm-replies', label: 'Customer Replies', icon: Send },
      { id: 'comm-ai-draft', label: 'AI Draft Replies', icon: Bot },
      { id: 'comm-templates', label: 'Pre-Approved Templates', icon: ClipboardCheck },
      { id: 'comm-translation', label: 'Language Translation', icon: Languages },
      { id: 'comm-no-download', label: 'File Restrictions', icon: Download },
      { id: 'comm-no-copy', label: 'Copy Enforcement', icon: Image },
    ],
  },
  {
    id: 'approvals',
    label: 'Approvals',
    icon: ClipboardCheck,
    children: [
      { id: 'approve-refund', label: 'Refund Approval', icon: RefreshCw, badge: 5 },
      { id: 'approve-compensation', label: 'Compensation Approval', icon: CreditCard },
      { id: 'approve-sla-waiver', label: 'SLA Waiver Approval', icon: Shield },
      { id: 'approve-unlock', label: 'Account Unlock Approval', icon: Unlock },
      { id: 'approve-priority', label: 'Priority Upgrade Approval', icon: Star },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
    children: [
      { id: 'report-volume', label: 'Ticket Volume', icon: Ticket },
      { id: 'report-resolution', label: 'Resolution Time', icon: Timer },
      { id: 'report-agent', label: 'Agent Performance', icon: Users },
      { id: 'report-ai', label: 'AI Accuracy', icon: Bot },
      { id: 'report-satisfaction', label: 'Customer Satisfaction', icon: Smile },
      { id: 'report-breakdown', label: 'Country / Product Breakdown', icon: PieChart },
    ],
  },
  {
    id: 'alerts',
    label: 'Alerts & Notifications',
    icon: Bell,
    children: [
      { id: 'alert-sla', label: 'SLA Breach Alert', icon: AlertTriangle, badge: 3 },
      { id: 'alert-critical', label: 'Critical Ticket Alert', icon: AlertOctagon },
      { id: 'alert-abuse', label: 'Abuse / Spam Alert', icon: Shield },
      { id: 'alert-escalation', label: 'Escalation Alert', icon: ArrowUpCircle },
      { id: 'alert-ai-failure', label: 'AI Failure Alert', icon: Bot },
    ],
  },
  {
    id: 'system-controls',
    label: 'System Controls',
    icon: Settings,
    children: [
      { id: 'ctrl-ticket-rules', label: 'Ticket Rules', icon: FileText },
      { id: 'ctrl-auto-assign', label: 'Auto-Assignment Rules', icon: Zap },
      { id: 'ctrl-sla-timers', label: 'SLA Timers', icon: Timer },
      { id: 'ctrl-working-hours', label: 'Working Hours', icon: Clock },
      { id: 'ctrl-holidays', label: 'Holiday Rules', icon: Moon },
      { id: 'ctrl-emergency', label: 'Emergency Mode', icon: Siren },
    ],
  },
];

interface CustomerSupportSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onBack?: () => void;
}

export function CustomerSupportSidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  onBack,
}: CustomerSupportSidebarProps) {
  const [openMenus, setOpenMenus] = useState<string[]>(['dashboard', 'tickets']);

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev =>
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  const handleSectionClick = (sectionId: string, label: string) => {
    onSectionChange(sectionId);
    toast.success(`Loading: ${label}`, { duration: 1500 });
  };

  const handleBack = () => {
    onBack?.();
  };

  const isActive = (id: string) => activeSection === id;
  const isParentActive = (item: MenuItem) =>
    item.children?.some(child => activeSection === child.id);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 280 }}
      className="h-full bg-slate-900/95 border-r border-slate-700/50 flex flex-col shrink-0"
    >
      {/* Back Button */}
      {!collapsed && onBack && (
        <div className="p-2 border-b border-slate-700/50">
          <motion.button
            onClick={handleBack}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Control Panel</span>
          </motion.button>
        </div>
      )}

      {/* Header */}
      <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-white truncate">Customer Support</p>
              <p className="text-[10px] text-slate-400">Helpdesk & SLA Control</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto">
            <Headphones className="w-5 h-5 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 text-slate-400 hover:text-white flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {sidebarMenu.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus.includes(item.id);
            const parentActive = isParentActive(item);

            if (collapsed) {
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => hasChildren ? toggleMenu(item.id) : handleSectionClick(item.id, item.label)}
                      className={cn(
                        "w-full justify-center px-2 h-10 relative",
                        parentActive || isActive(item.id)
                          ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 border-slate-700">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Collapsible
                key={item.id}
                open={isOpen}
                onOpenChange={() => hasChildren && toggleMenu(item.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 h-9 px-3 relative",
                      parentActive || isActive(item.id)
                        ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    )}
                    onClick={() => !hasChildren && handleSectionClick(item.id, item.label)}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge className={cn(
                        "ml-auto text-[10px] px-1.5 py-0",
                        item.badgeColor === 'red' 
                          ? "bg-red-500/20 text-red-400"
                          : "bg-amber-500/20 text-amber-400"
                      )}>
                        {item.badge}
                      </Badge>
                    )}
                    {hasChildren && (
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform flex-shrink-0",
                        isOpen && "rotate-180"
                      )} />
                    )}
                  </Button>
                </CollapsibleTrigger>

                {hasChildren && (
                  <CollapsibleContent>
                    <div className="ml-4 pl-2 border-l border-slate-700/50 space-y-0.5 mt-1">
                      {item.children!.map((child) => (
                        <Button
                          key={child.id}
                          variant="ghost"
                          onClick={() => handleSectionClick(child.id, child.label)}
                          className={cn(
                            "w-full justify-start gap-2 h-8 px-2 text-xs",
                            isActive(child.id)
                              ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                              : "text-slate-500 hover:text-white hover:bg-slate-800/50"
                          )}
                        >
                          <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate flex-1 text-left">{child.label}</span>
                          {child.badge && (
                            <Badge className={cn(
                              "ml-auto text-[9px] px-1 py-0",
                              child.badgeColor === 'red'
                                ? "bg-red-500/20 text-red-400"
                                : "bg-amber-500/20 text-amber-400"
                            )}>
                              {child.badge}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                )}
              </Collapsible>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-700/50">
          <p className="text-[10px] text-slate-500 text-center">
            Customer Support & Helpdesk Manager
          </p>
        </div>
      )}
    </motion.aside>
  );
}

export default CustomerSupportSidebar;
