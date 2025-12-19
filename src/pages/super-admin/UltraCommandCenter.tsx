import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Users, Zap, Activity, Server, Shield, TrendingUp,
  Bell, AlertTriangle, CheckCircle, Clock, Cpu, Wifi,
  BarChart3, PieChart, LineChart, ArrowUpRight, ArrowDownRight,
  Play, Pause, RefreshCw, Settings, Terminal, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { LiveStatsWidget, SystemMetrics } from '@/components/performance/LiveStatsWidget';
import { RealTimeCounter, CounterGrid } from '@/components/performance/RealTimeCounter';
import { VirtualizedTable } from '@/components/performance/VirtualizedTable';
import { UltraFastSearch } from '@/components/performance/UltraFastSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Role status data
const generateRoleData = () => [
  { id: 'super_admin', name: 'Super Admin', active: 3, pending: 0, failed: 0, status: 'online' },
  { id: 'admin', name: 'Admin', active: 12, pending: 2, failed: 0, status: 'online' },
  { id: 'franchise', name: 'Franchise', active: 156, pending: 8, failed: 3, status: 'online' },
  { id: 'reseller', name: 'Reseller', active: 423, pending: 15, failed: 5, status: 'online' },
  { id: 'developer', name: 'Developer', active: 89, pending: 4, failed: 1, status: 'online' },
  { id: 'prime_user', name: 'Prime User', active: 1247, pending: 23, failed: 8, status: 'online' },
  { id: 'support', name: 'Support', active: 34, pending: 2, failed: 0, status: 'online' },
  { id: 'sales', name: 'Sales', active: 67, pending: 5, failed: 1, status: 'online' },
  { id: 'seo_manager', name: 'SEO Manager', active: 8, pending: 1, failed: 0, status: 'online' },
  { id: 'lead_manager', name: 'Lead Manager', active: 15, pending: 2, failed: 0, status: 'online' },
  { id: 'task_manager', name: 'Task Manager', active: 12, pending: 1, failed: 0, status: 'online' },
  { id: 'demo_manager', name: 'Demo Manager', active: 6, pending: 0, failed: 0, status: 'online' },
  { id: 'finance_manager', name: 'Finance', active: 4, pending: 0, failed: 0, status: 'online' },
  { id: 'marketing', name: 'Marketing', active: 18, pending: 3, failed: 0, status: 'online' },
  { id: 'rnd', name: 'R&D', active: 11, pending: 1, failed: 0, status: 'online' },
  { id: 'client_success', name: 'Client Success', active: 9, pending: 2, failed: 0, status: 'online' },
  { id: 'performance', name: 'Performance', active: 5, pending: 0, failed: 0, status: 'online' },
  { id: 'legal', name: 'Legal', active: 3, pending: 0, failed: 0, status: 'online' },
  { id: 'hr', name: 'HR', active: 7, pending: 1, failed: 0, status: 'online' },
  { id: 'influencer', name: 'Influencer', active: 234, pending: 12, failed: 4, status: 'online' },
  { id: 'guest', name: 'Guest', active: 5420, pending: 145, failed: 23, status: 'online' },
];

// Generate massive dataset for virtualized table
const generateActivityData = (count: number) => {
  const actions = ['Login', 'View', 'Update', 'Create', 'Delete', 'Export', 'Import'];
  const modules = ['Lead', 'Task', 'Demo', 'Wallet', 'User', 'Report', 'Settings'];
  const statuses = ['Success', 'Pending', 'Failed'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `act_${i}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    user: `User_${Math.floor(Math.random() * 10000)}`,
    action: actions[Math.floor(Math.random() * actions.length)],
    module: modules[Math.floor(Math.random() * modules.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    duration: Math.floor(Math.random() * 1000),
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.xxx.xxx`
  }));
};

const RoleStatusCard = memo(({ role }: { role: ReturnType<typeof generateRoleData>[0] }) => {
  const total = role.active + role.pending + role.failed;
  const healthPercent = (role.active / total) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 hover:border-cyan-400/40 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-300">{role.name}</span>
        <div className={cn(
          "w-2 h-2 rounded-full",
          role.status === 'online' ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
        )} />
      </div>

      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-emerald-400">{role.active}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-amber-400">{role.pending}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="text-rose-400">{role.failed}</span>
        </div>
      </div>

      {/* Health bar */}
      <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${healthPercent}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
        />
      </div>
    </motion.div>
  );
});

