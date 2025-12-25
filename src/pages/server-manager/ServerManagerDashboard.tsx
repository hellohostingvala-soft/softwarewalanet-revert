// Server Manager Dashboard - Infrastructure Control Panel
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Server, Activity, Layers, Network, AlertTriangle, Database,
  Shield, DollarSign, FileText, ClipboardList, Cpu, HardDrive,
  Gauge, RefreshCw, Lock, Eye, Zap, Cloud
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import RoleSidebar from '@/components/layouts/RoleSidebar';
import { supabase } from '@/integrations/supabase/client';

// Sidebar items for Server Manager
const sidebarItems = [
  { id: 'dashboard', label: 'Server Dashboard', icon: Server },
  { id: 'status', label: 'Live Server Status', icon: Activity },
  { id: 'groups', label: 'Server Groups', icon: Layers },
  { id: 'traffic', label: 'Load & Traffic', icon: Network },
  { id: 'incidents', label: 'Incidents & Alerts', icon: AlertTriangle },
  { id: 'backups', label: 'Backups & Recovery', icon: Database },
  { id: 'security', label: 'Security & Patches', icon: Shield },
  { id: 'costs', label: 'Cost & Usage', icon: DollarSign },
  { id: 'requests', label: 'Change Requests', icon: ClipboardList },
  { id: 'audit', label: 'Server Audit Logs', icon: FileText },
];

// Mock data for dashboard
const mockStats = {
  totalServers: 47,
  activeServers: 45,
  downServers: 2,
  cpuAvg: 42.5,
  ramAvg: 68.3,
  diskAvg: 55.2,
  requestsPerSec: 12450,
  errorRate: 0.02,
  backupStatus: 'healthy',
  securityRisk: 'low',
};

const mockServers = [
  { id: 1, name: 'PROD-US-01', type: 'production', status: 'active', cpu: 45, ram: 72, disk: 48, location: 'US East', uptime: 99.99 },
  { id: 2, name: 'PROD-EU-01', type: 'production', status: 'active', cpu: 38, ram: 65, disk: 52, location: 'EU West', uptime: 99.97 },
  { id: 3, name: 'PROD-IN-01', type: 'production', status: 'active', cpu: 52, ram: 78, disk: 61, location: 'India', uptime: 99.95 },
  { id: 4, name: 'DB-MAIN-01', type: 'database', status: 'active', cpu: 35, ram: 82, disk: 75, location: 'US East', uptime: 99.99 },
  { id: 5, name: 'AI-GPU-01', type: 'ai', status: 'maintenance', cpu: 0, ram: 0, disk: 45, location: 'US West', uptime: 98.50 },
  { id: 6, name: 'BACKUP-01', type: 'backup', status: 'active', cpu: 12, ram: 25, disk: 88, location: 'EU North', uptime: 99.98 },
];

const mockAlerts = [
  { id: 1, server: 'PROD-IN-01', type: 'high_cpu', severity: 'warning', message: 'CPU usage exceeded 80%', time: '2 min ago' },
  { id: 2, server: 'DB-MAIN-01', type: 'disk_full', severity: 'warning', message: 'Disk usage at 75%', time: '15 min ago' },
  { id: 3, server: 'AI-GPU-01', type: 'maintenance', severity: 'info', message: 'Scheduled maintenance', time: '1 hour ago' },
];

