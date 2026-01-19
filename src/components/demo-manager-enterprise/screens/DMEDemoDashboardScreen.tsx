/**
 * DEMO DASHBOARD SCREEN (PER DEMO)
 * Individual demo dashboard with health, testing, and sync controls
 * LOCK: No modifications without approval
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Activity,
  MousePointer,
  Layers,
  Palette,
  AlertTriangle,
  ExternalLink,
  Bug,
  Sparkles,
  Store,
  Home,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DemoDashboardProps {
  demoId?: string;
}

export const DMEDemoDashboardScreen: React.FC<DemoDashboardProps> = ({ demoId }) => {
  const [selectedDemo, setSelectedDemo] = useState('E-Commerce Pro');

  const demos = ['E-Commerce Pro', 'Hospital Management', 'School ERP', 'Sales CRM', 'Fleet Manager'];

  const demoData = {
    name: selectedDemo,
    url: 'https://ecom-demo.softwarevala.com',
    liveStatus: 'online',
    uptime: '99.97%',
    lastChecked: '30 sec ago',
    buttonClickTest: { passed: 45, failed: 2, total: 47 },
    moduleHealth: { healthy: 12, warning: 2, critical: 0, total: 14 },
    uiConsistency: { score: 96, issues: ['Font mismatch on checkout', 'Button alignment on mobile'] },
    knownIssues: [
      { id: 1, title: 'Cart calculation error', severity: 'high', status: 'open' },
      { id: 2, title: 'Slow image loading', severity: 'medium', status: 'fixing' },
      { id: 3, title: 'Search filter bug', severity: 'low', status: 'resolved' },
    ],
    marketplaceSync: true,
    homepageSync: true
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-teal/20 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-neon-teal" />
            </div>
            Demo Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Per-demo monitoring & controls</p>
        </div>
        <select
          value={selectedDemo}
          onChange={(e) => setSelectedDemo(e.target.value)}
          className="px-4 py-2 rounded-lg bg-card border border-border text-foreground"
        >
          {demos.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Live Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border flex items-center justify-between ${
          demoData.liveStatus === 'online' 
            ? 'bg-neon-green/10 border-neon-green/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            demoData.liveStatus === 'online' ? 'bg-neon-green' : 'bg-red-400'
          }`} />
          <div>
            <p className="font-semibold text-foreground">{demoData.name}</p>
            <p className="text-sm text-muted-foreground">{demoData.url}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Uptime</p>
            <p className="text-lg font-bold text-neon-green">{demoData.uptime}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Last Check</p>
            <p className="text-sm font-medium text-foreground">{demoData.lastChecked}</p>
          </div>
          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
            {demoData.liveStatus.toUpperCase()}
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* Button Click Test */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <MousePointer className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-muted-foreground">Button Click Test</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-neon-green">{demoData.buttonClickTest.passed}</span>
            <span className="text-lg text-muted-foreground">/ {demoData.buttonClickTest.total}</span>
          </div>
          {demoData.buttonClickTest.failed > 0 && (
            <p className="text-xs text-red-400 mt-2">{demoData.buttonClickTest.failed} failed</p>
          )}
        </motion.div>

        {/* Module Health */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-muted-foreground">Module Health</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-neon-green">{demoData.moduleHealth.healthy}</span>
            <span className="text-lg text-muted-foreground">/ {demoData.moduleHealth.total}</span>
          </div>
          <div className="flex gap-2 mt-2">
            {demoData.moduleHealth.warning > 0 && (
              <span className="text-xs text-amber-400">{demoData.moduleHealth.warning} warning</span>
            )}
          </div>
        </motion.div>

        {/* UI Consistency */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-muted-foreground">UI Consistency</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-neon-teal">{demoData.uiConsistency.score}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{demoData.uiConsistency.issues.length} issues found</p>
        </motion.div>

        {/* Known Issues */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-muted-foreground">Known Issues</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-amber-400">
              {demoData.knownIssues.filter(i => i.status !== 'resolved').length}
            </span>
            <span className="text-lg text-muted-foreground">open</span>
          </div>
          <p className="text-xs text-neon-green mt-2">
            {demoData.knownIssues.filter(i => i.status === 'resolved').length} resolved
          </p>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3"
      >
        <Button 
          className="bg-neon-teal/20 text-neon-teal hover:bg-neon-teal/30 border border-neon-teal/30"
          onClick={() => window.open(demoData.url, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Demo
        </Button>
        <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
          <Bug className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
        <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
          <Sparkles className="w-4 h-4 mr-2" />
          Upgrade Demo
        </Button>
        <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
          <Store className="w-4 h-4 mr-2" />
          Sync Marketplace
        </Button>
        <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
          <Home className="w-4 h-4 mr-2" />
          Sync Home Page
        </Button>
      </motion.div>

      {/* Known Issues List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="p-6 rounded-xl bg-card border border-border"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Known Issues List</h2>
        <div className="space-y-3">
          {demoData.knownIssues.map((issue) => (
            <div key={issue.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center gap-3">
                {issue.status === 'resolved' ? (
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                ) : issue.status === 'fixing' ? (
                  <RefreshCw className="w-5 h-5 text-neon-teal animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-sm text-foreground">{issue.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={
                  issue.severity === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  issue.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-neon-green/20 text-neon-green border-neon-green/30'
                }>
                  {issue.severity.toUpperCase()}
                </Badge>
                <Badge className={
                  issue.status === 'resolved' ? 'bg-neon-green/20 text-neon-green' :
                  issue.status === 'fixing' ? 'bg-neon-teal/20 text-neon-teal' :
                  'bg-red-500/20 text-red-400'
                }>
                  {issue.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
