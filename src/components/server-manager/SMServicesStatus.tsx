// ==============================================
// Services Status Monitor
// App / DB / Cache / Queue / API Status
// ==============================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Server, Database, Layers, MessageSquare, Globe, 
  CheckCircle, AlertTriangle, XCircle, RefreshCw,
  Clock, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  type: 'app' | 'database' | 'cache' | 'queue' | 'api';
  status: 'running' | 'degraded' | 'stopped' | 'starting' | 'stopping';
  version: string;
  uptime: string;
  latency: number;
  lastRestart: string;
  connections: number;
  errors24h: number;
}

export function SMServicesStatus() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restartingService, setRestartingService] = useState<string | null>(null);

  useEffect(() => {
    const mockServices: Service[] = [
      {
        id: 'svc-app-1',
        name: 'Main Application',
        type: 'app',
        status: 'running',
        version: 'v2.4.1',
        uptime: '15d 8h',
        latency: 45,
        lastRestart: '2024-01-15 03:00',
        connections: 1250,
        errors24h: 12,
      },
      {
        id: 'svc-db-1',
        name: 'PostgreSQL Primary',
        type: 'database',
        status: 'running',
        version: '15.4',
        uptime: '30d 12h',
        latency: 8,
        lastRestart: '2023-12-31 00:00',
        connections: 85,
        errors24h: 0,
      },
      {
        id: 'svc-cache-1',
        name: 'Redis Cache',
        type: 'cache',
        status: 'degraded',
        version: '7.2.3',
        uptime: '5d 2h',
        latency: 120,
        lastRestart: '2024-01-25 14:30',
        connections: 450,
        errors24h: 45,
      },
      {
        id: 'svc-queue-1',
        name: 'Message Queue',
        type: 'queue',
        status: 'running',
        version: '3.12.0',
        uptime: '10d 6h',
        latency: 15,
        lastRestart: '2024-01-20 08:00',
        connections: 32,
        errors24h: 3,
      },
      {
        id: 'svc-api-1',
        name: 'API Gateway',
        type: 'api',
        status: 'running',
        version: 'v1.8.0',
        uptime: '15d 8h',
        latency: 22,
        lastRestart: '2024-01-15 03:00',
        connections: 2500,
        errors24h: 8,
      },
    ];

    setServices(mockServices);
    setIsLoading(false);
  }, []);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'app': return Server;
      case 'database': return Database;
      case 'cache': return Layers;
      case 'queue': return MessageSquare;
      case 'api': return Globe;
      default: return Server;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'stopped': return XCircle;
      case 'starting':
      case 'stopping': return RefreshCw;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'degraded': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'stopped': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'starting':
      case 'stopping': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleRestart = async (serviceId: string, serviceName: string) => {
    setRestartingService(serviceId);
    toast.info(`Restarting ${serviceName}...`);
    
    // Simulate restart
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setServices(prev => prev.map(svc => 
      svc.id === serviceId 
        ? { ...svc, status: 'running' as const, uptime: '0m', lastRestart: new Date().toISOString() }
        : svc
    ));
    
    setRestartingService(null);
    toast.success(`${serviceName} restarted successfully`);
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          Services Status
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-400">
            {services.filter(s => s.status === 'running').length} Running
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400">
            {services.filter(s => s.status === 'degraded').length} Degraded
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {services.map(service => {
          const ServiceIcon = getServiceIcon(service.type);
          const StatusIcon = getStatusIcon(service.status);
          const isRestarting = restartingService === service.id;

          return (
            <Card key={service.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <ServiceIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{service.name}</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {service.version}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Uptime: {service.uptime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {service.latency}ms
                        </span>
                        <span>Connections: {service.connections}</span>
                        <span className={service.errors24h > 10 ? 'text-yellow-400' : ''}>
                          Errors (24h): {service.errors24h}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(service.status)}>
                      <StatusIcon className={`h-3 w-3 mr-1 ${isRestarting ? 'animate-spin' : ''}`} />
                      {isRestarting ? 'RESTARTING' : service.status.toUpperCase()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestart(service.id, service.name)}
                      disabled={isRestarting}
                      className="text-xs"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${isRestarting ? 'animate-spin' : ''}`} />
                      Restart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
