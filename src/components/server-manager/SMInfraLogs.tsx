// ==============================================
// Infrastructure Logs
// Deploys, Restarts, Scaling, Access Changes
// Immutable Audit Trail
// ==============================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ScrollText, Search, Filter, Download, Lock,
  Rocket, RotateCcw, Scale, Shield, AlertTriangle,
  CheckCircle, Clock, Server
} from 'lucide-react';
import { toast } from 'sonner';

interface InfraLog {
  id: string;
  timestamp: string;
  category: 'deploy' | 'restart' | 'scaling' | 'access' | 'security' | 'backup';
  action: string;
  actor: string; // Masked ID
  target: string;
  status: 'success' | 'failed' | 'pending';
  details: string;
  checksum: string;
}

export function SMInfraLogs() {
  const [logs] = useState<InfraLog[]>([
    {
      id: 'log-001',
      timestamp: '2024-01-30 14:45:32',
      category: 'deploy',
      action: 'DEPLOYMENT_STARTED',
      actor: 'SM-****42',
      target: 'app-server-1',
      status: 'success',
      details: 'Deployed v2.4.1 via CI/CD pipeline',
      checksum: 'sha256:a1b2c3d4...',
    },
    {
      id: 'log-002',
      timestamp: '2024-01-30 14:30:15',
      category: 'restart',
      action: 'SERVICE_RESTART',
      actor: 'SM-****42',
      target: 'redis-cache',
      status: 'success',
      details: 'Manual restart due to high memory usage',
      checksum: 'sha256:e5f6g7h8...',
    },
    {
      id: 'log-003',
      timestamp: '2024-01-30 14:00:00',
      category: 'scaling',
      action: 'AUTO_SCALE_UP',
      actor: 'SYSTEM',
      target: 'api-gateway',
      status: 'success',
      details: 'Scaled from 3 to 5 instances (CPU threshold)',
      checksum: 'sha256:i9j0k1l2...',
    },
    {
      id: 'log-004',
      timestamp: '2024-01-30 13:45:00',
      category: 'access',
      action: 'IP_ALLOWLIST_UPDATE',
      actor: 'SM-****42',
      target: 'firewall-rules',
      status: 'success',
      details: 'Added new office IP to allowlist',
      checksum: 'sha256:m3n4o5p6...',
    },
    {
      id: 'log-005',
      timestamp: '2024-01-30 12:30:00',
      category: 'security',
      action: 'SECRET_ROTATION',
      actor: 'SM-****42',
      target: 'JWT_SIGNING_KEY',
      status: 'success',
      details: 'Rotated encryption key per policy',
      checksum: 'sha256:q7r8s9t0...',
    },
    {
      id: 'log-006',
      timestamp: '2024-01-30 10:00:00',
      category: 'backup',
      action: 'BACKUP_COMPLETED',
      actor: 'SYSTEM',
      target: 'primary-db',
      status: 'success',
      details: 'Daily full backup completed (45.2 GB)',
      checksum: 'sha256:u1v2w3x4...',
    },
    {
      id: 'log-007',
      timestamp: '2024-01-30 09:15:00',
      category: 'deploy',
      action: 'ROLLBACK_INITIATED',
      actor: 'SM-****42',
      target: 'app-server-2',
      status: 'success',
      details: 'Rollback from v2.4.0 to v2.3.9',
      checksum: 'sha256:y5z6a7b8...',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'deploy': return Rocket;
      case 'restart': return RotateCcw;
      case 'scaling': return Scale;
      case 'access': return Shield;
      case 'security': return Lock;
      case 'backup': return Server;
      default: return ScrollText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'deploy': return 'bg-blue-500/20 text-blue-400';
      case 'restart': return 'bg-orange-500/20 text-orange-400';
      case 'scaling': return 'bg-purple-500/20 text-purple-400';
      case 'access': return 'bg-green-500/20 text-green-400';
      case 'security': return 'bg-red-500/20 text-red-400';
      case 'backup': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400 animate-pulse" />;
      default: return null;
    }
  };

  const handleExport = () => {
    toast.error('BLOCKED: Log export requires Admin approval');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-primary" />
          Infrastructure Logs
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            <Lock className="h-3 w-3 mr-1" />
            Immutable
          </Badge>
          <Button size="sm" variant="outline" onClick={handleExport} className="text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export (Approval)
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="deploy">Deployments</SelectItem>
            <SelectItem value="restart">Restarts</SelectItem>
            <SelectItem value="scaling">Scaling</SelectItem>
            <SelectItem value="access">Access</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="backup">Backups</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredLogs.map(log => {
              const CategoryIcon = getCategoryIcon(log.category);
              
              return (
                <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(log.category)}`}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-sm">{log.action}</span>
                          {getStatusIcon(log.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Target: {log.target}</span>
                          <span>Actor: {log.actor}</span>
                          <span className="font-mono text-[10px] opacity-50">{log.checksum}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getCategoryColor(log.category)} variant="outline">
                        {log.category}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        {log.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filteredLogs.length} of {logs.length} logs</span>
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          All logs are cryptographically signed and immutable
        </span>
      </div>
    </div>
  );
}
