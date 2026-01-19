import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  ShoppingCart, 
  Wallet, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Brain,
  Activity,
  Eye,
  Bell,
  RefreshCw,
  AlertCircle,
  Boxes,
  CreditCard
} from 'lucide-react';

interface DashboardScreenProps {
  subScreen?: string;
}

export function MMDashboardScreen({ subScreen = 'overview' }: DashboardScreenProps) {
  if (subScreen === 'live-metrics') {
    return <LiveMetricsView />;
  }
  if (subScreen === 'ai-insights') {
    return <AIInsightsView />;
  }
  if (subScreen === 'marketplace-health') {
    return <MarketplaceHealthView />;
  }
  
  return <DashboardOverview />;
}

function DashboardOverview() {
  const stats = [
    { label: 'Total Products Listed', value: '156', icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { label: 'Active Products', value: '124', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: 'Pending Approval', value: '12', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { label: 'Rejected/On-Hold', value: '8', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
    { label: 'Live Demos Running', value: '45', icon: PlayCircle, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: 'AI-Generated Demos', value: '32', icon: Sparkles, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    { label: 'Total Orders', value: '1,234', icon: ShoppingCart, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    { label: 'Active Subscriptions', value: '892', icon: RefreshCw, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  ];

  const financials = [
    { label: 'Wallet Balance', value: '₹4,52,300', change: '+12.5%', positive: true, icon: Wallet },
    { label: 'Marketplace Revenue', value: '₹28,45,000', change: '+8.3%', positive: true, icon: TrendingUp },
    { label: 'Platform Commission', value: '₹2,84,500', change: '+15.2%', positive: true, icon: CreditCard },
  ];

  const alerts = [
    { type: 'warning', message: 'New Product Submitted - CRM Pro v2.0', time: '2 min ago', action: 'Review' },
    { type: 'error', message: 'Demo Incomplete - Lead Tracker Pro', time: '15 min ago', action: 'Check' },
    { type: 'info', message: 'AI Error Detected in E-Shop Builder', time: '1 hour ago', action: 'View' },
    { type: 'warning', message: 'Low Wallet Balance - Franchise #245', time: '2 hours ago', action: 'Alert' },
    { type: 'success', message: 'Subscription Renewed - Marketing Suite', time: '3 hours ago', action: 'View' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Boxes className="h-6 w-6 text-purple-400" />
            Dashboard Overview
          </h1>
          <p className="text-slate-400 mt-1">Complete marketplace management at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            System Online
          </Badge>
          <Button variant="outline" size="sm" className="border-slate-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-slate-400">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Financials */}
      <div className="grid grid-cols-3 gap-6">
        {financials.map((item, i) => {
          const Icon = item.icon;
          return (
            <Card key={i} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-purple-400" />
                    <span className="text-slate-400">{item.label}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${item.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {item.change}
                  </div>
                </div>
                <p className="text-3xl font-bold">{item.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts & Actions Panel */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-400" />
              Alerts & Actions
            </CardTitle>
            <Badge variant="outline" className="border-slate-600">
              {alerts.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    alert.type === 'error' ? 'bg-red-500/20' :
                    alert.type === 'warning' ? 'bg-amber-500/20' :
                    alert.type === 'success' ? 'bg-emerald-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    {alert.type === 'error' ? <XCircle className="h-4 w-4 text-red-400" /> :
                     alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-400" /> :
                     alert.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-400" /> :
                     <AlertCircle className="h-4 w-4 text-blue-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs text-slate-500">{alert.time}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-slate-600">
                  {alert.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LiveMetricsView() {
  const metrics = [
    { label: 'Active Users', value: '1,234', change: '+5.2%', positive: true },
    { label: 'Page Views', value: '45,678', change: '+12.3%', positive: true },
    { label: 'Conversion Rate', value: '3.2%', change: '-0.5%', positive: false },
    { label: 'Avg. Session', value: '4m 32s', change: '+8.1%', positive: true },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-purple-400" />
          Live Metrics
        </h1>
        <p className="text-slate-400 mt-1">Real-time marketplace performance data</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <p className="text-xs text-slate-400 mb-1">{metric.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold">{metric.value}</p>
                <span className={`text-sm ${metric.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metric.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Real-Time Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <Activity className="h-8 w-8 mr-2" />
            Live activity charts would render here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AIInsightsView() {
  const insights = [
    { title: 'Revenue Optimization', description: 'Increase pricing on high-demand products by 8%', confidence: 92, impact: 'high' },
    { title: 'Inventory Alert', description: 'Stock levels for CRM Pro running low', confidence: 87, impact: 'medium' },
    { title: 'User Behavior', description: 'Users spending 40% more time on demo pages', confidence: 95, impact: 'high' },
    { title: 'Churn Risk', description: '12 subscriptions at risk of cancellation', confidence: 78, impact: 'high' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-400" />
          AI Insights
        </h1>
        <p className="text-slate-400 mt-1">AI-powered recommendations and predictions</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{insight.title}</h3>
                <Badge className={`${
                  insight.impact === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {insight.impact} impact
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mb-3">{insight.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Confidence:</span>
                <Progress value={insight.confidence} className="flex-1 h-2" />
                <span className="text-xs font-medium">{insight.confidence}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MarketplaceHealthView() {
  const healthMetrics = [
    { label: 'System Uptime', value: '99.98%', status: 'healthy' },
    { label: 'API Response', value: '45ms', status: 'healthy' },
    { label: 'Error Rate', value: '0.02%', status: 'healthy' },
    { label: 'Active Sessions', value: '1,234', status: 'healthy' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-purple-400" />
          Marketplace Health
        </h1>
        <p className="text-slate-400 mt-1">System health and performance monitoring</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {healthMetrics.map((metric, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-400 uppercase">{metric.status}</span>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-slate-400">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-emerald-500/10 border-emerald-500/30">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-emerald-400">All Systems Operational</h3>
          <p className="text-slate-400 mt-1">No issues detected in the last 24 hours</p>
        </CardContent>
      </Card>
    </div>
  );
}
