// Continent Super Admin - Approvals Screen
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowUpCircle, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ApprovalsView = () => {
  const approvals = [
    { id: 'APR-001', requestedBy: 'John Okafor', country: 'Nigeria', impact: 'High', status: 'Pending', type: 'Budget Increase' },
    { id: 'APR-002', requestedBy: 'Mary Wanjiku', country: 'Kenya', impact: 'Medium', status: 'Pending', type: 'New Hire' },
    { id: 'APR-003', requestedBy: 'David Nkosi', country: 'South Africa', impact: 'Critical', status: 'Pending', type: 'Policy Change' },
    { id: 'APR-004', requestedBy: 'Kwame Asante', country: 'Ghana', impact: 'Low', status: 'Pending', type: 'Resource Request' },
    { id: 'APR-005', requestedBy: 'Ahmed Hassan', country: 'Egypt', impact: 'High', status: 'Pending', type: 'Contract Extension' },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'bg-red-500/20 text-red-500';
      case 'High': return 'bg-amber-500/20 text-amber-500';
      case 'Medium': return 'bg-blue-500/20 text-blue-500';
      case 'Low': return 'bg-emerald-500/20 text-emerald-500';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
        <p className="text-muted-foreground">Review and manage pending approvals</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ClipboardCheck className="h-5 w-5" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Approval ID</TableHead>
                <TableHead className="text-muted-foreground">Requested By</TableHead>
                <TableHead className="text-muted-foreground">Country</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Impact</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((approval, index) => (
                <motion.tr
                  key={approval.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-border"
                >
                  <TableCell className="font-mono text-foreground">{approval.id}</TableCell>
                  <TableCell className="text-foreground">{approval.requestedBy}</TableCell>
                  <TableCell className="text-muted-foreground">{approval.country}</TableCell>
                  <TableCell className="text-muted-foreground">{approval.type}</TableCell>
                  <TableCell>
                    <Badge className={getImpactColor(approval.impact)}>
                      {approval.impact}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{approval.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" className="border-border">
                        <ArrowUpCircle className="h-4 w-4 mr-1" />
                        Escalate
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalsView;