RoleStatusCard.displayName = 'RoleStatusCard';

const UltraCommandCenter = () => {
  const [roleData] = useState(generateRoleData);
  const [activityData] = useState(() => generateActivityData(100000)); // 100K rows
  const [liveStats, setLiveStats] = useState({
    totalUsers: 5247892,
    activeNow: 23456,
    requests: 1547823,
    revenue: 45678900,
    leads: 89234,
    demos: 1234
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 10),
        activeNow: prev.activeNow + Math.floor(Math.random() * 100 - 50),
        requests: prev.requests + Math.floor(Math.random() * 1000),
        revenue: prev.revenue + Math.floor(Math.random() * 10000),
        leads: prev.leads + Math.floor(Math.random() * 5),
        demos: prev.demos + Math.floor(Math.random() * 2)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  type ActivityItem = ReturnType<typeof generateActivityData>[0];
  
  const columns = [
    { key: 'timestamp', header: 'Time', width: 180, sortable: true, render: (item: ActivityItem) => new Date(item.timestamp).toLocaleString() },
    { key: 'user', header: 'User', width: 120, sortable: true },
    { key: 'action', header: 'Action', width: 100, sortable: true },
    { key: 'module', header: 'Module', width: 100, sortable: true },
    { key: 'status', header: 'Status', width: 100, sortable: true, render: (item: ActivityItem) => (
      <Badge variant={item.status === 'Success' ? 'default' : item.status === 'Pending' ? 'secondary' : 'destructive'} className="text-xs">
        {item.status}
      </Badge>
    )},
    { key: 'duration', header: 'Duration', width: 100, sortable: true, render: (item: ActivityItem) => `${item.duration}ms` },
    { key: 'ip', header: 'IP (Masked)', width: 140 },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
        {/* Header with Boss greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              Welcome Back, Boss 👋
            </motion.h1>
            <p className="text-slate-400 mt-1">
              Ultra Command Center • 5M+ Capacity • Real-Time Analytics
            </p>
          </div>

          <div className="flex items-center gap-4">
            <UltraFastSearch
              data={activityData}
              searchFields={['user', 'action', 'module']}
              placeholder="Search 100K+ records..."
            />
            <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync All
            </Button>
          </div>
        </motion.div>

        {/* System Metrics */}
        <SystemMetrics />

        {/* Live Counters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-cyan-500/20">
            <RealTimeCounter 
              value={liveStats.totalUsers} 
              label="Total Users" 
              format="compact"
              size="md"
              color="cyan"
            />
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-emerald-500/20">
            <RealTimeCounter 
              value={liveStats.activeNow} 
              label="Active Now" 
              format="compact"
              size="md"
              color="emerald"
            />
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-purple-500/20">
            <RealTimeCounter 
              value={liveStats.requests} 
              label="Requests/Day" 
              format="compact"
              size="md"
              color="purple"
            />
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-amber-500/20">
            <RealTimeCounter 
              value={liveStats.revenue} 
              label="Revenue" 
              format="currency"
              size="md"
              color="amber"
            />
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-rose-500/20">
            <RealTimeCounter 
              value={liveStats.leads} 
              label="Leads Today" 
              size="md"
              color="rose"
            />
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-blue-500/20">
            <RealTimeCounter 
              value={liveStats.demos} 
              label="Active Demos" 
              size="md"
              color="cyan"
            />
          </div>
        </div>

        {/* 21 Role Status Grid */}
        <div>
          <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            21 Role Status Monitor
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {roleData.map((role) => (
              <RoleStatusCard key={role.id} role={role} />
            ))}
          </div>
        </div>

        {/* Activity Log - Virtualized Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Live Activity Log
            </h2>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
              {activityData.length.toLocaleString()} records
            </Badge>
          </div>
          <VirtualizedTable
            data={activityData}
            columns={columns}
            rowHeight={48}
            className="h-[400px]"
            getRowKey={(item) => item.id}
          />
        </div>

        {/* Performance indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Operating at Optimal Performance</span>
          <span>•</span>
          <span>5M+ User Capacity</span>
          <span>•</span>
          <span>{"<"}50ms Response Time</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UltraCommandCenter;
