import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart, Clock, CheckCircle, XCircle, Package, Eye,
  Calendar, IndianRupee, Loader2, AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { marketplaceEnterpriseService } from '@/services/marketplaceEnterpriseService';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Package },
  in_development: { label: 'In Development', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Package },
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
  paid: { label: 'Paid', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
};

const getStatusConfig = (status?: string) =>
  statusConfig[status ?? ''] || { label: status || 'Unknown', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Clock };

export function MMOrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let mounted = true;

    if (!user?.id) {
      if (mounted) {
        setOrders([]);
        setLoading(false);
      }
      return () => {
        mounted = false;
      };
    }

    const loadOrders = async () => {
      if (!mounted) return;
      setLoading(true);
      try {
        const res = await marketplaceEnterpriseService.getUserOrders(user!.id);
        if (!mounted) return;

        // Service may return { data, error } or an array directly
        const data = Array.isArray(res) ? res : res?.data ?? [];
        const error = res?.error ?? null;

        if (error) {
          console.error('[MMOrdersScreen] Failed to load orders:', error);
          setOrders([]);
        } else {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('[MMOrdersScreen] Unexpected error loading orders:', err);
        setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => (o?.status ?? '') === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => (o?.status ?? '') === 'pending').length,
    inProgress: orders.filter(o => ['processing', 'in_development'].includes(o?.status ?? '')).length,
    completed: orders.filter(o => (o?.status ?? '') === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-purple-400" />
          My Orders
        </h1>
        <p className="text-slate-400 mt-1">Track and manage your software orders</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Total Orders</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <p className="text-xs text-amber-400">Pending</p>
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <p className="text-xs text-purple-400">In Progress</p>
            <p className="text-2xl font-bold text-purple-400">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-400">Completed</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        {['all', 'pending', 'processing', 'in_development', 'completed', 'cancelled'].map(status => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className={filter === status ? 'bg-purple-500 hover:bg-purple-600' : 'border-slate-700'}
          >
            {status === 'all' ? 'All' : getStatusConfig(status).label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{orders.length === 0 ? 'No orders yet. Browse the marketplace to get started!' : 'No orders match this filter.'}</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const sc = getStatusConfig(order?.status);
            const StatusIcon = sc.icon;
            const items = Array.isArray(order?.marketplace_order_items) ? order.marketplace_order_items : [];

            return (
              <Card key={order?.id ?? order?.order_number} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-slate-700">
                        <Package className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {items.length > 0 ? items.map((i: any) => i?.product_name ?? 'Unnamed').join(', ') : 'Order'}
                        </h3>
                        <p className="text-sm text-slate-400">{order?.order_number ?? '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-bold">
                          <IndianRupee className="h-4 w-4" />
                          {Number(order?.final_amount ?? 0).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {order?.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                        </div>
                      </div>

                      <Badge className={sc.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {sc.label}
                      </Badge>

                      <Dialog>
                        <DialogTrigger asChild>
                          {/* Use native button as child to ensure asChild works reliably with Dialog */}
                          <button type="button" className="inline-flex items-center justify-center px-2 py-1 border rounded text-sm border-slate-600 bg-transparent hover:bg-slate-800">
                            <Eye className="h-4 w-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700">
                          <DialogHeader>
                            <DialogTitle>Order Details — {order?.order_number ?? '-'}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-slate-400">Total Amount</p>
                                <p className="font-medium">₹{Number(order?.total_amount ?? 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400">Discount</p>
                                <p className="font-medium text-emerald-400">-₹{Number(order?.discount_amount ?? 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400">Final Amount</p>
                                <p className="font-medium text-cyan-400">₹{Number(order?.final_amount ?? 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400">Payment Status</p>
                                <Badge className={getStatusConfig(order?.payment_status ?? '').color}>
                                  {order?.payment_status ?? 'unknown'}
                                </Badge>
                              </div>
                            </div>
                            {items.length > 0 && (
                              <div>
                                <p className="text-xs text-slate-400 mb-2">Items</p>
                                <div className="space-y-2">
                                  {items.map((item: any, idx: number) => (
                                    <div key={item?.id ?? `${item?.product_name ?? 'item'}-${idx}`} className="flex justify-between p-2 rounded bg-slate-800 border border-slate-700">
                                      <span className="text-sm">{item?.product_name ?? 'Unnamed'}</span>
                                      <span className="text-sm font-medium">₹{Number(item?.total_price ?? 0).toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {order?.requirements && (
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Requirements</p>
                                <p className="text-sm p-3 rounded-lg bg-slate-800 border border-slate-700">{order.requirements}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
