// Unified Franchise Dashboard
// Single dashboard with Shopify-style layout
// All sections as tabs (no route changes)

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../styles/premium-7d-theme.css';
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Users,
  Target,
  Wallet,
  MessageSquare,
  Settings,
  ChevronRight,
  Bell,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useFranchiseDashboardService } from '../hooks/useFranchiseDashboardService';

// Sections
import OverviewSection from './franchise/sections/OverviewSection';
import MarketplaceSection from './franchise/sections/MarketplaceSection';
import OrdersSection from './franchise/sections/OrdersSection';
import LeadsSEOSection from './franchise/sections/LeadsSEOSection';
import CustomersSection from './franchise/sections/CustomersSection';
import TeamSection from './franchise/sections/TeamSection';
import WalletBillingSection from './franchise/sections/WalletBillingSection';
import SupportSection from './franchise/sections/SupportSection';
import SettingsSection from './franchise/sections/SettingsSection';

type SectionType = 'overview' | 'marketplace' | 'orders' | 'leads-seo' | 'customers' | 'team' | 'wallet-billing' | 'support' | 'settings';

const SECTIONS = [
  { id: 'overview' as SectionType, label: 'Overview', icon: LayoutDashboard },
  { id: 'marketplace' as SectionType, label: 'Marketplace', icon: ShoppingBag },
  { id: 'orders' as SectionType, label: 'Orders', icon: ClipboardList },
  { id: 'leads-seo' as SectionType, label: 'Leads + SEO', icon: Target },
  { id: 'customers' as SectionType, label: 'Customers', icon: Users },
  { id: 'team' as SectionType, label: 'Team', icon: Users },
  { id: 'wallet-billing' as SectionType, label: 'Wallet + Billing', icon: Wallet },
  { id: 'support' as SectionType, label: 'Support', icon: MessageSquare },
  { id: 'settings' as SectionType, label: 'Settings', icon: Settings },
];

const FranchiseDashboardUnified = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Get franchise ID from URL or context
  const franchiseId = 'current-franchise-id'; // TODO: Get from params/context

  const {
    loading,
    error,
    dashboardData,
    statistics,
    loadDashboardData,
  } = useFranchiseDashboardService(franchiseId);

  // Deep-link tabs support
  useEffect(() => {
    const hash = location.hash.replace('#', '') as SectionType;
    if (hash && SECTIONS.some(s => s.id === hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  // State persistence (last tab/filter)
  useEffect(() => {
    const savedSection = localStorage.getItem('franchise-dashboard-last-section') as SectionType;
    if (savedSection && SECTIONS.some(s => s.id === savedSection)) {
      setActiveSection(savedSection);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('franchise-dashboard-last-section', activeSection);
  }, [activeSection]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + 1-9 for quick section navigation
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < SECTIONS.length) {
          e.preventDefault();
          setActiveSection(SECTIONS[index].id);
        }
      }
      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
      // Ctrl/Cmd + / to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        (document.querySelector('input[type="text"]') as HTMLElement)?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSectionChange = (sectionId: SectionType) => {
    setActiveSection(sectionId);
    // No route change - just state change
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection statistics={statistics} dashboardData={dashboardData} />;
      case 'marketplace':
        return <MarketplaceSection />;
      case 'orders':
        return <OrdersSection />;
      case 'leads-seo':
        return <LeadsSEOSection />;
      case 'customers':
        return <CustomersSection />;
      case 'team':
        return <TeamSection />;
      case 'wallet-billing':
        return <WalletBillingSection />;
      case 'support':
        return <SupportSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection statistics={statistics} dashboardData={dashboardData} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={loadDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold text-foreground">Franchise Dashboard</h1>
            <p className="text-xs text-muted-foreground">Unified Control Center</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                  {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">F</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Franchise Admin</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {SECTIONS.find((s) => s.id === activeSection)?.label}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {statistics?.totalSales || 0} sales • ${statistics?.totalRevenue || 0} revenue
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>

              {/* Quick Actions */}
              <Button
                onClick={() => navigate('/boss')}
                className="bg-primary text-primary-foreground"
              >
                Boss Panel
              </Button>
            </div>
          </div>
        </header>

        {/* Section Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default FranchiseDashboardUnified;
