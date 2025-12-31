// ==============================================
// Incidents Management
// Create, Track, Escalate - No Silent Close
// ==============================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertTriangle, Plus, Clock, ArrowUpRight, 
  CheckCircle, AlertCircle, XCircle, Bell
} from 'lucide-react';
import { toast } from 'sonner';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'p1' | 'p2' | 'p3' | 'p4';
  status: 'open' | 'investigating' | 'identified' | 'monitoring' | 'resolved';
  createdAt: string;
  updatedAt: string;
  affectedServices: string[];
  escalatedTo: string | null;
  updates: { time: string; message: string; author: string }[];
}

export function SMIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'INC-001',
      title: 'High CPU usage on Cache Server',
      description: 'Redis cache server experiencing sustained high CPU utilization',
      severity: 'p2',
      status: 'investigating',
      createdAt: '2024-01-30 14:30',
      updatedAt: '2024-01-30 15:45',
      affectedServices: ['Redis Cache', 'API Gateway'],
      escalatedTo: null,
      updates: [
        { time: '14:30', message: 'Incident created', author: 'System' },
        { time: '14:45', message: 'Investigating memory patterns', author: 'SM-****42' },
        { time: '15:45', message: 'Identified potential memory leak in cache eviction', author: 'SM-****42' },
      ],
    },
    {
      id: 'INC-002',
      title: 'Intermittent API timeouts',
      description: 'Users reporting occasional 504 errors on API endpoints',
      severity: 'p3',
      status: 'monitoring',
      createdAt: '2024-01-29 09:15',
      updatedAt: '2024-01-30 10:00',
      affectedServices: ['API Gateway'],
      escalatedTo: null,
      updates: [
        { time: '09:15', message: 'Incident created from alert', author: 'System' },
        { time: '10:30', message: 'Scaling up API instances', author: 'SM-****42' },
        { time: '10:00', message: 'Monitoring after scale-up', author: 'SM-****42' },
      ],
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'p3' as const,
    affectedServices: '',
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'p1': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'p2': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'p3': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'p4': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-400';
      case 'investigating': return 'bg-orange-500/20 text-orange-400';
      case 'identified': return 'bg-yellow-500/20 text-yellow-400';
      case 'monitoring': return 'bg-blue-500/20 text-blue-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleCreateIncident = () => {
    if (!newIncident.title || !newIncident.description) {
      toast.error('Title and description are required');
      return;
    }

    const incident: Incident = {
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
      title: newIncident.title,
      description: newIncident.description,
      severity: newIncident.severity,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      affectedServices: newIncident.affectedServices.split(',').map(s => s.trim()).filter(Boolean),
      escalatedTo: null,
      updates: [{ time: 'now', message: 'Incident created', author: 'SM-****XX' }],
    };

    setIncidents([incident, ...incidents]);
    setShowCreateDialog(false);
    setNewIncident({ title: '', description: '', severity: 'p3', affectedServices: '' });
    toast.success(`Incident ${incident.id} created`);
  };

  const handleEscalate = (incidentId: string, target: 'admin' | 'super_admin') => {
    setIncidents(prev => prev.map(inc => 
      inc.id === incidentId 
        ? { 
            ...inc, 
            escalatedTo: target,
            updates: [...inc.updates, { time: 'now', message: `Escalated to ${target}`, author: 'SM-****XX' }]
          }
        : inc
    ));
    toast.success(`Incident ${incidentId} escalated to ${target.toUpperCase()}`);
  };

  const handleUpdateStatus = (incidentId: string, newStatus: Incident['status']) => {
    if (newStatus === 'resolved') {
      toast.error('BLOCKED: Silent close not allowed. Must be closed by Admin after review.');
      return;
    }

    setIncidents(prev => prev.map(inc => 
      inc.id === incidentId 
        ? { 
            ...inc, 
            status: newStatus,
            updatedAt: new Date().toISOString(),
            updates: [...inc.updates, { time: 'now', message: `Status changed to ${newStatus}`, author: 'SM-****XX' }]
          }
        : inc
    ));
    toast.success(`Status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Incidents
        </h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create New Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Incident title"
                value={newIncident.title}
                onChange={e => setNewIncident({ ...newIncident, title: e.target.value })}
              />
              <Textarea
                placeholder="Detailed description"
                value={newIncident.description}
                onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
              />
              <Select
                value={newIncident.severity}
                onValueChange={v => setNewIncident({ ...newIncident, severity: v as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p1">P1 - Critical</SelectItem>
                  <SelectItem value="p2">P2 - High</SelectItem>
                  <SelectItem value="p3">P3 - Medium</SelectItem>
                  <SelectItem value="p4">P4 - Low</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Affected services (comma-separated)"
                value={newIncident.affectedServices}
                onChange={e => setNewIncident({ ...newIncident, affectedServices: e.target.value })}
              />
              <Button onClick={handleCreateIncident} className="w-full">
                Create Incident
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {incidents.map(incident => (
          <Card key={incident.id} className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(incident.severity)}>
                    {incident.severity.toUpperCase()}
                  </Badge>
                  <span className="font-mono text-sm text-muted-foreground">{incident.id}</span>
                  <CardTitle className="text-base">{incident.title}</CardTitle>
                </div>
                <Badge className={getStatusColor(incident.status)}>
                  {incident.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {incident.affectedServices.map(service => (
                  <Badge key={service} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Created: {incident.createdAt}
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={incident.status}
                    onValueChange={v => handleUpdateStatus(incident.id, v as Incident['status'])}
                  >
                    <SelectTrigger className="h-8 text-xs w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="identified">Identified</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="resolved" disabled>Resolved (Admin only)</SelectItem>
                    </SelectContent>
                  </Select>

                  {!incident.escalatedTo && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEscalate(incident.id, 'admin')}
                        className="text-xs"
                      >
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Escalate Admin
                      </Button>
                      {incident.severity === 'p1' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleEscalate(incident.id, 'super_admin')}
                          className="text-xs"
                        >
                          <Bell className="h-3 w-3 mr-1" />
                          Super Admin
                        </Button>
                      )}
                    </>
                  )}
                  {incident.escalatedTo && (
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
                      Escalated to {incident.escalatedTo}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
