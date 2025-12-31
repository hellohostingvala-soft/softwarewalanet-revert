// ==============================================
// Database Health Monitor
// Health & Connections Only - Slow Query Metadata
// Row/PII Access BLOCKED
// ==============================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, Activity, Clock, AlertTriangle,
  CheckCircle, Zap, Server, Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseMetrics {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  connections: {
    active: number;
    idle: number;
    max: number;
  };
  replication: {
    lag: number;
    status: 'synced' | 'lagging' | 'disconnected';
  };
  storage: {
    used: number;
    total: number;
  };
  uptime: string;
  version: string;
}

interface SlowQuery {
  id: string;
  duration: number;
  calls: number;
  avgTime: number;
  queryPattern: string; // Masked pattern, not actual query
  lastSeen: string;
}

export function SMDatabaseHealth() {
  const [databases, setDatabases] = useState<DatabaseMetrics[]>([]);
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated data - no actual DB access
    const mockDatabases: DatabaseMetrics[] = [
      {
        name: 'Primary PostgreSQL',
        status: 'healthy',
        connections: { active: 45, idle: 20, max: 100 },
        replication: { lag: 0.2, status: 'synced' },
        storage: { used: 125, total: 500 },
        uptime: '30d 12h',
        version: 'PostgreSQL 15.4',
      },
      {
        name: 'Read Replica 1',
        status: 'healthy',
        connections: { active: 30, idle: 10, max: 100 },
        replication: { lag: 0.5, status: 'synced' },
        storage: { used: 125, total: 500 },
        uptime: '30d 12h',
        version: 'PostgreSQL 15.4',
      },
      {
        name: 'Read Replica 2',
        status: 'degraded',
        connections: { active: 85, idle: 5, max: 100 },
        replication: { lag: 15, status: 'lagging' },
        storage: { used: 120, total: 500 },
        uptime: '15d 8h',
        version: 'PostgreSQL 15.4',
      },
    ];

    const mockSlowQueries: SlowQuery[] = [
      {
        id: 'sq-001',
        duration: 2500,
        calls: 1250,
        avgTime: 450,
        queryPattern: 'SELECT FROM [TABLE_A] JOIN [TABLE_B] WHERE [CONDITION]',
        lastSeen: '5 min ago',
      },
      {
        id: 'sq-002',
        duration: 1800,
        calls: 890,
        avgTime: 320,
        queryPattern: 'UPDATE [TABLE_C] SET [COLUMNS] WHERE [CONDITION]',
        lastSeen: '12 min ago',
      },
      {
        id: 'sq-003',
        duration: 3200,
        calls: 450,
        avgTime: 780,
        queryPattern: 'SELECT DISTINCT FROM [TABLE_D] GROUP BY [COLUMNS]',
        lastSeen: '2 min ago',
      },
    ];

    setDatabases(mockDatabases);
    setSlowQueries(mockSlowQueries);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'synced':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'degraded':
      case 'lagging':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'down':
      case 'disconnected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleAccessData = () => {
    toast.error('BLOCKED: Direct database row/PII access not allowed for Server Manager');
  };

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
    <div className="space-y-6">
      {/* Security Notice */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm text-red-400">
            <Lock className="h-4 w-4" />
            <span>Health metrics and query patterns only. Row-level data and PII access is blocked.</span>
          </div>
        </CardContent>
      </Card>

      {/* Database Instances */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Database Instances
        </h2>

        <div className="grid gap-4">
          {databases.map(db => (
            <Card key={db.name} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{db.name}</CardTitle>
                    <Badge variant="outline" className="text-xs font-mono">
                      {db.version}
                    </Badge>
                  </div>
                  <Badge className={getStatusColor(db.status)}>
                    {db.status === 'healthy' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {db.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Connections */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Connections</span>
                      <span>{db.connections.active}/{db.connections.max}</span>
                    </div>
                    <Progress 
                      value={(db.connections.active / db.connections.max) * 100} 
                      className="h-2" 
                    />
                    <div className="text-xs text-muted-foreground">
                      Active: {db.connections.active} | Idle: {db.connections.idle}
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Storage</span>
                      <span>{db.storage.used}/{db.storage.total} GB</span>
                    </div>
                    <Progress 
                      value={(db.storage.used / db.storage.total) * 100} 
                      className="h-2" 
                    />
                    <div className="text-xs text-muted-foreground">
                      {((db.storage.used / db.storage.total) * 100).toFixed(1)}% used
                    </div>
                  </div>

                  {/* Replication */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Replication</span>
                      <Badge className={getStatusColor(db.replication.status)} variant="outline">
                        {db.replication.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Lag: {db.replication.lag}s
                    </div>
                  </div>

                  {/* Uptime */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Uptime</span>
                    </div>
                    <div className="text-sm font-medium">{db.uptime}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Slow Queries (Metadata Only) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Slow Query Patterns
          </h2>
          <Badge variant="outline" className="text-xs">
            Metadata Only • No Actual Queries
          </Badge>
        </div>

        <div className="space-y-3">
          {slowQueries.map(query => (
            <Card key={query.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="font-mono text-sm">{query.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {query.lastSeen}
                  </div>
                </div>

                <div className="bg-muted/50 p-2 rounded font-mono text-xs mb-3 text-muted-foreground">
                  {query.queryPattern}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Duration:</span>
                    <span className="ml-2 font-mono">{query.duration}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Calls:</span>
                    <span className="ml-2 font-mono">{query.calls}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Time:</span>
                    <span className="ml-2 font-mono">{query.avgTime}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
