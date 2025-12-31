import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpRight, 
  Clock,
  Scale,
  Shield,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  User
} from 'lucide-react';

interface Escalation {
  id: string;
  resellerId: string;
  resellerName: string;
  escalatedTo: 'legal' | 'admin' | 'pro' | 'finance';
  reason: string;
  priority: 'critical' | 'high' | 'medium';
  escalatedAt: string;
  status: 'pending' | 'in_progress' | 'resolved';
  assignedTo?: string;
  resolution?: string;
}

const mockEscalations: Escalation[] = [
  {
    id: '1',
    resellerId: 'VL-RS-4521',
    resellerName: 'Quick Sales Corp',
    escalatedTo: 'legal',
    reason: 'Trademark violation - using modified company logo without authorization',
    priority: 'critical',
    escalatedAt: '2024-01-15T09:30:00Z',
    status: 'in_progress',
    assignedTo: 'Legal Team'
  },
  {
    id: '2',
    resellerId: 'VL-RS-7832',
    resellerName: 'Metro Distributors',
    escalatedTo: 'admin',
    reason: 'Repeated policy violations - 3rd warning issued',
    priority: 'high',
    escalatedAt: '2024-01-14T15:00:00Z',
    status: 'pending'
  },
  {
    id: '3',
    resellerId: 'VL-RS-8923',
    resellerName: 'Rapid Leads Inc',
    escalatedTo: 'pro',
    reason: 'Confirmed fraud pattern - requires professional investigation',
    priority: 'critical',
    escalatedAt: '2024-01-13T11:45:00Z',
    status: 'in_progress',
    assignedTo: 'Fraud Investigation'
  },
  {
    id: '4',
    resellerId: 'VL-RS-1234',
    resellerName: 'Quick Connect Sales',
    escalatedTo: 'admin',
    reason: 'Territory dispute resolution required',
    priority: 'medium',
    escalatedAt: '2024-01-12T08:20:00Z',
    status: 'resolved',
    resolution: 'Territory reassigned with mutual agreement'
  }
];

export const RMEscalations: React.FC = () => {
  const [escalations] = useState<Escalation[]>(mockEscalations);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');

  const getTeamIcon = (team: string) => {
    switch (team) {
      case 'legal':
        return <Scale className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'pro':
        return <User className="h-4 w-4" />;
      case 'finance':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <ArrowUpRight className="h-4 w-4" />;
    }
  };

  const getTeamColor = (team: string) => {
    switch (team) {
      case 'legal':
        return 'bg-purple-500/10 text-purple-500';
      case 'admin':
        return 'bg-blue-500/10 text-blue-500';
      case 'pro':
        return 'bg-cyan-500/10 text-cyan-500';
      case 'finance':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/30',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-500/10 text-yellow-500', icon: Clock },
      in_progress: { color: 'bg-blue-500/10 text-blue-500', icon: ArrowUpRight },
      resolved: { color: 'bg-green-500/10 text-green-500', icon: CheckCircle }
    };
    const cfg = config[status as keyof typeof config] || config.pending;
    const Icon = cfg.icon;
    return (
      <Badge className={cfg.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const filteredEscalations = escalations.filter(e => 
    filter === 'all' || e.status === filter
  );

  const pendingCount = escalations.filter(e => e.status === 'pending').length;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            Escalations
          </CardTitle>
          <Badge variant="outline" className={pendingCount > 0 ? 'bg-yellow-500/10 text-yellow-500' : ''}>
            {pendingCount} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['all', 'pending', 'in_progress', 'resolved'] as const).map((status) => (
            <Badge
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => setFilter(status)}
            >
              {status.replace('_', ' ')}
            </Badge>
          ))}
        </div>

        <div className="space-y-4">
          {filteredEscalations.map((escalation) => (
            <motion.div
              key={escalation.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`border rounded-lg p-4 ${
                escalation.status === 'resolved' 
                  ? 'bg-muted/20 border-border' 
                  : 'bg-background border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getTeamColor(escalation.escalatedTo)}`}>
                    {getTeamIcon(escalation.escalatedTo)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground capitalize">
                        Escalated to {escalation.escalatedTo}
                      </span>
                      {getPriorityBadge(escalation.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {escalation.resellerName} ({escalation.resellerId})
                    </p>
                  </div>
                </div>
                {getStatusBadge(escalation.status)}
              </div>

              <p className="text-sm text-foreground mb-2">{escalation.reason}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Escalated: {new Date(escalation.escalatedAt).toLocaleString()}</span>
                {escalation.assignedTo && (
                  <span>Assigned to: {escalation.assignedTo}</span>
                )}
              </div>

              {escalation.resolution && (
                <div className="mt-3 p-2 bg-green-500/10 rounded-lg">
                  <p className="text-xs text-green-500">
                    <strong>Resolution:</strong> {escalation.resolution}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredEscalations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
            <p>No escalations in this category</p>
          </div>
        )}

        <div className="mt-4 p-3 bg-muted/30 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Escalation Targets:</strong> Legal Team • Admin • Professional Services
            <br />
            <strong>Note:</strong> Finance escalations are blocked - Reseller Manager has no financial access
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
