import React, { useState } from 'react';
import { 
  Store, 
  ShoppingCart, 
  Wallet, 
  MessageSquare, 
  Settings,
  Package,
  LayoutGrid,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  TrendingUp,
  Brain,
  Activity,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  History,
  Lock,
  Unlock,
  ToggleRight,
  Key,
  Gauge,
  Globe,
  Boxes,
  Wand2,
  Bug,
  ArrowUpCircle,
  PlayCircle,
  Cpu,
  Lightbulb,
  ShieldCheck,
  MousePointer,
  Sparkles,
  CreditCard,
  RefreshCw,
  Receipt,
  Milestone,
  Eye,
  Search,
  Tag,
  BarChart3,
  Ticket,
  AlertTriangle,
  Headphones,
  Percent,
  FileCheck,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MMFullSidebarProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: MenuItem[];
  badge?: string;
  badgeColor?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    children: [
      { id: 'overview', label: 'Overview', icon: LayoutGrid },
      { id: 'live-metrics', label: 'Live Metrics', icon: TrendingUp },
      { id: 'ai-insights', label: 'AI Insights', icon: Brain },
      { id: 'marketplace-health', label: 'Marketplace Health', icon: Activity },
    ]
  },
  {
    id: 'product-management',
    label: 'Product Management',
    icon: Package,
    children: [
      { id: 'all-products', label: 'All Products', icon: Boxes },
      { id: 'add-product', label: 'Add New Product', icon: Plus },
      { id: 'product-drafts', label: 'Product Drafts', icon: FileText },
      { id: 'pending-approval', label: 'Pending Approval', icon: Clock, badge: '3', badgeColor: 'bg-amber-500' },
      { id: 'approved-products', label: 'Approved Products', icon: CheckCircle },
      { id: 'rejected-products', label: 'Rejected Products', icon: XCircle },
      { id: 'product-versioning', label: 'Product Versioning', icon: History },
      { id: 'product-status', label: 'Product Status', icon: ToggleRight },
    ]
  },
  {
    id: 'demo-management',
    label: 'Demo Management',
    icon: PlayCircle,
    badge: 'AI',
    badgeColor: 'bg-purple-500',
    children: [
      { id: 'all-demos', label: 'All Demos', icon: Boxes },
      { id: 'demo-builder', label: 'Demo Builder (AI)', icon: Wand2 },
      { id: 'demo-completion', label: 'Demo Completion Status', icon: CheckCircle },
      { id: 'demo-upgrade', label: 'Demo Upgrade Queue', icon: ArrowUpCircle },
      { id: 'demo-bugs', label: 'Demo Bug Tracker', icon: Bug },
      { id: 'demo-approval', label: 'Demo Approval Flow', icon: ShieldCheck },
    ]
  },
  {
    id: 'vala-ai',
    label: 'VALA AI Dashboard',
    icon: Cpu,
    badge: 'CORE',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    children: [
      { id: 'ai-prompt-manager', label: 'AI Prompt Manager', icon: MessageSquare },
      { id: 'ai-demo-generator', label: 'AI Demo Generator', icon: Wand2 },
      { id: 'ai-feature-suggestion', label: 'AI Feature Suggestion', icon: Lightbulb },
      { id: 'ai-bug-detection', label: 'AI Bug Detection', icon: Bug },
      { id: 'ai-ui-completion', label: 'AI UI Completion', icon: LayoutGrid },
      { id: 'ai-flow-validation', label: 'AI Flow Validation', icon: Activity },
      { id: 'ai-button-testing', label: 'AI Button Testing', icon: MousePointer },
      { id: 'ai-compliance', label: 'AI Compliance Checker', icon: ShieldCheck },
    ]
  },
  {
    id: 'orders-subscriptions',
    label: 'Orders & Subscriptions',
    icon: ShoppingCart,
    children: [
      { id: 'all-orders', label: 'All Orders', icon: ShoppingCart },
      { id: 'pending-orders', label: 'Pending Orders', icon: Clock, badge: '2', badgeColor: 'bg-amber-500' },
      { id: 'active-subscriptions', label: 'Active Subscriptions', icon: RefreshCw },
      { id: 'expired-subscriptions', label: 'Expired Subscriptions', icon: XCircle },
      { id: 'upgrade-requests', label: 'Upgrade Requests', icon: ArrowUpCircle },
      { id: 'renewal-queue', label: 'Renewal Queue', icon: Clock },
    ]
  },
  {
    id: 'wallet-billing',
    label: 'Wallet & Billing',
    icon: Wallet,
    children: [
      { id: 'wallet-balance', label: 'Wallet Balance', icon: Wallet },
      { id: 'add-money', label: 'Add Money', icon: Plus },
      { id: 'transaction-history', label: 'Transaction History', icon: Receipt },
      { id: 'platform-charges', label: 'Platform Charges', icon: Percent },
      { id: 'developer-payouts', label: 'Developer Payouts', icon: CreditCard },
      { id: 'refund-processing', label: 'Refund Processing', icon: RefreshCw },
    ]
  },
  {
    id: 'development-pipeline',
    label: 'Development Pipeline',
    icon: Package,
    children: [
      { id: 'in-development', label: 'Products in Development', icon: Package },
      { id: 'assigned-developers', label: 'Assigned Developers', icon: Eye },
      { id: 'milestone-tracker', label: 'Milestone Tracker', icon: Milestone },
      { id: 'approval-gate', label: 'Approval Gate', icon: ShieldCheck },
      { id: 'delivery-status', label: 'Delivery Status', icon: CheckCircle },
    ]
  },
  {
    id: 'marketplace-visibility',
    label: 'Marketplace Visibility',
    icon: Eye,
    children: [
      { id: 'public-marketplace', label: 'Public Marketplace View', icon: Globe },
      { id: 'category-management', label: 'Category Management', icon: Tag },
      { id: 'subcategory', label: 'Sub Category', icon: Tag },
      { id: 'micro-category', label: 'Micro Category', icon: Tag },
      { id: 'seo-control', label: 'SEO Meta Control', icon: Search },
      { id: 'product-ranking', label: 'Product Ranking Rules', icon: BarChart3 },
    ]
  },
  {
    id: 'support-issues',
    label: 'Support & Issues',
    icon: Headphones,
    children: [
      { id: 'marketplace-tickets', label: 'Marketplace Tickets', icon: Ticket },
      { id: 'product-issues', label: 'Product Issues', icon: AlertTriangle },
      { id: 'demo-issues', label: 'Demo Issues', icon: Bug },
      { id: 'payment-issues', label: 'Payment Issues', icon: CreditCard },
      { id: 'ai-support', label: 'AI Support Assistant', icon: MessageSquare },
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    children: [
      { id: 'marketplace-rules', label: 'Marketplace Rules', icon: FileCheck },
      { id: 'commission-engine', label: 'Commission Engine', icon: Percent },
      { id: 'tax-rules', label: 'Tax Rules', icon: Receipt },
      { id: 'country-availability', label: 'Country Availability', icon: MapPin },
      { id: 'legal-compliance', label: 'Legal & Compliance', icon: ShieldCheck },
      { id: 'lock-system', label: 'Lock System', icon: Lock },
    ]
  },
];

