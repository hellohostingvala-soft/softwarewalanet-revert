// ==============================================
// System Health Monitor
// CPU / RAM / Disk / Network - Real-time
// ==============================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Cpu, HardDrive, MemoryStick, Network, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface HealthMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface ServerNode {
  id: string;
  name: string;
  region: string;
  status: 'online' | 'degraded' | 'offline';
  cpu: HealthMetric;
  ram: HealthMetric;
  disk: HealthMetric;
  network: HealthMetric;
  uptime: string;
  lastCheck: string;
}

export function SMSystemHealth() {
  const [nodes, setNodes] = useState<ServerNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated real-time health data
    const mockNodes: ServerNode[] = [
      {
        id: 'node-1',
        name: 'Primary App Server',
        region: 'us-east-1',
        status: 'online',
        cpu: { name: 'CPU', value: 42, max: 100, unit: '%', status: 'healthy', trend: 'stable' },
        ram: { name: 'RAM', value: 68, max: 100, unit: '%', status: 'warning', trend: 'up' },
        disk: { name: 'Disk', value: 55, max: 100, unit: '%', status: 'healthy', trend: 'stable' },
        network: { name: 'Network', value: 120, max: 1000, unit: 'Mbps', status: 'healthy', trend: 'stable' },
        uptime: '45d 12h 30m',
        lastCheck: '10s ago',
      },
      {
        id: 'node-2',
        name: 'Database Server',
        region: 'us-east-1',
        status: 'online',
        cpu: { name: 'CPU', value: 35, max: 100, unit: '%', status: 'healthy', trend: 'down' },
        ram: { name: 'RAM', value: 78, max: 100, unit: '%', status: 'warning', trend: 'stable' },
        disk: { name: 'Disk', value: 72, max: 100, unit: '%', status: 'warning', trend: 'up' },
        network: { name: 'Network', value: 85, max: 1000, unit: 'Mbps', status: 'healthy', trend: 'stable' },
        uptime: '30d 8h 15m',
        lastCheck: '8s ago',
      },
      {
        id: 'node-3',
        name: 'Cache Server',
        region: 'us-west-2',
        status: 'degraded',
        cpu: { name: 'CPU', value: 88, max: 100, unit: '%', status: 'critical', trend: 'up' },
        ram: { name: 'RAM', value: 92, max: 100, unit: '%', status: 'critical', trend: 'up' },
        disk: { name: 'Disk', value: 45, max: 100, unit: '%', status: 'healthy', trend: 'stable' },
        network: { name: 'Network', value: 450, max: 1000, unit: 'Mbps', status: 'healthy', trend: 'up' },
        uptime: '12d 4h 45m',
        lastCheck: '5s ago',
      },
    ];

    setNodes(mockNodes);
    setIsLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        cpu: { ...node.cpu, value: Math.min(100, Math.max(10, node.cpu.value + (Math.random() - 0.5) * 10)) },
        ram: { ...node.ram, value: Math.min(100, Math.max(20, node.ram.value + (Math.random() - 0.5) * 5)) },
        lastCheck: 'just now',
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical':
      case 'offline':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const MetricCard = ({ metric, icon: Icon }: { metric: HealthMetric; icon: React.ElementType }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{metric.name}</span>
        </div>
        <span className="text-sm font-mono">
          {metric.value.toFixed(1)}{metric.unit}
        </span>
      </div>
      <div className="relative">
        <Progress value={(metric.value / metric.max) * 100} className="h-2" />
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all ${getProgressColor(metric.status)}`}
          style={{ width: `${(metric.value / metric.max) * 100}%` }}
        />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          System Health
        </h2>
        <Badge variant="outline" className="font-mono text-xs">
          Live • Auto-refresh 5s
        </Badge>
      </div>

      <div className="grid gap-4">
        {nodes.map(node => (
          <Card key={node.id} className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{node.name}</CardTitle>
                  <Badge variant="outline" className="text-xs font-mono">
                    {node.region}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(node.status)}>
                    {node.status === 'online' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {node.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Uptime: {node.uptime}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard metric={node.cpu} icon={Cpu} />
                <MetricCard metric={node.ram} icon={MemoryStick} />
                <MetricCard metric={node.disk} icon={HardDrive} />
                <MetricCard metric={node.network} icon={Network} />
              </div>
              <div className="mt-3 text-xs text-muted-foreground text-right">
                Last check: {node.lastCheck}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
