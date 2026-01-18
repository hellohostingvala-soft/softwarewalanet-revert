/**
 * VALA AI FULL DASHBOARD
 * Comprehensive AI Command Center with all features
 * Includes: Overview, Models, Tasks, Usage, Alerts, API, Automation, Credits, Performance
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Cpu, ListTodo, BarChart3, AlertTriangle, Webhook, Cog, Wallet,
  Activity, TrendingUp, Zap, Clock, CheckCircle, XCircle, Play, Pause, 
  Square, RefreshCcw, Settings, Eye, ArrowUpRight, Download, Filter,
  Search, MoreVertical, AlertCircle, Info, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// ============ MOCK DATA ============

const aiStats = [
  { label: 'AI Requests', value: '12,847', change: '+23%', icon: Brain, color: 'text-primary', bgColor: 'bg-primary/10' },
  { label: 'Tasks Running', value: '156', change: '+8', icon: ListTodo, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  { label: 'Models Active', value: '12', change: '0', icon: Cpu, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  { label: 'Alerts', value: '3', change: '-2', icon: AlertTriangle, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  { label: 'Usage Today', value: '89%', change: '+5%', icon: BarChart3, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  { label: 'Credits Balance', value: '$2,450', change: '-$150', icon: Wallet, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  { label: 'API Calls', value: '45.2K', change: '+12%', icon: Webhook, color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
  { label: 'Automation Jobs', value: '28', change: '+3', icon: Cog, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
];

const models = [
  { name: 'gpt-5', provider: 'OpenAI', status: 'active', requests: '4.2K', latency: '1.2s', load: 78, accuracy: 99.2 },
  { name: 'gemini-2.5-pro', provider: 'Google', status: 'active', requests: '3.8K', latency: '0.9s', load: 65, accuracy: 98.7 },
  { name: 'gemini-2.5-flash', provider: 'Google', status: 'active', requests: '2.1K', latency: '0.4s', load: 45, accuracy: 97.5 },
  { name: 'gpt-5-mini', provider: 'OpenAI', status: 'active', requests: '1.9K', latency: '0.6s', load: 52, accuracy: 96.8 },
  { name: 'gemini-3-pro-image', provider: 'Google', status: 'idle', requests: '890', latency: '2.1s', load: 12, accuracy: 95.2 },
  { name: 'gpt-5-nano', provider: 'OpenAI', status: 'active', requests: '1.4K', latency: '0.3s', load: 38, accuracy: 94.1 },
];

const tasks = [
  { id: 'TASK-001', name: 'Content Moderation Batch', progress: 67, status: 'running', eta: '12 mins', model: 'gpt-5' },
  { id: 'TASK-002', name: 'Image Classification Pipeline', progress: 89, status: 'running', eta: '3 mins', model: 'gemini-3-pro-image' },
  { id: 'TASK-003', name: 'Document Processing Queue', progress: 23, status: 'running', eta: '45 mins', model: 'gpt-5-mini' },
  { id: 'TASK-004', name: 'Sentiment Analysis Batch', progress: 100, status: 'completed', eta: 'Done', model: 'gemini-2.5-flash' },
  { id: 'TASK-005', name: 'Translation Service', progress: 45, status: 'paused', eta: 'Paused', model: 'gpt-5' },
  { id: 'TASK-006', name: 'Code Review Automation', progress: 56, status: 'running', eta: '8 mins', model: 'gpt-5' },
];

const alerts = [
  { id: 'ALT-001', type: 'critical', message: 'High latency detected on image generation endpoint', time: '12 mins ago', resolved: false },
  { id: 'ALT-002', type: 'warning', message: 'Credit threshold 80% reached', time: '2 hours ago', resolved: false },
  { id: 'ALT-003', type: 'info', message: 'New model deployment scheduled for maintenance window', time: '4 hours ago', resolved: false },
  { id: 'ALT-004', type: 'critical', message: 'Rate limit exceeded for gpt-5 model', time: '6 hours ago', resolved: true },
];

const apiEndpoints = [
  { endpoint: '/v1/chat/completions', requests: '23.4K', avgLatency: '890ms', errorRate: '0.2%', status: 'healthy' },
  { endpoint: '/v1/images/generate', requests: '8.9K', avgLatency: '2.1s', errorRate: '1.1%', status: 'degraded' },
  { endpoint: '/v1/embeddings', requests: '12.1K', avgLatency: '145ms', errorRate: '0.1%', status: 'healthy' },
  { endpoint: '/v1/audio/transcribe', requests: '2.3K', avgLatency: '3.2s', errorRate: '0.3%', status: 'healthy' },
  { endpoint: '/v1/moderations', requests: '5.6K', avgLatency: '234ms', errorRate: '0.0%', status: 'healthy' },
];

const automationJobs = [
  { id: 'AUTO-001', name: 'Daily Report Generation', schedule: '0 6 * * *', lastRun: '6 hours ago', nextRun: 'in 18 hours', status: 'active' },
  { id: 'AUTO-002', name: 'Content Backup', schedule: '0 0 * * *', lastRun: '12 hours ago', nextRun: 'in 12 hours', status: 'active' },
  { id: 'AUTO-003', name: 'Model Retraining Pipeline', schedule: '0 2 * * 0', lastRun: '5 days ago', nextRun: 'in 2 days', status: 'active' },
  { id: 'AUTO-004', name: 'Cache Cleanup', schedule: '0 */6 * * *', lastRun: '2 hours ago', nextRun: 'in 4 hours', status: 'active' },
  { id: 'AUTO-005', name: 'Usage Analytics Export', schedule: '0 0 1 * *', lastRun: '18 days ago', nextRun: 'in 12 days', status: 'paused' },
];

