// Continent Super Admin - Audit Screen (Read-Only)
import { motion } from 'framer-motion';
import { FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AuditView = () => {
  const auditLogs = [
    { timestamp: '2024-01-15 14:32:45', role: 'Area Manager', country: 'Nigeria', action: 'Approved Budget Request', result: 'Success' },
    { timestamp: '2024-01-15 14:28:12', role: 'Area Manager', country: 'Kenya', action: 'Created Task', result: 'Success' },
    { timestamp: '2024-01-15 14:15:33', role: 'Continent SA', country: 'All', action: 'Reviewed Performance Report', result: 'Success' },
    { timestamp: '2024-01-15 13:45:21', role: 'Area Manager', country: 'Egypt', action: 'Escalated Issue', result: 'Pending' },
    { timestamp: '2024-01-15 13:30:00', role: 'Area Manager', country: 'South Africa', action: 'Updated Sales Target', result: 'Success' },
    { timestamp: '2024-01-15 12:55:18', role: 'Area Manager', country: 'Ghana', action: 'Login', result: 'Success' },
    { timestamp: '2024-01-15 12:45:09', role: 'Continent SA', country: 'All', action: 'Rejected Approval', result: 'Success' },
    { timestamp: '2024-01-15 12:30:44', role: 'Area Manager', country: 'Morocco', action: 'Submitted Report', result: 'Success' },
    { timestamp: '2024-01-15 11:20:33', role: 'Area Manager', country: 'Nigeria', action: 'Failed Login Attempt', result: 'Failed' },
    { timestamp: '2024-01-15 11:00:00', role: 'Continent SA', country: 'All', action: 'System Health Check', result: 'Success' },
  ];

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Success': return 'bg-emerald-500/20 text-emerald-500';
      case 'Failed': return 'bg-red-500/20 text-red-500';
      case 'Pending': return 'bg-amber-500/20 text-amber-500';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit</h1>
        <p className="text-muted-foreground">Read-only audit trail (No export, copy, or download)</p>
      </div>

      {/* Security Notice */}
      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-amber-500">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">
              This is a read-only view. Export, copy, and download are disabled for security.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Audit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">1,247</p>
              <p className="text-sm text-muted-foreground">Total Logs Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">1,189</p>
              <p className="text-sm text-muted-foreground">Successful</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">23</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">35</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5" />
            Recent Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="select-none" 
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Timestamp</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">Country</TableHead>
                  <TableHead className="text-muted-foreground">Action</TableHead>
                  <TableHead className="text-muted-foreground">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-border"
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {log.timestamp}
                    </TableCell>
                    <TableCell className="text-foreground">{log.role}</TableCell>
                    <TableCell className="text-muted-foreground">{log.country}</TableCell>
                    <TableCell className="text-foreground">{log.action}</TableCell>
                    <TableCell>
                      <Badge className={getResultColor(log.result)}>
                        {log.result}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditView;