// Dashboard Overview Component
const DashboardOverview = () => (
  <div className="space-y-6">
    {/* Top Stats Cards */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Servers</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-foreground">{mockStats.activeServers}</p>
                <span className="text-sm text-green-500">/ {mockStats.totalServers}</span>
              </div>
            </div>
            <Server className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2 flex gap-2">
            <Badge variant="default" className="bg-green-500/20 text-green-500 text-xs">
              {mockStats.activeServers} Active
            </Badge>
            <Badge variant="secondary" className="bg-red-500/20 text-red-500 text-xs">
              {mockStats.downServers} Down
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">CPU Usage</p>
              <p className="text-2xl font-bold text-foreground">{mockStats.cpuAvg}%</p>
            </div>
            <Cpu className="h-8 w-8 text-orange-500" />
          </div>
          <Progress value={mockStats.cpuAvg} className="mt-2 h-1" />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">RAM Usage</p>
              <p className="text-2xl font-bold text-foreground">{mockStats.ramAvg}%</p>
            </div>
            <Gauge className="h-8 w-8 text-purple-500" />
          </div>
          <Progress value={mockStats.ramAvg} className="mt-2 h-1" />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Live Traffic</p>
              <p className="text-2xl font-bold text-foreground">{(mockStats.requestsPerSec / 1000).toFixed(1)}k</p>
            </div>
            <Network className="h-8 w-8 text-cyan-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">requests/sec</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Error Rate</p>
              <p className="text-2xl font-bold text-green-500">{mockStats.errorRate}%</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Last 24 hours</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Security Risk</p>
              <p className="text-2xl font-bold text-green-500 capitalize">{mockStats.securityRisk}</p>
            </div>
            <Shield className="h-8 w-8 text-green-500" />
          </div>
          <Badge variant="default" className="bg-green-500/20 text-green-500 text-xs mt-2">
            All Systems Secure
          </Badge>
        </CardContent>
      </Card>
    </div>

    {/* Server List & Alerts */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Server List */}
      <Card className="lg:col-span-2 bg-card border-border">
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Live Server Status</CardTitle>
            <Badge variant="outline" className="text-muted-foreground">
              <RefreshCw className="h-3 w-3 mr-1" />
              Auto-refresh
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-border">
              {mockServers.map((server) => (
                <motion.div
                  key={server.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        server.status === 'active' ? 'bg-green-500 animate-pulse' :
                        server.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                      )} />
                      <div>
                        <p className="font-medium text-foreground">{server.name}</p>
                        <p className="text-xs text-muted-foreground">{server.location} · {server.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <p className="text-muted-foreground">CPU</p>
                        <p className={cn("font-medium", server.cpu > 80 ? 'text-red-500' : 'text-foreground')}>{server.cpu}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">RAM</p>
                        <p className={cn("font-medium", server.ram > 80 ? 'text-red-500' : 'text-foreground')}>{server.ram}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Uptime</p>
                        <p className="font-medium text-green-500">{server.uptime}%</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-border">
              {mockAlerts.map((alert) => (
                <div key={alert.id} className="p-3">
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5",
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{alert.server}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>

    {/* Server Groups */}
    <Card className="bg-card border-border">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="text-foreground">Server Groups</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['Production', 'Staging', 'Backup', 'AI/GPU', 'Database'].map((group) => (
            <div key={group} className="p-3 rounded-lg bg-muted/50 text-center">
              <Cloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium text-foreground">{group}</p>
              <p className="text-xs text-muted-foreground">
                {group === 'Production' ? '12 servers' :
                 group === 'Staging' ? '6 servers' :
                 group === 'Backup' ? '8 servers' :
                 group === 'AI/GPU' ? '4 servers' : '6 servers'}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Section Placeholder
const SectionPlaceholder = ({ section }: { section: string }) => (
  <Card className="bg-card border-border">
    <CardHeader className="border-b border-border">
      <div className="flex items-center justify-between">
        <CardTitle className="text-foreground capitalize">{section.replace('-', ' ')}</CardTitle>
        {section === 'audit' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Read Only
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent className="p-6">
      <div className="text-center py-12">
        <Lock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          {section} - Technical infrastructure data only
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          No access to user data, payments, wallets, leads, or chats
        </p>
      </div>
    </CardContent>
  </Card>
);

const ServerManagerDashboard = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentSection = pathParts[1] || 'dashboard';

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Server className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Server Manager</h2>
              <p className="text-xs text-slate-400">Infrastructure Control</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 py-2">
          <nav className="px-2 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => window.history.pushState({}, '', `/server-manager/${item.id === 'dashboard' ? '' : item.id}`)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    isActive 
                      ? "bg-cyan-500/20 text-cyan-400" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Security Notice */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="h-3 w-3" />
              <span>IP Locked · No Export</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {currentSection === 'dashboard' ? 'Server Dashboard' : 
                 sidebarItems.find(i => i.id === currentSection)?.label || 'Server Manager'}
              </h1>
              <p className="text-muted-foreground">
                Infrastructure management - Technical access only
              </p>
            </div>
            <Badge variant="outline" className="text-cyan-500 border-cyan-500/50">
              <Shield className="h-3 w-3 mr-1" />
              No Business Data Access
            </Badge>
          </div>

          {/* Restriction Notice */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>
                Access restricted to server infrastructure only. No access to users, payments, wallets, leads, or chats. 
                All actions are logged immutably.
              </span>
            </div>
          </div>

          {currentSection === 'dashboard' ? (
            <DashboardOverview />
          ) : (
            <SectionPlaceholder section={currentSection} />
          )}
        </div>
      </main>
    </div>
  );
};

export default ServerManagerDashboard;