const creditTransactions = [
  { id: 'TXN-001', type: 'usage', description: 'GPT-5 API Calls', amount: -45.20, balance: 2450.00, time: '2 hours ago' },
  { id: 'TXN-002', type: 'usage', description: 'Image Generation', amount: -12.50, balance: 2495.20, time: '4 hours ago' },
  { id: 'TXN-003', type: 'topup', description: 'Credit Top-up', amount: 500.00, balance: 2507.70, time: '1 day ago' },
  { id: 'TXN-004', type: 'usage', description: 'Embeddings API', amount: -8.30, balance: 2007.70, time: '2 days ago' },
  { id: 'TXN-005', type: 'refund', description: 'Failed Request Refund', amount: 2.50, balance: 2016.00, time: '3 days ago' },
];

const recentActivity = [
  { action: 'Model gemini-2.5-pro processed 1.2K requests', time: '2 mins ago', type: 'success' },
  { action: 'Automation job "Content Analysis" completed', time: '5 mins ago', type: 'success' },
  { action: 'High latency detected on image generation', time: '12 mins ago', type: 'warning' },
  { action: 'New AI model deployment: gpt-5-mini', time: '1 hour ago', type: 'info' },
  { action: 'Credit threshold alert triggered', time: '2 hours ago', type: 'warning' },
  { action: 'Task TASK-004 completed successfully', time: '3 hours ago', type: 'success' },
];

// ============ COMPONENT ============

