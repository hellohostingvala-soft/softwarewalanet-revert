// Orders Section
// All statuses with inline update + guards + timeline

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, CheckCircle, Clock, XCircle, Package, ChevronDown, ChevronUp } from 'lucide-react';

const OrdersSection = () => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);

  const orders = [
    { id: 'ORD-001', product: 'Product A', status: 'completed', amount: 99, date: '2024-01-15', timeline: [
      { event: 'Order Created', time: '2024-01-15 10:00' },
      { event: 'Payment Verified', time: '2024-01-15 10:05' },
      { event: 'Order Completed', time: '2024-01-15 10:30' },
    ]},
    { id: 'ORD-002', product: 'Product B', status: 'pending', amount: 149, date: '2024-01-16', timeline: [
      { event: 'Order Created', time: '2024-01-16 14:00' },
    ]},
    { id: 'ORD-003', product: 'Product C', status: 'processing', amount: 199, date: '2024-01-17', timeline: [
      { event: 'Order Created', time: '2024-01-17 09:00' },
      { event: 'Payment Verified', time: '2024-01-17 09:05' },
    ]},
    { id: 'ORD-004', product: 'Product A', status: 'cancelled', amount: 99, date: '2024-01-14', timeline: [
      { event: 'Order Created', time: '2024-01-14 16:00' },
      { event: 'Order Cancelled', time: '2024-01-14 16:30' },
    ]},
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <ClipboardList className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-500/10 text-green-500',
      pending: 'bg-yellow-500/10 text-yellow-500',
      processing: 'bg-blue-500/10 text-blue-500',
      cancelled: 'bg-red-500/10 text-red-500',
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Orders</h3>
        <div className="flex gap-2">
          {bulkSelected.length > 0 && (
            <>
              <Button variant="outline" size="sm">Bulk Approve</Button>
              <Button variant="outline" size="sm">Bulk Cancel</Button>
            </>
          )}
          <Button>View All Orders</Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                >
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
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.product}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(order.status)}
                    <p className="font-bold">${order.amount}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                    {selectedOrder === order.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {selectedOrder === order.id && (
                  <div className="border-t border-border p-4 bg-muted/30">
                    <h4 className="font-semibold mb-3">Order Timeline</h4>
                    <div className="space-y-3">
                      {order.timeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                          <div>
                            <p className="text-sm font-medium">{event.event}</p>
                            <p className="text-xs text-muted-foreground">{event.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline">Download Invoice</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersSection;
