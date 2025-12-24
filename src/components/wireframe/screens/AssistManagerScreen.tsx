import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Headphones, 
  Users, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Shield,
  BarChart3,
  Calendar,
  Star,
  Target,
  Settings
} from 'lucide-react';

// Mock agent data
const agents = [
  { 
    id: 'AGT-001', 
    name: 'Alpha Support', 
    status: 'online',
    currentSession: 'SA-001',
    sessionsToday: 8,
    avgRating: 4.8,
    avgDuration: '12:30',
    aiAlerts: 1,
    specialty: 'Technical'
  },
  { 
    id: 'AGT-002', 
    name: 'Beta Support', 
    status: 'busy',
    currentSession: 'SA-002',
    sessionsToday: 12,
    avgRating: 4.6,
    avgDuration: '08:45',
    aiAlerts: 0,
    specialty: 'Billing'
  },
  { 
    id: 'AGT-003', 
    name: 'Gamma Support', 
    status: 'online',
    currentSession: null,
    sessionsToday: 6,
    avgRating: 4.9,
    avgDuration: '15:20',
    aiAlerts: 0,
    specialty: 'Onboarding'
  },
  { 
    id: 'AGT-004', 
    name: 'Delta Support', 
    status: 'offline',
    currentSession: null,
    sessionsToday: 10,
    avgRating: 4.5,
    avgDuration: '10:15',
    aiAlerts: 2,
    specialty: 'Technical'
  }
];

const metrics = {
  totalAgents: 12,
  onlineNow: 8,
  busyNow: 3,
  avgSatisfaction: 4.7,
  sessionsToday: 89,
  aiAlertsToday: 5
};

const scheduleData = [
  { time: '09:00', agent: 'Alpha', status: 'available' },
  { time: '10:00', agent: 'Beta', status: 'session' },
  { time: '11:00', agent: 'Gamma', status: 'break' },
  { time: '12:00', agent: 'Delta', status: 'available' }
];

const weeklyPerformance = [
  { day: 'Mon', sessions: 45, satisfaction: 4.6 },
  { day: 'Tue', sessions: 52, satisfaction: 4.7 },
  { day: 'Wed', sessions: 48, satisfaction: 4.8 },
  { day: 'Thu', sessions: 55, satisfaction: 4.5 },
  { day: 'Fri', sessions: 42, satisfaction: 4.9 }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-500/20 text-green-400';
    case 'busy': return 'bg-yellow-500/20 text-yellow-400';
    case 'offline': return 'bg-slate-500/20 text-slate-400';
    default: return 'bg-muted text-muted-foreground';
  }
};

export function AssistManagerScreen() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/20 rounded-xl">
            <Headphones className="h-8 w-8 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Assist Manager</h1>
            <p className="text-muted-foreground">Manage Safe Assist Agents & Performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button>
            <Users className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.totalAgents}</p>
            <p className="text-xs text-muted-foreground">Total Agents</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.onlineNow}</p>
            <p className="text-xs text-muted-foreground">Online Now</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.busyNow}</p>
            <p className="text-xs text-muted-foreground">Busy Now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 mx-auto text-amber-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.avgSatisfaction}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto text-cyan-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.sessionsToday}</p>
            <p className="text-xs text-muted-foreground">Sessions Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-red-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.aiAlertsToday}</p>
            <p className="text-xs text-muted-foreground">AI Alerts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Support Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agents.map((agent) => (
                <div key={agent.id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.id} • {agent.specialty}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-medium">{agent.currentSession || '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Today</p>
                      <p className="font-medium">{agent.sessionsToday} sessions</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rating</p>
                      <p className="font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400" />
                        {agent.avgRating}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Time</p>
                      <p className="font-medium">{agent.avgDuration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">AI Alerts</p>
                      <p className={`font-medium ${agent.aiAlerts > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {agent.aiAlerts}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="h-3 w-3 mr-1" /> Stats
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Calendar className="h-3 w-3 mr-1" /> Schedule
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" /> Settings
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Weekly Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyPerformance.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="font-medium w-12">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <Progress value={(day.sessions / 60) * 100} className="h-2" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>{day.sessions}</span>
                      <span className="flex items-center text-amber-400">
                        <Star className="h-3 w-3 mr-1" />
                        {day.satisfaction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                View All Active Sessions
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Review AI Alerts
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Performance Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Schedules
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
