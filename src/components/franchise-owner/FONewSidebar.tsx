/**
 * FRANCHISE OWNER SIDEBAR
 * 10 Sections as specified - NO SCROLL, FIXED
 */

import React from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Target,
  Users,
  FileText,
  Wallet,
  HeadphonesIcon,
  Scale,
  Settings,
} from 'lucide-react';
import { FOSection } from './FranchiseOwnerTypes';

interface FONewSidebarProps {
  activeSection: FOSection;
  onSectionChange: (section: FOSection) => void;
}

const SIDEBAR_ITEMS: { id: FOSection; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'my_orders', label: 'My Orders', icon: ClipboardList },
  { id: 'leads_seo', label: 'Leads & SEO', icon: Target },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'support_assist', label: 'Support / Assist', icon: HeadphonesIcon },
  { id: 'legal', label: 'Legal', icon: Scale },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function FONewSidebar({ activeSection, onSectionChange }: FONewSidebarProps) {
  return (
    <aside className="w-64 bg-card border-r border-border h-full flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Franchise Owner</h2>
            <p className="text-xs text-muted-foreground">Mumbai Region</p>
          </div>
        </div>
      </div>

      {/* Navigation - FIXED, NO SCROLL */}
      <nav className="flex-1 p-3 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-muted-foreground">System Active</span>
        </div>
      </div>
    </aside>
  );
}
