// Customers Section

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Mail, Phone } from 'lucide-react';

const CustomersSection = () => {
  const customers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-0101', totalSpent: 599, orders: 3 },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-0102', totalSpent: 347, orders: 2 },
    { id: 3, name: 'Carol White', email: 'carol@example.com', phone: '+1-555-0103', totalSpent: 199, orders: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customers</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search customers..." className="pl-10 w-64" />
          </div>
          <Button>Add Customer</Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{customer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${customer.totalSpent}</p>
                  <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersSection;
