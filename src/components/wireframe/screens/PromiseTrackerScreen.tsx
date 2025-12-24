import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Clock, 
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Timer,
  DollarSign,
  BarChart3,
  RefreshCw,
  Eye
} from 'lucide-react';

// Mock promise data
const activePromises = [
  { 
    id: 'PRM-001', 
    task: 'API Integration - CRM Module',
    developer: 'DEV***042',
    status: 'in_progress',
    promisedAt: '09:30 AM',
    deadline: '2:00 PM',
    elapsed: '2h 15m',
    remaining: '2h 15m',
    progress: 55
  },
  { 
    id: 'PRM-002', 
    task: 'Bug Fix - Login Flow',
    developer: 'DEV***089',
    status: 'promised',
    promisedAt: '10:00 AM',
    deadline: '12:30 PM',
    elapsed: '1h 45m',
    remaining: '45m',
    progress: 78
  },
  { 
    id: 'PRM-003', 
    task: 'Dashboard Redesign',
    developer: 'DEV***156',
    status: 'at_risk',
    promisedAt: '08:00 AM',
    deadline: '11:30 AM',
    elapsed: '3h 45m',
    remaining: '-15m',
    progress: 92
  },
  { 
    id: 'PRM-004', 
    task: 'Payment Gateway Setup',
    developer: 'DEV***203',
    status: 'breached',
    promisedAt: 'Yesterday',
    deadline: '5:00 PM',
    elapsed: '18h',
    remaining: '-3h',
    progress: 100
  }
];

const metrics = {
  activePromises: 12,
  completedToday: 8,
  breachedToday: 2,
  atRisk: 3,
  avgCompletionRate: 87,
  totalFines: '₹4,500'
};

const breachHistory = [
  { developer: 'DEV***203', task: 'Payment Gateway', fine: '₹500', date: 'Today' },
  { developer: 'DEV***078', task: 'Email Integration', fine: '₹250', date: 'Yesterday' },
  { developer: 'DEV***156', task: 'Report Module', fine: '₹500', date: '2 days ago' }
];

const topPerformers = [
  { developer: 'DEV***042', completed: 24, onTime: 23, rate: 96 },
  { developer: 'DEV***089', completed: 18, onTime: 17, rate: 94 },
  { developer: 'DEV***034', completed: 21, onTime: 19, rate: 90 }
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'in_progress': return { color: 'bg-blue-500/20 text-blue-400', icon: Timer };
    case 'promised': return { color: 'bg-cyan-500/20 text-cyan-400', icon: Target };
    case 'at_risk': return { color: 'bg-yellow-500/20 text-yellow-400', icon: AlertTriangle };
    case 'breached': return { color: 'bg-red-500/20 text-red-400', icon: XCircle };
    case 'completed': return { color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 };
    default: return { color: 'bg-muted text-muted-foreground', icon: Clock };
  }
};

export function PromiseTrackerScreen() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500/20 rounded-xl">
            <Target className="h-8 w-8 text-rose-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Promise Tracker</h1>
            <p className="text-muted-foreground">Real-time Developer Promise Monitoring</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <Timer className="h-6 w-6 mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.activePromises}</p>
            <p className="text-xs text-muted-foreground">Active Promises</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.completedToday}</p>
            <p className="text-xs text-muted-foreground">Completed Today</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <XCircle className="h-6 w-6 mx-auto text-red-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.breachedToday}</p>
            <p className="text-xs text-muted-foreground">Breached Today</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.atRisk}</p>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-emerald-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.avgCompletionRate}%</p>
            <p className="text-xs text-muted-foreground">On-Time Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 mx-auto text-amber-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.totalFines}</p>
            <p className="text-xs text-muted-foreground">Fines Collected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Promises */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Active Promise Timers
              <Badge className="bg-blue-500/20 text-blue-400 ml-auto">
                Live Tracking
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activePromises.map((promise) => {
                const config = getStatusConfig(promise.status);
                const StatusIcon = config.icon;
                return (
                  <div key={promise.id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">{promise.id}</span>
                        <Badge className={config.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {promise.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-lg font-bold">{promise.remaining}</p>
                        <p className="text-xs text-muted-foreground">remaining</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="font-medium">{promise.task}</p>
                      <p className="text-sm text-muted-foreground">{promise.developer}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{promise.progress}%</span>
                      </div>
                      <Progress 
                        value={promise.progress} 
                        className={`h-2 ${promise.status === 'breached' ? '[&>div]:bg-red-500' : promise.status === 'at_risk' ? '[&>div]:bg-yellow-500' : ''}`}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border/30 text-xs">
                      <div>
                        <p className="text-muted-foreground">Promised</p>
                        <p className="font-medium">{promise.promisedAt}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deadline</p>
                        <p className="font-medium">{promise.deadline}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Elapsed</p>
                        <p className="font-medium">{promise.elapsed}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" /> Details
                      </Button>
                      {promise.status === 'at_risk' && (
                        <Button size="sm" variant="destructive" className="flex-1">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Escalate
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((dev, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{dev.developer}</span>
                      <Badge className="bg-green-500/20 text-green-400">
                        {dev.rate}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Completed: <span className="text-foreground">{dev.completed}</span></div>
                      <div>On-Time: <span className="text-green-400">{dev.onTime}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Breach History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" />
                Recent Breaches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {breachHistory.map((breach, index) => (
                  <div key={index} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{breach.developer}</span>
                      <Badge className="bg-red-500/20 text-red-400">
                        {breach.fine}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{breach.task}</p>
                    <p className="text-xs text-muted-foreground">{breach.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
