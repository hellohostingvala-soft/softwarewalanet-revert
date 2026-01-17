/**
 * SIDEBAR VISIBILITY GUARD
 * 
 * Wraps sidebar components to enforce single-sidebar rule
 * Only renders children if this sidebar type is currently active
 */

import React from 'react';
import { useSidebarStore, SidebarType, CategorySidebarId } from '@/stores/sidebarStore';
import { AnimatePresence, motion } from 'framer-motion';

interface SidebarVisibilityGuardProps {
  type: SidebarType;
  categoryId?: CategorySidebarId;
  children: React.ReactNode;
  className?: string;
}

export function SidebarVisibilityGuard({
  type,
  categoryId,
  children,
  className,
}: SidebarVisibilityGuardProps) {
  const { activeSidebar, activeCategorySidebar } = useSidebarStore();
  
  // Determine if this sidebar should be visible
  const isVisible = React.useMemo(() => {
    if (type === 'global') {
      return activeSidebar === 'global';
    }
    
    if (type === 'category' && categoryId) {
      return activeSidebar === 'category' && activeCategorySidebar === categoryId;
    }
    
    return false;
  }, [type, categoryId, activeSidebar, activeCategorySidebar]);
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={`sidebar-${type}-${categoryId || 'global'}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to get sidebar navigation handlers
 */
export function useSidebarNavigation() {
  const { 
    showGlobalSidebar, 
    showCategorySidebar, 
    exitToGlobal, 
    enterCategory,
    activeSidebar,
    activeCategorySidebar,
  } = useSidebarStore();
  
  const navigateToCategory = React.useCallback((categoryId: CategorySidebarId) => {
    if (categoryId) {
      enterCategory(categoryId);
    }
  }, [enterCategory]);
  
  const navigateToGlobal = React.useCallback(() => {
    exitToGlobal();
  }, [exitToGlobal]);
  
  const isInCategory = activeSidebar === 'category';
  const currentCategory = activeCategorySidebar;
  
  return {
    navigateToCategory,
    navigateToGlobal,
    isInCategory,
    currentCategory,
    showGlobalSidebar,
    showCategorySidebar,
  };
}
