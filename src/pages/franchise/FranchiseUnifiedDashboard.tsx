// Franchise Unified Dashboard
// SINGLE ENTRY POINT - Shopify-style layout with Sidebar + Header + Dynamic Sections
// All sections via tabs/sections, NOT new pages

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Target,
  Users,
  Wallet,
  FileText,
  MessageSquare,
  Settings,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  User,
  RefreshCw,
  X,
  Menu,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import FranchiseHeader from '@/components/franchise/FranchiseHeader';
import OverviewSection from './sections/OverviewSection';
import MarketplaceSection from './sections/MarketplaceSection';
import OrdersSection from './sections/OrdersSection';
import LeadsSEOSection from './sections/LeadsSEOSection';
import CustomersSection from './sections/CustomersSection';
import TeamSection from './sections/TeamSection';
import WalletBillingSection from './sections/WalletBillingSection';
import SupportSection from './sections/SupportSection';
import SettingsSection from './sections/SettingsSection';
import '../../../styles/premium-7d-theme.css';

type SectionType = 'overview' | 'marketplace' | 'orders' | 'leads-seo' | 'customers' | 'team' | 'wallet-billing' | 'support' | 'settings';

interface SidebarItem {
  id: SectionType;
  label: string;
  icon: any;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'leads-seo', label: 'Leads + SEO', icon: Target },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'wallet-billing', label: 'Wallet + Billing', icon: Wallet },
  { id: 'support', label: 'Support', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const FranchiseUnifiedDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [notifications, setNotifications] = useState(5);
  const [loading, setLoading] = useState(true);

  // Deep-link support
  useEffect(() => {
    const hash = location.hash.replace('#', '') as SectionType;
    if (hash && sidebarItems.find(item => item.id === hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  // State persistence
  useEffect(() => {
    const savedSection = localStorage.getItem('franchise-dashboard-section') as SectionType;
    if (savedSection) {
      setActiveSection(savedSection);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('franchise-dashboard-section', activeSection);
  }, [activeSection]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSectionChange = (section: SectionType) => {
    setActiveSection(section);
    // Update URL hash for deep-linking
    window.location.hash = section;
  };

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Refreshed',
        description: 'Dashboard data updated',
      });
    }, 500);
  }, []);

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    toast({
      title: autoRefresh ? 'Auto-refresh Disabled' : 'Auto-refresh Enabled',
      description: autoRefresh ? 'Updates will no longer be automatic' : 'Updates will be automatic',
    });
  };

  const handleLogout = () => {
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
    navigate('/login');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
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
        return <OverviewSection />;
    }
  };

  if (loading && activeSection === 'overview') {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: sidebarOpen ? 280 : 0 }}
        animate={{ width: sidebarOpen ? 280 : 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-[#1A2236] border-r border-indigo-500/20 overflow-hidden ${sidebarOpen ? '' : 'w-0'}`}
      >
        <div className="w-280">
          {/* Logo */}
          <div className="p-6 border-b border-indigo-500/20">
            <h1 className="text-xl font-bold text-white">Franchise Hub</h1>
            <p className="text-xs text-gray-400 mt-1">Los Angeles, CA</p>
          </div>

          {/* Navigation */}
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-4 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-gray-400 hover:bg-indigo-500/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* User Profile */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-500/20 bg-[#1A2236]">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/avatars/franchise.png" />
                <AvatarFallback className="bg-indigo-500/20 text-indigo-400">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">John Doe</p>
                <p className="text-xs text-gray-400 truncate">franchise_owner</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#1A2236] border-b border-indigo-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="global-search"
                  type="text"
                  placeholder="Search... (⌘K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 bg-[#0B0F1A] border-indigo-500/20 text-white placeholder-gray-400 pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white h-6 w-6"
                  >
                    <XCircle className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className="text-gray-400 hover:text-white"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleAutoRefresh}
                className={`text-gray-400 hover:text-white ${autoRefresh ? 'text-green-400' : ''}`}
              >
                <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
              </Button>
              <div className="relative">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Bell className="w-5 h-5" />
                </Button>
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs">
                    {notifications}
                  </Badge>
                )}
              </div>
              <Separator orientation="vertical" className="h-8 bg-indigo-500/20" />
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dynamic Section Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default FranchiseUnifiedDashboard;
