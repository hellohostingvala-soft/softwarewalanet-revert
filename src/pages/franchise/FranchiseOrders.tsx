// Franchise Orders
// Full lifecycle: init → paid → running → completed

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  CheckCircle,
  Clock,
  PlayCircle,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  Calendar,
  User,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { paymentSuccessFlow } from '@/services/franchiseFlowEngineService';
import '../../../styles/premium-7d-theme.css';

type OrderStatus = 'init' | 'paid' | 'running' | 'completed' | 'cancelled';

interface Order {
  id: string;
  orderId: string;
  productName: string;
  productId: string;
  amount: number;
  status: OrderStatus;
  createdAt: Date;
  paidAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: 'wallet' | 'razorpay' | 'payu' | 'bank' | 'binance';
  region: string;
  timeline: TimelineEvent[];
}

interface TimelineEvent {
  event: string;
  timestamp: Date;
  description: string;
}

const FranchiseOrders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);

  useEffect(() => {
    const status = searchParams.get('status') as OrderStatus | '';
    if (status) {
      setSelectedStatus(status);
    }
    loadOrders();
  }, [searchParams]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockOrders: Order[] = [
        {
          id: '1',
          orderId: 'ORD-2024-001',
          productName: 'CRM Pro',
          productId: 'prod-1',
          amount: 99,
          status: 'completed',
          createdAt: new Date('2024-01-15'),
          paidAt: new Date('2024-01-15'),
          startedAt: new Date('2024-01-15'),
          completedAt: new Date('2024-01-20'),
          customer: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1-555-0101',
          },
          paymentMethod: 'razorpay',
          region: 'Los Angeles',
          timeline: [
            { event: 'Order Created', timestamp: new Date('2024-01-15 10:00'), description: 'Order initiated' },
            { event: 'Payment Received', timestamp: new Date('2024-01-15 10:05'), description: 'Payment verified' },
            { event: 'Service Started', timestamp: new Date('2024-01-15 10:30'), description: 'Service activated' },
            { event: 'Order Completed', timestamp: new Date('2024-01-20 10:00'), description: 'Service delivered' },
          ],
        },
        {
          id: '2',
          orderId: 'ORD-2024-002',
          productName: 'Project Manager Plus',
          productId: 'prod-2',
          amount: 149,
          status: 'running',
          createdAt: new Date('2024-01-16'),
          paidAt: new Date('2024-01-16'),
          startedAt: new Date('2024-01-16'),
          customer: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1-555-0102',
          },
          paymentMethod: 'wallet',
          region: 'Los Angeles',
          timeline: [
            { event: 'Order Created', timestamp: new Date('2024-01-16 14:00'), description: 'Order initiated' },
            { event: 'Payment Received', timestamp: new Date('2024-01-16 14:05'), description: 'Payment verified' },
            { event: 'Service Started', timestamp: new Date('2024-01-16 14:30'), description: 'Service activated' },
          ],
        },
        {
          id: '3',
          orderId: 'ORD-2024-003',
          productName: 'Web Development Suite',
          productId: 'prod-3',
          amount: 299,
          status: 'paid',
          createdAt: new Date('2024-01-17'),
          paidAt: new Date('2024-01-17'),
          customer: {
            name: 'Bob Johnson',
            email: 'bob@example.com',
            phone: '+1-555-0103',
          },
          paymentMethod: 'payu',
          region: 'Los Angeles',
          timeline: [
            { event: 'Order Created', timestamp: new Date('2024-01-17 09:00'), description: 'Order initiated' },
            { event: 'Payment Received', timestamp: new Date('2024-01-17 09:05'), description: 'Payment verified' },
          ],
        },
        {
          id: '4',
          orderId: 'ORD-2024-004',
          productName: 'CRM Pro',
          productId: 'prod-1',
          amount: 99,
          status: 'init',
          createdAt: new Date('2024-01-18'),
          customer: {
            name: 'Alice White',
            email: 'alice@example.com',
            phone: '+1-555-0104',
          },
          paymentMethod: 'razorpay',
          region: 'Los Angeles',
          timeline: [
            { event: 'Order Created', timestamp: new Date('2024-01-18 16:00'), description: 'Order initiated' },
          ],
        },
      ];

      setOrders(mockOrders);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (orderId: string) => {
    try {
      await paymentSuccessFlow({
        orderId,
        franchiseId: 'current-franchise-id',
        userId: 'current-user-id',
        amount: 99,
        paymentMethod: 'razorpay',
      });

      // Update order status
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'paid', paidAt: new Date() }
          : order
      ));

      toast({
        title: "Success",
        description: "Payment processed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'init':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'paid':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'running':
        return <PlayCircle className="w-5 h-5 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <Clock className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const colors = {
      init: 'bg-yellow-500/10 text-yellow-500',
      paid: 'bg-blue-500/10 text-blue-500',
      running: 'bg-purple-500/10 text-purple-500',
      completed: 'bg-green-500/10 text-green-500',
      cancelled: 'bg-red-500/10 text-red-500',
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  const filteredOrders = orders.filter(order => {
    if (selectedStatus && order.status !== selectedStatus) return false;
    if (searchQuery && !order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) && !order.productName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
          <p className="text-gray-400">Manage orders with full lifecycle tracking</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-[#1A2236] border-indigo-500/20 text-white"
            />
          </div>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-cyan-500"
            onClick={() => navigate('/franchise/orders?action=create')}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#1A2236] border border-indigo-500/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedStatus === '' ? 'default' : 'outline'}
              className={selectedStatus === '' ? 'bg-indigo-500' : 'border-indigo-500 text-white hover:bg-indigo-500/10'}
              onClick={() => setSelectedStatus('')}
            >
              All
            </Button>
            <Button
              variant={selectedStatus === 'init' ? 'default' : 'outline'}
              className={selectedStatus === 'init' ? 'bg-yellow-500' : 'border-indigo-500 text-white hover:bg-indigo-500/10'}
              onClick={() => setSelectedStatus('init')}
            >
              Init
            </Button>
            <Button
              variant={selectedStatus === 'paid' ? 'default' : 'outline'}
              className={selectedStatus === 'paid' ? 'bg-blue-500' : 'border-indigo-500 text-white hover:bg-indigo-500/10'}
              onClick={() => setSelectedStatus('paid')}
            >
              Paid
            </Button>
            <Button
              variant={selectedStatus === 'running' ? 'default' : 'outline'}
              className={selectedStatus === 'running' ? 'bg-purple-500' : 'border-indigo-500 text-white hover:bg-indigo-500/10'}
              onClick={() => setSelectedStatus('running')}
            >
              Running
            </Button>
            <Button
              variant={selectedStatus === 'completed' ? 'default' : 'outline'}
              className={selectedStatus === 'completed' ? 'bg-green-500' : 'border-indigo-500 text-white hover:bg-indigo-500/10'}
              onClick={() => setSelectedStatus('completed')}
            >
              Completed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card className="bg-[#1A2236] border border-indigo-500/20">
        <CardContent className="pt-6">
          {bulkSelected.length > 0 && (
            <div className="mb-4 flex gap-2">
              <Button variant="outline" className="border-indigo-500 text-white hover:bg-indigo-500/10">
                Bulk Action
              </Button>
              <Button variant="outline" className="border-indigo-500 text-white hover:bg-indigo-500/10">
                Export
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="border border-indigo-500/20 rounded-lg overflow-hidden">
                  <div
                    className="p-4 hover:bg-indigo-500/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={bulkSelected.includes(order.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            setBulkSelected(prev =>
                              prev.includes(order.id)
                                ? prev.filter(id => id !== order.id)
                                : [...prev, order.id]
                            );
                          }}
                          className="w-4 h-4"
                        />
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="font-medium text-white">{order.orderId}</p>
                          <p className="text-sm text-gray-400">{order.productName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-white">${order.amount}</p>
                          <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                        </div>
                        {getStatusBadge(order.status)}
                        <p className="text-sm text-gray-400">{order.region}</p>
                        {selectedOrder === order.id ? (
                          <ChevronDown className="w-4 h-4 text-white" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white rotate-180" />
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedOrder === order.id && (
                    <div className="border-t border-indigo-500/20 p-4 bg-indigo-500/5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Customer Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-400">Name: <span className="text-white">{order.customer.name}</span></p>
                            <p className="text-gray-400">Email: <span className="text-white">{order.customer.email}</span></p>
                            <p className="text-gray-400">Phone: <span className="text-white">{order.customer.phone}</span></p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Order Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-400">Created: <span className="text-white">{order.createdAt.toLocaleString()}</span></p>
                            {order.paidAt && <p className="text-gray-400">Paid: <span className="text-white">{order.paidAt.toLocaleString()}</span></p>}
                            {order.startedAt && <p className="text-gray-400">Started: <span className="text-white">{order.startedAt.toLocaleString()}</span></p>}
                            {order.completedAt && <p className="text-gray-400">Completed: <span className="text-white">{order.completedAt.toLocaleString()}</span></p>}
                          </div>
                        </div>
                      </div>

                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Timeline
                      </h4>
                      <div className="space-y-3">
                        {order.timeline.map((event, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                            <div>
                              <p className="text-sm font-medium text-white">{event.event}</p>
                              <p className="text-xs text-gray-400">{event.timestamp.toLocaleString()} - {event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-indigo-500 text-white hover:bg-indigo-500/10"
                          onClick={() => navigate(`/franchise/orders/${order.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-indigo-500 text-white hover:bg-indigo-500/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Invoice
                        </Button>
                        {order.status === 'init' && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-indigo-500 to-cyan-500"
                            onClick={() => handlePaymentSuccess(order.id)}
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Process Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No orders found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FranchiseOrders;
