// Support Section
// Priority inbox + action-in-notification

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

const SupportSection = () => {
  const tickets = [
    { id: 'TCK-001', subject: 'Payment issue', priority: 'critical', status: 'open', date: '2024-01-16' },
    { id: 'TCK-002', subject: 'Product question', priority: 'high', status: 'pending', date: '2024-01-17' },
    { id: 'TCK-003', subject: 'Feature request', priority: 'low', status: 'resolved', date: '2024-01-14' },
  ];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-500/10 text-red-500',
      high: 'bg-orange-500/10 text-orange-500',
      low: 'bg-green-500/10 text-green-500',
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      open: 'bg-blue-500/10 text-blue-500',
      pending: 'bg-yellow-500/10 text-yellow-500',
      resolved: 'bg-green-500/10 text-green-500',
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Support Tickets</h3>
        <Button>New Ticket</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  {getPriorityIcon(ticket.priority)}
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">{ticket.id} • {ticket.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getPriorityBadge(ticket.priority)}
                  {getStatusBadge(ticket.status)}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Reply</Button>
                    {ticket.status !== 'resolved' && (
                      <>
                        <Button size="sm" variant="outline">Resolve</Button>
                        <Button size="sm" variant="destructive">Close</Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportSection;
