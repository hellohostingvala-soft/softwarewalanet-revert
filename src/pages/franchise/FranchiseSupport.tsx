// Franchise Support
// Ticket CRUD + SLA + escalation

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import '../../../styles/premium-7d-theme.css';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  slaDeadline?: Date;
  lastUpdated: Date;
}

const FranchiseSupport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTickets([
        {
          id: '1',
          ticketNumber: 'TCK-2024-001',
          subject: 'Payment issue with order ORD-001',
          priority: 'high',
          status: 'in_progress',
          createdAt: new Date('2024-01-15'),
          slaDeadline: new Date('2024-01-17'),
          lastUpdated: new Date('2024-01-16'),
        },
        {
          id: '2',
          ticketNumber: 'TCK-2024-002',
          subject: 'Product activation failed',
          priority: 'critical',
          status: 'open',
          createdAt: new Date('2024-01-16'),
          slaDeadline: new Date('2024-01-17'),
          lastUpdated: new Date('2024-01-16'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Support</h1>
          <p className="text-gray-400">Ticket management with SLA tracking</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-500 to-cyan-500">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <Card className="bg-[#1A2236] border border-indigo-500/20">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-indigo-500/10">
                      <MessageSquare className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{ticket.subject}</p>
                      <p className="text-sm text-gray-400">{ticket.ticketNumber} • Created: {ticket.createdAt.toLocaleDateString()}</p>
                      {ticket.slaDeadline && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          SLA: {ticket.slaDeadline.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={
                      ticket.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                      ticket.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                      ticket.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-blue-500/10 text-blue-500'
                    }>
                      {ticket.priority}
                    </Badge>
                    <Badge className={
                      ticket.status === 'open' ? 'bg-blue-500/10 text-blue-500' :
                      ticket.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-500' :
                      ticket.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                      'bg-gray-500/10 text-gray-500'
                    }>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FranchiseSupport;