export function MMFullSidebar({ activeScreen, onScreenChange }: MMFullSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleItemClick = (item: MenuItem, hasChildren: boolean) => {
    if (hasChildren) {
      toggleSection(item.id);
    } else {
      onScreenChange(item.id);
    }
  };

  const isItemActive = (itemId: string, children?: MenuItem[]) => {
    if (activeScreen === itemId) return true;
    if (children) {
      return children.some(child => child.id === activeScreen);
    }
    return false;
  };

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white">Marketplace Manager</h2>
            <p className="text-xs text-slate-400">Software Vala</p>
          </div>
        </div>
        
        {/* Running Status */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400">RUNNING</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-purple-400" />
            <span className="text-purple-400">AI: ACTIVE</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections.includes(item.id);
            const isActive = isItemActive(item.id, item.children);
            
            return (
              <div key={item.id}>
                {/* Parent Item */}
                <button
                  onClick={() => handleItemClick(item, hasChildren)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all",
                    isActive
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold text-white",
                        item.badgeColor
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {hasChildren && (
                    isExpanded 
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {/* Children Items */}
                {hasChildren && isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
                    {item.children!.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = activeScreen === child.id;
                      
                      return (
                        <button
                          key={child.id}
                          onClick={() => onScreenChange(child.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all text-sm",
                            isChildActive
                              ? "bg-purple-500/10 text-purple-400" 
                              : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <ChildIcon className="h-3.5 w-3.5" />
                            <span>{child.label}</span>
                          </div>
                          {child.badge && (
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white",
                              child.badgeColor
                            )}>
                              {child.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Wallet Quick View */}
      <div className="p-4 border-t border-slate-700">
        <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">Wallet Balance</span>
          </div>
          <p className="text-xl font-bold text-white">₹45,230</p>
          <p className="text-xs text-slate-400 mt-1">Locked: ₹5,000</p>
        </div>
      </div>
    </div>
  );
}
