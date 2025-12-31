// ==============================================
// Backup & Restore Management
// Automated Schedules - Integrity Checks
// Prod Restore → Admin Approval
// ==============================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  HardDrive, CheckCircle, Clock, AlertTriangle,
  Download, RotateCcw, Shield, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  environment: 'production' | 'staging';
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
  size: string;
  createdAt: string;
  expiresAt: string;
  integrityStatus: 'verified' | 'pending' | 'failed';
  encryptionStatus: 'encrypted' | 'not_encrypted';
}

interface BackupSchedule {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
  lastRun: string;
  isActive: boolean;
}

export function SMBackups() {
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: 'backup-001',
      name: 'Daily Full Backup',
      type: 'full',
      environment: 'production',
      status: 'completed',
      size: '45.2 GB',
      createdAt: '2024-01-30 02:00',
      expiresAt: '2024-02-29',
      integrityStatus: 'verified',
      encryptionStatus: 'encrypted',
    },
    {
      id: 'backup-002',
      name: 'Hourly Incremental',
      type: 'incremental',
      environment: 'production',
      status: 'in_progress',
      size: '2.1 GB',
      createdAt: '2024-01-30 14:00',
      expiresAt: '2024-02-06',
      integrityStatus: 'pending',
      encryptionStatus: 'encrypted',
    },
    {
      id: 'backup-003',
      name: 'Weekly Full Backup',
      type: 'full',
      environment: 'staging',
      status: 'completed',
      size: '38.7 GB',
      createdAt: '2024-01-28 03:00',
      expiresAt: '2024-03-28',
      integrityStatus: 'verified',
      encryptionStatus: 'encrypted',
    },
  ]);

  const [schedules] = useState<BackupSchedule[]>([
    {
      id: 'sched-001',
      name: 'Daily Production Full',
      frequency: 'Daily at 02:00 UTC',
      nextRun: '2024-01-31 02:00',
      lastRun: '2024-01-30 02:00',
      isActive: true,
    },
    {
      id: 'sched-002',
      name: 'Hourly Incremental',
      frequency: 'Every hour',
      nextRun: '2024-01-30 15:00',
      lastRun: '2024-01-30 14:00',
      isActive: true,
    },
    {
      id: 'sched-003',
      name: 'Weekly Staging',
      frequency: 'Sunday at 03:00 UTC',
      nextRun: '2024-02-04 03:00',
      lastRun: '2024-01-28 03:00',
      isActive: true,
    },
  ]);

  const [restoringBackup, setRestoringBackup] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleRestore = async (backupId: string, environment: string) => {
    if (environment === 'production') {
      toast.error('BLOCKED: Production restore requires Admin approval. Request submitted.');
      return;
    }

    setRestoringBackup(backupId);
    toast.info('Starting restore process...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setRestoringBackup(null);
    toast.success('Restore completed successfully');
  };

  const handleVerifyIntegrity = (backupId: string) => {
    setBackups(prev => prev.map(b => 
      b.id === backupId ? { ...b, integrityStatus: 'verified' as const } : b
    ));
    toast.success('Integrity verification completed');
  };

  return (
    <div className="space-y-6">
      {/* Backup Schedules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Backup Schedules
          </h2>
          <Badge variant="outline" className="font-mono text-xs">
            Automated
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {schedules.map(schedule => (
            <Card key={schedule.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{schedule.name}</span>
                  <Badge className={schedule.isActive ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}>
                    {schedule.isActive ? 'Active' : 'Paused'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Frequency: {schedule.frequency}</p>
                  <p>Next run: {schedule.nextRun}</p>
                  <p>Last run: {schedule.lastRun}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Backups List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            Backups
          </h2>
        </div>

        {/* Security Notice */}
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Production restore requires Admin approval. All backups are encrypted at rest.</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {backups.map(backup => (
            <Card key={backup.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {backup.type.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{backup.name}</span>
                    <Badge className={backup.environment === 'production' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}>
                      {backup.environment}
                    </Badge>
                  </div>
                  <Badge className={getStatusColor(backup.status)}>
                    {backup.status === 'in_progress' && <Clock className="h-3 w-3 mr-1 animate-pulse" />}
                    {backup.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {backup.status.toUpperCase().replace('_', ' ')}
                  </Badge>
                </div>

                {backup.status === 'in_progress' && (
                  <div className="mb-3">
                    <Progress value={65} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <span className="ml-2 font-mono">{backup.size}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2">{backup.createdAt}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="ml-2">{backup.expiresAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-400" />
                    <span className="text-green-400 text-xs">{backup.encryptionStatus}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {backup.integrityStatus === 'verified' ? (
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-yellow-400" />
                    )}
                    <span className={backup.integrityStatus === 'verified' ? 'text-green-400 text-xs' : 'text-yellow-400 text-xs'}>
                      {backup.integrityStatus}
                    </span>
                  </div>
                </div>

                {backup.status === 'completed' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(backup.id, backup.environment)}
                      disabled={restoringBackup === backup.id}
                      className="text-xs"
                    >
                      <RotateCcw className={`h-3 w-3 mr-1 ${restoringBackup === backup.id ? 'animate-spin' : ''}`} />
                      {backup.environment === 'production' ? 'Request Restore' : 'Restore'}
                    </Button>
                    {backup.integrityStatus !== 'verified' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerifyIntegrity(backup.id)}
                        className="text-xs"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Verify Integrity
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
