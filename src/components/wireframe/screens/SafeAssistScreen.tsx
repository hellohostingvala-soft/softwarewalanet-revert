import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Eye, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Monitor,
  MousePointer,
  Lock,
  Unlock,
  Phone,
  Video,
  MessageSquare,
  Activity,
  Zap
} from 'lucide-react';

// Mock active sessions
const activeSessions = [
  { 
    id: 'SA-001', 
    clientName: 'CLI***042', 
    agentName: 'AGT-Alpha', 
    status: 'active',
    duration: '12:34',
    aiRiskScore: 12,
    consentGiven: true,
    dualVerified: true,
    actionsCount: 8
  },
  { 
    id: 'SA-002', 
    clientName: 'CLI***089', 
    agentName: 'AGT-Beta', 
    status: 'pending_consent',
    duration: '02:15',
    aiRiskScore: 0,
    consentGiven: false,
    dualVerified: true,
    actionsCount: 0
  },
  { 
    id: 'SA-003', 
    clientName: 'CLI***156', 
    agentName: 'AGT-Gamma', 
    status: 'ai_alert',
    duration: '08:45',
    aiRiskScore: 67,
    consentGiven: true,
    dualVerified: true,
    actionsCount: 23
  },
  { 
    id: 'SA-004', 
    clientName: 'CLI***203', 
    agentName: 'AGT-Delta', 
    status: 'terminated',
    duration: '15:22',
    aiRiskScore: 89,
    consentGiven: true,
    dualVerified: true,
    actionsCount: 45
  }
];

const metrics = {
  activeSessions: 3,
  totalToday: 24,
  avgDuration: '8:45',
  aiAlerts: 2,
  terminatedByAI: 1,
  satisfactionRate: 96
};

const recentAlerts = [
  { time: '2 min ago', session: 'SA-003', type: 'Unusual navigation pattern', severity: 'medium' },
  { time: '5 min ago', session: 'SA-004', type: 'Attempted data export', severity: 'critical' },
  { time: '12 min ago', session: 'SA-001', type: 'Extended idle time', severity: 'low' },
  { time: '18 min ago', session: 'SA-003', type: 'Multiple failed actions', severity: 'medium' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/20 text-green-400';
    case 'pending_consent': return 'bg-yellow-500/20 text-yellow-400';
    case 'ai_alert': return 'bg-red-500/20 text-red-400';
    case 'terminated': return 'bg-slate-500/20 text-slate-400';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getRiskColor = (score: number) => {
  if (score >= 70) return 'text-red-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-green-500';
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-500/20 text-red-400';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400';
    case 'low': return 'bg-blue-500/20 text-blue-400';
    default: return 'bg-muted text-muted-foreground';
  }
};

export function SafeAssistScreen() {
  const [sessionCode, setSessionCode] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/20 rounded-xl">
            <Shield className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Safe Assist</h1>
            <p className="text-muted-foreground">AI-Monitored Remote Support Sessions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Enter session code..." 
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              className="w-48"
            />
            <Button>
              <Video className="h-4 w-4 mr-2" />
              Join Session
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <Monitor className="h-6 w-6 mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.activeSessions}</p>
            <p className="text-xs text-muted-foreground">Active Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.totalToday}</p>
            <p className="text-xs text-muted-foreground">Total Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-cyan-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.avgDuration}</p>
            <p className="text-xs text-muted-foreground">Avg Duration</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.aiAlerts}</p>
            <p className="text-xs text-muted-foreground">AI Alerts</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto text-red-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.terminatedByAI}</p>
            <p className="text-xs text-muted-foreground">AI Terminated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-400 mb-2" />
            <p className="text-2xl font-bold">{metrics.satisfactionRate}%</p>
            <p className="text-xs text-muted-foreground">Satisfaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Sessions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Sessions
              <Badge className="bg-green-500/20 text-green-400 ml-auto">
                {metrics.activeSessions} Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm">{session.id}</span>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{session.duration}</span>
                      {session.status === 'active' && (
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Client</p>
                      <p className="font-medium">{session.clientName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Agent</p>
                      <p className="font-medium">{session.agentName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">AI Risk</p>
                      <p className={`font-bold ${getRiskColor(session.aiRiskScore)}`}>
                        {session.aiRiskScore}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Actions</p>
                      <p className="font-medium">{session.actionsCount}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-1 text-xs">
                      {session.consentGiven ? (
                        <><Unlock className="h-3 w-3 text-green-400" /> Consent</>
                      ) : (
                        <><Lock className="h-3 w-3 text-yellow-400" /> Pending</>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {session.dualVerified ? (
                        <><CheckCircle2 className="h-3 w-3 text-green-400" /> Verified</>
                      ) : (
                        <><AlertTriangle className="h-3 w-3 text-yellow-400" /> Unverified</>
                      )}
                    </div>
                    <div className="flex gap-2 ml-auto">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" /> Watch
                      </Button>
                      <Button size="sm" variant="destructive">
                        Terminate
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              AI Monitoring Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-sm font-medium">{alert.type}</p>
                  <p className="text-xs text-muted-foreground">Session: {alert.session}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="font-medium">AI Protection Active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All sessions are monitored in real-time. Suspicious activity triggers automatic alerts and can terminate sessions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
