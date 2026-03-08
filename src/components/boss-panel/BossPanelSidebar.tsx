import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Activity, Network, Users, Shield, Boxes,
  Package, DollarSign, FileSearch, Lock, Settings, ChevronDown,
  ChevronRight, Code2, Server, Brain, Store, ChevronLeft,
  ChevronLeftCircle, Zap, BarChart3, AlertTriangle, FileText,
  Bell, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BossPanelSection } from './BossPanelLayout';

interface BossPanelSidebarProps {
  activeSection: BossPanelSection;
  onSectionChange: (section: BossPanelSection) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

// ─── ENTERPRISE DARK SIDEBAR TOKENS ──────────────────────────
const NAV = {
  bg:         'hsl(222, 47%, 8%)',
  border:     'hsla(215, 28%, 30%, 0.3)',
  groupLabel: 'hsl(215, 20%, 50%)',
  text:       'hsl(210, 20%, 70%)',
  textActive: 'hsl(217, 91%, 60%)',
  textHover:  'hsl(210, 40%, 96%)',
  activeBg:   'hsla(217, 91%, 60%, 0.1)',
  activeBar:  'hsl(217, 91%, 60%)',
  hoverBg:    'hsla(215, 100%, 60%, 0.06)',
  iconDim:    'hsl(215, 20%, 45%)',
  badge:      'hsl(346, 77%, 49%)',
  badgeBg:    'hsla(346, 77%, 49%, 0.15)',
  green:      'hsl(160, 84%, 39%)',
  greenBg:    'hsla(160, 84%, 39%, 0.12)',
};

interface MenuGroup {
  label: string;
  items: { id: BossPanelSection; label: string; icon: React.ElementType; badge?: number; status?: 'live' | 'alert' }[];
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'live-activity', label: 'Live Activity', icon: Activity, status: 'live' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { id: 'hierarchy', label: 'Hierarchy Control', icon: Network },
      { id: 'super-admins', label: 'Super Admins', icon: Users },
      { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'modules', label: 'System Modules', icon: Boxes },
      { id: 'products', label: 'Product & Demo', icon: Package },
      { id: 'marketplace-manager', label: 'Marketplace', icon: Store },
      { id: 'server-hosting', label: 'CodeLab Cloud', icon: Server },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'vala-ai', label: 'VALA AI', icon: Brain },
      { id: 'aira', label: 'AIRA', icon: Zap },
      { id: 'codepilot', label: 'CodePilot', icon: Code2 },
    ],
  },
  {
    label: 'Distribution',
    items: [
      { id: 'reseller-dashboard', label: 'Reseller Network', icon: TrendingUp },
      { id: 'franchise-dashboard', label: 'Franchise Ops', icon: Network },
    ],
  },
  {
    label: 'Finance & Security',
    items: [
      { id: 'revenue', label: 'Revenue Snapshot', icon: DollarSign },
      { id: 'audit', label: 'Audit & Blackbox', icon: FileSearch },
      { id: 'security', label: 'Security & Legal', icon: Lock },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function BossPanelSidebar({ activeSection, onSectionChange, collapsed, onCollapsedChange }: BossPanelSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const activeGroup = menuGroups.find(g => g.items.some(i => i.id === activeSection));
    const initial = new Set<string>();
    if (activeGroup) initial.add(activeGroup.label);
    initial.add('Overview');
    return initial;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <aside
      className="fixed left-0 z-40 flex flex-col transition-all duration-300"
      style={{ 
        top: '48px',
        height: 'calc(100vh - 48px)',
        width: collapsed ? '56px' : '260px',
        background: NAV.bg,
        borderRight: `1px solid ${NAV.border}`,
      }}
    >
      {/* Collapse toggle */}
      <div className="flex items-center justify-end px-2 py-2" style={{ borderBottom: `1px solid ${NAV.border}` }}>
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="w-7 h-7 rounded-md flex items-center justify-center transition-all"
          style={{ color: NAV.iconDim }}
          onMouseEnter={(e) => { e.currentTarget.style.background = NAV.hoverBg; e.currentTarget.style.color = NAV.textHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAV.iconDim; }}
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'thin', scrollbarColor: `${NAV.border} transparent` }}>
        {menuGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.label);
          const hasActive = group.items.some(i => i.id === activeSection);

          if (collapsed) {
            return (
              <div key={group.label} className="px-1.5 mb-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      title={item.label}
                      className="relative w-full flex items-center justify-center py-2.5 rounded-lg mb-0.5 transition-all duration-200"
                      style={{
                        background: isActive ? NAV.activeBg : 'transparent',
                        borderLeft: isActive ? `3px solid ${NAV.activeBar}` : '3px solid transparent',
                      }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = NAV.hoverBg; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = isActive ? NAV.activeBg : 'transparent'; }}
                    >
                      <Icon className="w-4 h-4" style={{ color: isActive ? NAV.textActive : NAV.iconDim }} />
                      {item.status === 'live' && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse" style={{ background: NAV.green }} />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={group.label} className="mb-1">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors"
                style={{ color: NAV.groupLabel }}
                onMouseEnter={(e) => (e.currentTarget.style.color = NAV.textHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = NAV.groupLabel)}
              >
                <span>{group.label}</span>
                <motion.div animate={{ rotate: isExpanded ? 0 : -90 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
              </button>

              {/* Group Items */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onSectionChange(item.id)}
                          className="w-full flex items-center gap-3 pl-5 pr-3 py-2 text-[13px] transition-all duration-200 relative"
                          style={{
                            background: isActive ? NAV.activeBg : 'transparent',
                            color: isActive ? NAV.textActive : NAV.text,
                            fontWeight: isActive ? 600 : 400,
                            borderLeft: isActive ? `3px solid ${NAV.activeBar}` : '3px solid transparent',
                          }}
                          onMouseEnter={(e) => { 
                            if (!isActive) {
                              e.currentTarget.style.background = NAV.hoverBg; 
                              e.currentTarget.style.color = NAV.textHover;
                            }
                          }}
                          onMouseLeave={(e) => { 
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = NAV.text;
                            }
                          }}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? NAV.textActive : NAV.iconDim }} />
                          <span className="truncate">{item.label}</span>
                          {item.status === 'live' && (
                            <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold"
                              style={{ background: NAV.greenBg, color: NAV.green }}>
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: NAV.green }} />
                              LIVE
                            </span>
                          )}
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: NAV.badgeBg, color: NAV.badge }}>{item.badge}</span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3" style={{ borderTop: `1px solid ${NAV.border}` }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: NAV.green }} />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: NAV.groupLabel }}>
              Software Vala • Enterprise
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
