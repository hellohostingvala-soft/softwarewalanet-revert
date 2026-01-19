/**
 * Customer Support Manager View
 * Main view component with hierarchical sidebar
 */
import { useState, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import CustomerSupportSidebar from "@/components/customer-support/CustomerSupportSidebar";
import CustomerSupportDashboardContent from "@/components/customer-support/CustomerSupportDashboardContent";

const CustomerSupportManagerView = () => {
  const [activeSection, setActiveSection] = useState<string>("dashboard-overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleBack = useCallback(() => {
    window.location.assign("/super-admin-system/role-switch?role=boss_owner");
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-full w-full">
        <CustomerSupportSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onBack={handleBack}
        />
        <CustomerSupportDashboardContent activeSection={activeSection} />
      </div>
    </TooltipProvider>
  );
};

export default CustomerSupportManagerView;
