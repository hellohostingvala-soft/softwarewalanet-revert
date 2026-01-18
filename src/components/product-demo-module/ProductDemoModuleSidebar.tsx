/**
 * PRODUCT & DEMO MODULE SIDEBAR
 * 10-item sidebar with Back to Boss button
 * 
 * SINGLE-CONTEXT ENFORCEMENT:
 * - Only renders when activeContext === 'module' AND category === 'product-demo'
 * - Back button triggers full context switch to Boss
 */
import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, Monitor, Plus, PlusCircle,
  DollarSign, Key, Bug, BarChart3, Archive, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebarStore, useShouldRenderSidebar } from '@/stores/sidebarStore';

export type ProductDemoSection = 
  | 'dashboard'
  | 'all-products'
  | 'demo-manager'
  | 'create-product'
  | 'create-demo'
  | 'pricing-plans'
  | 'license-domain'
  | 'demo-issues'
  | 'performance'
  | 'archive';

interface ProductDemoModuleSidebarProps {
  activeSection: ProductDemoSection;
  onSectionChange: (section: ProductDemoSection) => void;
  onBack?: () => void;
}

const menuItems: { id: ProductDemoSection; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'all-products', label: 'All Products', icon: Package },
  { id: 'demo-manager', label: 'Demo Manager', icon: Monitor },
  { id: 'create-product', label: 'Create Product', icon: Plus },
  { id: 'create-demo', label: 'Create Demo', icon: PlusCircle },
  { id: 'pricing-plans', label: 'Pricing & Plans', icon: DollarSign },
  { id: 'license-domain', label: 'License & Domain', icon: Key },
  { id: 'demo-issues', label: 'Demo Issues', icon: Bug },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'archive', label: 'Archive', icon: Archive },
];

export const ProductDemoModuleSidebar: React.FC<ProductDemoModuleSidebarProps> = ({
  activeSection,
  onSectionChange,
  onBack,
}) => {
  // SINGLE-CONTEXT ENFORCEMENT: Use store for clean context transitions
  const { exitToGlobal } = useSidebarStore();
  
  // Use dedicated hook for strict visibility check
  const shouldRender = useShouldRenderSidebar('category', 'product-demo');
  
  // Handle back navigation - triggers FULL context switch to Boss
  const handleBack = () => {
    exitToGlobal();
    onBack?.();
  };
  
  // STRICT ISOLATION: Only render when in Module context with matching category
  if (!shouldRender) {
    return null;
  }

  // ===== LOCKED COLORS: Dark Navy Blue Sidebar (matches Control Panel) =====
  const SIDEBAR_COLORS = {
    bg: '#0a1628',
    bgGradient: 'linear-gradient(180deg, #0a1628 0%, #0d1b2a 100%)',
    border: '#1e3a5f',
    activeHighlight: '#2563eb',
    hoverBg: 'rgba(37, 99, 235, 0.15)',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    iconColor: '#60a5fa',
  };
  
  return (
    <div 
      className="w-56 flex flex-col h-full shrink-0"
      style={{ 
        background: SIDEBAR_COLORS.bgGradient, 
        borderRight: `1px solid ${SIDEBAR_COLORS.border}` 
      }}
    >
      {/* Back Button */}
      <div className="p-2" style={{ borderBottom: `1px solid ${SIDEBAR_COLORS.border}` }}>
        <motion.button
          onClick={handleBack}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: SIDEBAR_COLORS.textMuted }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Control Panel</span>
        </motion.button>
      </div>
      
      <div className="p-4" style={{ borderBottom: `1px solid ${SIDEBAR_COLORS.border}` }}>
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: SIDEBAR_COLORS.activeHighlight }}
          >
            <Package className="w-4 h-4" style={{ color: SIDEBAR_COLORS.text }} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: SIDEBAR_COLORS.text }}>Product & Demo</h2>
            <p className="text-[10px]" style={{ color: SIDEBAR_COLORS.textMuted }}>Enterprise Manager</p>
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
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
                style={{
                  background: isActive ? SIDEBAR_COLORS.activeHighlight : 'transparent',
                  color: isActive ? SIDEBAR_COLORS.text : SIDEBAR_COLORS.textMuted,
                }}
              >
                <Icon className="w-4 h-4" style={{ color: isActive ? SIDEBAR_COLORS.text : SIDEBAR_COLORS.iconColor }} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-3" style={{ borderTop: `1px solid ${SIDEBAR_COLORS.border}` }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: SIDEBAR_COLORS.textMuted }}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Active</span>
        </div>
      </div>
    </div>
  );
};