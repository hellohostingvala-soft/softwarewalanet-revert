// Franchise Dashboard
// Main dashboard with clickable cards and region-based RBAC

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Target,
  ClipboardList,
  PlayCircle,
  Wallet,
  FileText,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import FranchiseHeader from '@/components/franchise/FranchiseHeader';
import franchiseRBACService from '@/franchise/franchiseRBACService';
import '../../../styles/premium-7d-theme.css';

interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  icon: any;
  route: string;
  filter?: string;
  color: string;
  trend?: string;
}

const FranchiseDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    // Check region access using franchiseRBACService
    const user = franchiseRBACService.getFranchiseUser('current-user-id');
    if (!user) {
      toast({
        title: "Access Denied",
        description: "You don't have franchise access",
        variant: "destructive",
      });
      return;
    }

    // Load dashboard data
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData();
    toast({
      title: "Refreshed",
      description: "Dashboard data updated",
    });
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    toast({
      title: autoRefresh ? "Auto-refresh Disabled" : "Auto-refresh Enabled",
      description: autoRefresh ? "Updates will no longer be automatic" : "Updates will be automatic",
    });
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCards([
        {
          id: 'total-products',
          title: 'Total Products',
          value: 156,
          icon: ShoppingBag,
          route: '/franchise/marketplace',
          filter: 'filter=active',
          color: 'from-blue-500 to-cyan-500',
          trend: '+12%',
        },
        {
          id: 'total-leads',
          title: 'Total Leads',
          value: 89,
          icon: Target,
          route: '/franchise/leads-seo',
          filter: 'type=leads',
          color: 'from-purple-500 to-pink-500',
          trend: '+8%',
        },
        {
          id: 'pending-orders',
          title: 'Pending Orders',
          value: 23,
          icon: ClipboardList,
          route: '/franchise/orders',
          filter: 'status=pending',
          color: 'from-orange-500 to-yellow-500',
          trend: '+5%',
        },
        {
          id: 'running-projects',
          title: 'Running Projects',
          value: 12,
          icon: PlayCircle,
          route: '/franchise/orders',
          filter: 'status=running',
          color: 'from-green-500 to-emerald-500',
          trend: '+3%',
        },
        {
          id: 'wallet-balance',
          title: 'Wallet Balance',
          value: '$12,450',
          icon: Wallet,
          route: '/franchise/wallet',
          color: 'from-indigo-500 to-purple-500',
          trend: '+15%',
        },
        {
          id: 'pending-invoices',
          title: 'Pending Invoices',
          value: 7,
          icon: FileText,
          route: '/franchise/invoices',
          filter: 'status=pending',
          color: 'from-red-500 to-orange-500',
          trend: '+2%',
        },
        {
          id: 'support-tickets',
          title: 'Support Tickets',
          value: 5,
          icon: MessageSquare,
          route: '/franchise/support',
          color: 'from-teal-500 to-cyan-500',
          trend: '-1%',
        },
        {
          id: 'promises',
          title: 'Promises',
          value: 18,
          icon: CheckCircle,
          route: '/franchise/promises',
          color: 'from-pink-500 to-rose-500',
          trend: '+10%',
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card: DashboardCard) => {
    const routeWithFilter = card.filter ? `${card.route}?${card.filter}` : card.route;
    navigate(routeWithFilter);
  };

  if (loading) {
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
    <div className="min-h-screen bg-[#0B0F1A]">
      {/* Header */}
      <FranchiseHeader
        onRefresh={handleRefresh}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={handleToggleAutoRefresh}
      />

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Franchise Dashboard</h1>
          <p className="text-gray-400">Region: Los Angeles, CA, USA</p>
        </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleCardClick(card)}
              className="cursor-pointer"
            >
              <Card className="bg-[#1A2236] border border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {card.trend && (
                      <Badge className={card.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                        {card.trend}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1A2236] border border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">24</p>
            <p className="text-gray-400 text-sm">3 sales, 2 support, 19 others</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A2236] border border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">$45,230</p>
            <p className="text-gray-400 text-sm">+18% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A2236] border border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              SEO Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">#3</p>
            <p className="text-gray-400 text-sm">Local keywords: 15</p>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default FranchiseDashboard;