export const ValaAIFullDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAction = (action: string, item?: string) => {
    toast.success(`${action}${item ? `: ${item}` : ''}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            VALA AI Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete AI Operations Management Center
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="pl-9 w-64 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/50">
            <Activity className="w-3 h-3 mr-1" />
            All Systems Online
          </Badge>
          <Button variant="outline" size="sm" onClick={() => handleAction('Refreshed dashboard')}>
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {aiStats.map((stat, idx) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith('+');
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${isPositive ? 'text-emerald-500 border-emerald-500/30' : 'text-rose-500 border-rose-500/30'}`}
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card/50 border border-border/50 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <Cpu className="w-4 h-4" />
            Models
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Webhook className="w-4 h-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Cog className="w-4 h-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="credits" className="gap-2">
            <Wallet className="w-4 h-4" />
            Credits
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  AI Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Model Accuracy</span>
                    <span className="text-foreground">98.5%</span>
                  </div>
                  <Progress value={98.5} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Response Latency</span>
                    <span className="text-foreground">124ms avg</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="text-foreground">99.2%</span>
                  </div>
                  <Progress value={99.2} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">GPU Utilization</span>
                    <span className="text-foreground">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Memory Usage</span>
                    <span className="text-foreground">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Recent Activity
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleAction('View all activity')}>
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {recentActivity.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          item.type === 'success' ? 'bg-emerald-500' :
                          item.type === 'warning' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">1.2M</p>
                <p className="text-xs text-muted-foreground">Tokens/min</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/30">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">99.9%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/30">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">+34%</p>
                <p className="text-xs text-muted-foreground">Efficiency Gain</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/30">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">847</p>
                <p className="text-xs text-muted-foreground">Tasks Today</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* MODELS TAB */}
        <TabsContent value="models" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => handleAction('Filter models')}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAction('Export model data')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            <Button size="sm" onClick={() => handleAction('Deploy new model')}>
              <Cpu className="w-4 h-4 mr-2" />
              Deploy Model
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">12</p>
                <p className="text-xs text-muted-foreground">Total Models</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-emerald-500">10</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">0.8s</p>
                <p className="text-xs text-muted-foreground">Avg Latency</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">Model Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {models.map((model) => (
                <div key={model.name} className="p-4 rounded-lg bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{model.name}</p>
                        <p className="text-xs text-muted-foreground">{model.provider} • Accuracy: {model.accuracy}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Activity className="w-4 h-4" />
                        {model.requests}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {model.latency}
                      </div>
                      <Badge className={model.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-500/20 text-zinc-400'}>
                        {model.status}
                      </Badge>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction('View model details', model.name)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Load</span>
                      <span>{model.load}%</span>
                    </div>
                    <Progress value={model.load} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TASKS TAB */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-emerald-500/10 border-emerald-500/30">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-emerald-500">156</p>
                <p className="text-xs text-emerald-500/70">Running</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-amber-500">12</p>
                <p className="text-xs text-amber-500/70">Paused</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">1,247</p>
                <p className="text-xs text-blue-500/70">Completed Today</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Active Tasks</span>
                <Button size="sm" onClick={() => handleAction('Create new task')}>
                  New Task
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 rounded-lg bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{task.name}</p>
                      <p className="text-xs text-muted-foreground">{task.id} • Model: {task.model} • ETA: {task.eta}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        task.status === 'running' ? 'bg-emerald-500/20 text-emerald-500' :
                        task.status === 'paused' ? 'bg-amber-500/20 text-amber-500' :
                        'bg-blue-500/20 text-blue-500'
                      }>
                        {task.status}
                      </Badge>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction(task.status === 'running' ? 'Paused task' : 'Resumed task', task.name)}>
                        {task.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleAction('Stopped task', task.name)}>
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API TAB */}
        <TabsContent value="api" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">45.2K</p>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-emerald-500">890ms</p>
                <p className="text-xs text-muted-foreground">Avg Latency</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">0.3%</p>
                <p className="text-xs text-muted-foreground">Error Rate</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-500">5</p>
                <p className="text-xs text-muted-foreground">Active Endpoints</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>API Endpoints</span>
                <Button size="sm" variant="outline" onClick={() => handleAction('View API documentation')}>
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  API Docs
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiEndpoints.map((api) => (
                  <div key={api.endpoint} className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Webhook className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-mono text-sm font-medium">{api.endpoint}</p>
                        <p className="text-xs text-muted-foreground">{api.requests} requests • {api.avgLatency} avg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Error: {api.errorRate}</span>
                      <Badge className={api.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}>
                        {api.status}
                      </Badge>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction('View endpoint details', api.endpoint)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUTOMATION TAB */}
        <TabsContent value="automation" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-3 gap-4 flex-1">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-500">28</p>
                  <p className="text-xs text-muted-foreground">Active Jobs</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-amber-500">3</p>
                  <p className="text-xs text-muted-foreground">Paused</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-blue-500">1,847</p>
                  <p className="text-xs text-muted-foreground">Executions Today</p>
                </CardContent>
              </Card>
            </div>
            <Button className="ml-4" onClick={() => handleAction('Create automation job')}>
              <Cog className="w-4 h-4 mr-2" />
              New Automation
            </Button>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">Scheduled Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {automationJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cog className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{job.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{job.schedule} • Last: {job.lastRun}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Next: {job.nextRun}</span>
                    <Badge className={job.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}>
                      {job.status}
                    </Badge>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction('Run job now', job.name)}>
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction('Edit job', job.name)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CREDITS TAB */}
        <TabsContent value="credits" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/30">
              <CardContent className="p-4 text-center">
                <Wallet className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">$2,450</p>
                <p className="text-xs text-muted-foreground">Current Balance</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-rose-500">-$156</p>
                <p className="text-xs text-muted-foreground">Today's Usage</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-500">$4,230</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-500">~18d</p>
                <p className="text-xs text-muted-foreground">Estimated Runway</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => handleAction('Top up credits')}>
              <Wallet className="w-4 h-4 mr-2" />
              Top Up Credits
            </Button>
            <Button variant="outline" onClick={() => handleAction('View billing history')}>
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
            <Button variant="outline" onClick={() => handleAction('Configure alerts')}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Set Alerts
            </Button>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {creditTransactions.map((txn) => (
                <div key={txn.id} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      txn.type === 'topup' ? 'bg-emerald-500/20' : 
                      txn.type === 'refund' ? 'bg-blue-500/20' : 
                      'bg-rose-500/20'
                    }`}>
                      {txn.type === 'topup' ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> :
                       txn.type === 'refund' ? <RefreshCcw className="w-4 h-4 text-blue-500" /> :
                       <ArrowUpRight className="w-4 h-4 text-rose-500 rotate-180" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{txn.description}</p>
                      <p className="text-xs text-muted-foreground">{txn.id} • {txn.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${txn.amount > 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                      {txn.amount > 0 ? '+' : ''}{txn.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Balance: ${txn.balance.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ALERTS TAB */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-500">1</p>
                <p className="text-xs text-red-500/70">Critical</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-500">1</p>
                <p className="text-xs text-amber-500/70">Warnings</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-4 text-center">
                <Info className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-500">1</p>
                <p className="text-xs text-blue-500/70">Info</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-500/10 border-emerald-500/30">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-emerald-500">1</p>
                <p className="text-xs text-emerald-500/70">Resolved</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>All Alerts</span>
                <Button size="sm" variant="outline" onClick={() => handleAction('Configure alert settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg ${alert.resolved ? 'bg-muted/20' : 'bg-muted/30'} flex items-start justify-between gap-4`}>
                  <div className="flex items-start gap-3">
                    {alert.type === 'critical' && <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                    {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />}
                    {alert.type === 'info' && <Info className="w-5 h-5 text-blue-500 mt-0.5" />}
                    <div>
                      <p className={`text-sm ${alert.resolved ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.id} • {alert.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.resolved ? (
                      <Badge className="bg-emerald-500/20 text-emerald-500">Resolved</Badge>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAction('Acknowledged alert', alert.id)}>
                          Acknowledge
                        </Button>
                        <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90" onClick={() => handleAction('Resolved alert', alert.id)}>
                          Resolve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
