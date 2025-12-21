import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Target, Code2, Clock, Building2, Users, Headphones, 
  DollarSign, Globe, TrendingUp, Zap, Activity, Map,
  TrendingDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPITile } from '../components/KPITile';
import { ModuleTile3D } from '../components/ModuleTile3D';
import { BuzzerAlert } from '../components/BuzzerAlert';
import { ParticleBackground } from '../components/ParticleBackground';

interface ModuleTileData {
  id: string;
  title: string;
  icon: any;
  color: string;
  stats: {
    pending: number;
    active: number;
    done: number;
  };
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
}

export function SuperAdminDashboard() {
  const isDark = true;

  const topKPIs = [
    { title: 'Total Revenue', value: '₹12.5M', icon: DollarSign, trend: 'up' as const, trendValue: '+12%', color: 'bg-emerald-500' },
    { title: 'Active Leads', value: '2,847', icon: Target, trend: 'up' as const, trendValue: '+8%', color: 'bg-cyan-500' },
    { title: 'Performance', value: '94.2%', icon: TrendingUp, trend: 'up' as const, trendValue: '+3%', color: 'bg-purple-500' },
    { title: 'System Uptime', value: '99.9%', icon: Activity, trend: 'neutral' as const, trendValue: '0%', color: 'bg-blue-500' },
  ];

  const [moduleTiles, setModuleTiles] = useState<ModuleTileData[]>([
    { id: '1', title: 'Leads', icon: Target, color: 'bg-teal-500', stats: { pending: 45, active: 128, done: 892 }, trend: 'up' as const, trendValue: '+15%' },
    { id: '2', title: 'Developers', icon: Code2, color: 'bg-purple-500', stats: { pending: 12, active: 38, done: 156 }, trend: 'up' as const, trendValue: '+5%' },
    { id: '3', title: 'Tasks', icon: Clock, color: 'bg-indigo-500', stats: { pending: 67, active: 23, done: 445 }, trend: 'down' as const, trendValue: '-2%' },
    { id: '4', title: 'Franchise', icon: Building2, color: 'bg-blue-500', stats: { pending: 8, active: 45, done: 12 }, trend: 'up' as const, trendValue: '+10%' },
    { id: '5', title: 'Resellers', icon: Users, color: 'bg-cyan-500', stats: { pending: 15, active: 89, done: 234 }, trend: 'up' as const, trendValue: '+22%' },
    { id: '6', title: 'Support', icon: Headphones, color: 'bg-sky-500', stats: { pending: 23, active: 12, done: 567 }, trend: 'down' as const, trendValue: '-5%' },
    { id: '7', title: 'Finance', icon: DollarSign, color: 'bg-emerald-500', stats: { pending: 5, active: 2, done: 89 }, trend: 'up' as const, trendValue: '+8%' },
    { id: '8', title: 'SEO', icon: Globe, color: 'bg-green-500', stats: { pending: 3, active: 15, done: 45 }, trend: 'up' as const, trendValue: '+18%' },
    { id: '9', title: 'Performance', icon: TrendingUp, color: 'bg-rose-500', stats: { pending: 0, active: 21, done: 21 }, trend: 'up' as const, trendValue: '+3%' },
    { id: '10', title: 'Demos', icon: Zap, color: 'bg-violet-500', stats: { pending: 4, active: 67, done: 0 }, trend: 'neutral' as const, trendValue: '0%' },
  ]);

  return (
    <div className="space-y-6 relative min-h-screen">
      {/* Particle Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <ParticleBackground />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 space-y-6">
        {/* Page Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
              WELCOME BOSS
            </h1>
            <p className="text-muted-foreground mt-1">Super Admin Dashboard • Live Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-2 bg-emerald-500/10 border-emerald-500/50 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              All Systems Online
            </Badge>
            <Button variant="outline" className="backdrop-blur-sm bg-white/5 border-white/20 hover:bg-white/10">
              <Map className="h-4 w-4 mr-2" />
              View Branch Map
            </Button>
          </div>
        </motion.div>

        {/* Buzzer Alert (if active) */}
        <BuzzerAlert
          type="lead"
          title="Hot Lead Waiting"
          description="Lead #L-2847 from Mumbai region needs immediate attention"
          priority="high"
          countdown={45}
          isDark={isDark}
        />

        {/* Top KPIs */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {topKPIs.map((kpi, idx) => (
            <KPITile key={idx} {...kpi} isDark={isDark} />
          ))}
        </motion.div>

        {/* Developer Timer Preview */}
        <motion.div 
          className={`p-4 rounded-xl border backdrop-blur-xl ${isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white/30 border-gray-200/50'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-500" />
              Active Developer Timers
            </h3>
            <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/50">12 Running</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'DEV***042', task: 'API Integration', time: '02:34:12', progress: 65 },
              { name: 'DEV***018', task: 'UI Fixes', time: '01:15:45', progress: 40 },
              { name: 'DEV***089', task: 'Bug Fix', time: '00:45:30', progress: 80 },
              { name: 'DEV***034', task: 'Feature Dev', time: '03:12:00', progress: 25 },
              { name: 'DEV***056', task: 'Testing', time: '00:30:15', progress: 90 },
              { name: 'DEV***071', task: 'Documentation', time: '01:00:00', progress: 55 },
            ].map((dev, idx) => (
              <motion.div 
                key={idx} 
                className={`p-3 rounded-lg border backdrop-blur-sm ${isDark ? 'bg-slate-900/50 border-slate-600/50' : 'bg-white/50 border-gray-200'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                style={{
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <p className="text-xs text-muted-foreground truncate">{dev.name}</p>
                <p className="text-sm font-mono text-cyan-400">{dev.time}</p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${dev.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 truncate">{dev.task}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Section Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <h2 className="text-2xl font-bold">Role Modules</h2>
            <p className="text-sm text-muted-foreground">Drag and drop to reorder • Real-time data</p>
          </div>
          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/50">
            <span className="h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse" />
            Live Updates
          </Badge>
        </motion.div>

        {/* 3D Module Tiles Grid - 2 per row */}
        <Reorder.Group
          axis="y"
          values={moduleTiles}
          onReorder={setModuleTiles}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {moduleTiles.map((tile, idx) => (
              <Reorder.Item
                key={tile.id}
                value={tile}
                className="cursor-grab active:cursor-grabbing"
                whileDrag={{ 
                  scale: 1.02, 
                  zIndex: 50,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                }}
              >
                <ModuleTile3D
                  title={tile.title}
                  icon={tile.icon}
                  color={tile.color}
                  stats={tile.stats}
                  trend={tile.trend}
                  trendValue={tile.trendValue}
                  isDark={isDark}
                  isActive={tile.stats.active > 20}
                  index={idx}
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {/* AI Insights Section */}
        <motion.div 
          className={`p-6 rounded-2xl border backdrop-blur-xl ${isDark ? 'bg-slate-800/30 border-purple-500/30' : 'bg-white/30 border-purple-200'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">AI Insights</h3>
              <p className="text-xs text-muted-foreground">Powered by Vala Intelligence</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { insight: 'Lead conversion rate up 15% this week', type: 'positive' },
              { insight: '3 developers approaching SLA deadline', type: 'warning' },
              { insight: 'Mumbai region showing highest growth', type: 'info' },
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                className={`p-4 rounded-xl border backdrop-blur-sm ${
                  item.type === 'positive' 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : item.type === 'warning' 
                    ? 'bg-amber-500/10 border-amber-500/30' 
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-start gap-2">
                  {item.type === 'positive' && <TrendingUp className="h-4 w-4 text-emerald-400 mt-0.5" />}
                  {item.type === 'warning' && <Clock className="h-4 w-4 text-amber-400 mt-0.5" />}
                  {item.type === 'info' && <Globe className="h-4 w-4 text-blue-400 mt-0.5" />}
                  <p className="text-sm">{item.insight}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
