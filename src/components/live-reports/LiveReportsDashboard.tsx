import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLiveActivityLogs, DateFilter, ActivityActionType, LiveActivityLog } from '@/hooks/useLiveActivityLogs';
import { LiveActivityFeed } from './LiveActivityFeed';
import { LiveStatsCards } from './LiveStatsCards';
import { LiveStatsGraph } from './LiveStatsGraph';
import { LiveOnlineUsers } from './LiveOnlineUsers';
import { LiveReportCard } from './LiveReportCard';
import { LiveStatusIndicator } from './LiveStatusIndicator';

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'developer', label: 'Developer' },
  { value: 'demo_manager', label: 'Demo Manager' },
  { value: 'franchise', label: 'Franchise' },
  { value: 'reseller', label: 'Reseller' },
  { value: 'client_success', label: 'Support' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'prime', label: 'Prime' },
  { value: 'client', label: 'Client' },
];

export function LiveReportsDashboard() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('live');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<LiveActivityLog | null>(null);

  const { logs, onlineUsers, stats, isLoading, refetch } = useLiveActivityLogs({
    dateFilter,
    roleFilter: roleFilter === 'all' ? null : roleFilter,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Live Reports
              <LiveStatusIndicator status="online" size="sm" />
            </h1>
            <p className="text-sm text-muted-foreground">Real-time activity monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Live
              </TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={roleFilter || 'all'} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter Role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <LiveStatsCards stats={stats} />

      {/* Graphs */}
      <LiveStatsGraph logs={logs} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Activity Feed
                {dateFilter === 'live' && <LiveStatusIndicator status="online" size="sm" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LiveActivityFeed logs={logs} onSelectLog={setSelectedLog} maxHeight="500px" />
            </CardContent>
          </Card>
        </div>

        {/* Online Users */}
        <div>
          <LiveOnlineUsers users={onlineUsers} maxHeight="500px" />
        </div>
      </div>

      {/* Detail Modal */}
      <LiveReportCard 
        log={selectedLog} 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />
    </div>
  );
}
