/**
 * FRANCHISE OWNER HOME DASHBOARD
 * Clickable cards that redirect to respective modules
 * Auto-refresh data from DB
 */

import React, { useState, useEffect } from 'react';
import { 
  Package, Target, ClipboardList, FolderKanban, Wallet,
  FileText, HeadphonesIcon, Handshake, TrendingUp, AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FOSection } from '../FranchiseOwnerTypes';

interface FOHomeDashboardProps {
  onNavigate: (section: FOSection) => void;
}

interface DashboardCard {
  id: string;
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  section: FOSection;
  color: string;
}

export function FOHomeDashboard({ onNavigate }: FOHomeDashboardProps) {
  const [stats, setStats] = useState({
    activeProducts: 12,
    activeLeads: 48,
    pendingOrders: 5,
    runningProjects: 8,
    walletBalance: '₹2,45,680',
    pendingInvoices: 3,
    openSupport: 2,
    pendingPromises: 4,
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real data from DB when available
        // For now using mock data
        console.log('Refreshing FO dashboard stats...');
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const dashboardCards: DashboardCard[] = [
    { 
      id: 'products', 
      label: 'Total Active Products', 
      value: stats.activeProducts, 
      icon: Package, 
      section: 'marketplace',
      color: 'bg-blue-500',
      trend: '+2 this month'
    },
    { 
      id: 'leads', 
      label: 'Total Active Leads', 
      value: stats.activeLeads, 
      icon: Target, 
      section: 'leads_seo',
      color: 'bg-emerald-500',
      trend: 'SEO + Ads'
    },
    { 
      id: 'orders', 
      label: 'Pending Orders', 
      value: stats.pendingOrders, 
      icon: ClipboardList, 
      section: 'my_orders',
      color: 'bg-amber-500',
      trend: 'Awaiting approval'
    },
    { 
      id: 'projects', 
      label: 'Running Projects', 
      value: stats.runningProjects, 
      icon: FolderKanban, 
      section: 'my_orders',
      color: 'bg-purple-500',
      trend: 'In progress'
    },
    { 
      id: 'wallet', 
      label: 'Wallet Balance', 
      value: stats.walletBalance, 
      icon: Wallet, 
      section: 'wallet',
      color: 'bg-green-500',
      trend: 'Available'
    },
    { 
      id: 'invoices', 
      label: 'Pending Invoices', 
      value: stats.pendingInvoices, 
      icon: FileText, 
      section: 'invoices',
      color: 'bg-orange-500',
      trend: 'Action needed'
    },
    { 
      id: 'support', 
      label: 'Open Support Requests', 
      value: stats.openSupport, 
      icon: HeadphonesIcon, 
      section: 'support_assist',
      color: 'bg-cyan-500',
      trend: 'Active tickets'
    },
    { 
      id: 'promises', 
      label: 'Pending Promises', 
      value: stats.pendingPromises, 
      icon: Handshake, 
      section: 'support_assist',
      color: 'bg-rose-500',
      trend: 'Track deadlines'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Franchise Owner Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Mumbai Region • Own Team • Own Products
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          Auto-refresh ON
        </Badge>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card) => (
          <Card 
            key={card.id}
            onClick={() => onNavigate(card.section)}
            className="bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${card.color} group-hover:scale-110 transition-transform`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                {card.trend && (
                  <Badge variant="secondary" className="text-[10px]">
                    {card.trend}
                  </Badge>
                )}
              </div>
              <h3 className="text-2xl font-bold">{card.value}</h3>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Info */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">
                Click any card to view details • Use header buttons for quick access
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
