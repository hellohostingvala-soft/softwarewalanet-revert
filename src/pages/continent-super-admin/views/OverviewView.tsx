// Continent Super Admin - Overview Screen
import { motion } from 'framer-motion';
import { Globe2, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OverviewView = () => {
  const summaryCards = [
    { title: 'Active Countries', value: '12', icon: Globe2, trend: '+2 this month' },
    { title: 'Total Revenue', value: '$2.4M', icon: TrendingUp, trend: '+18% vs last quarter' },
    { title: 'Risk Level', value: 'Low', icon: AlertTriangle, trend: '3 alerts pending' },
    { title: 'Area Managers', value: '8', icon: Users, trend: 'All active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground">Continent summary and key metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.trend}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Trend */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Revenue chart visualization</p>
              <p className="text-sm">Quarterly growth: +18%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Risk Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-emerald-500/10 rounded-lg">
              <p className="text-2xl font-bold text-emerald-500">Low</p>
              <p className="text-sm text-muted-foreground">Overall Risk</p>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-lg">
              <p className="text-2xl font-bold text-amber-500">3</p>
              <p className="text-sm text-muted-foreground">Pending Alerts</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg">
              <p className="text-2xl font-bold text-blue-500">12</p>
              <p className="text-sm text-muted-foreground">Active Countries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewView;
