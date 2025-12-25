// Continent Super Admin - Performance Screen
import { motion } from 'framer-motion';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PerformanceView = () => {
  const countryPerformance = [
    { country: 'South Africa', growth: 24, target: 85, actual: 92 },
    { country: 'Nigeria', growth: 18, target: 80, actual: 78 },
    { country: 'Kenya', growth: 22, target: 75, actual: 81 },
    { country: 'Ghana', growth: 15, target: 70, actual: 72 },
    { country: 'Egypt', growth: 12, target: 80, actual: 68 },
    { country: 'Morocco', growth: 20, target: 75, actual: 79 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Performance</h1>
        <p className="text-muted-foreground">Country-wise performance metrics and analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-500">+18.5%</div>
              <p className="text-xs text-muted-foreground">vs last quarter</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target Achievement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">78%</div>
              <p className="text-xs text-muted-foreground">continent average</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Top Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">South Africa</div>
              <p className="text-xs text-muted-foreground">+24% growth</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Growth Chart Placeholder */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Growth Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Quarterly growth chart</p>
              <p className="text-sm">Q1: +12% | Q2: +15% | Q3: +18% | Q4: +22%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Performance Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Country-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countryPerformance.map((country, index) => (
              <motion.div
                key={country.country}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-background rounded-lg border border-border"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-foreground">{country.country}</span>
                  <span className={`font-bold ${country.growth >= 18 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    +{country.growth}%
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Target vs Actual</span>
                      <span className={country.actual >= country.target ? 'text-emerald-500' : 'text-red-500'}>
                        {country.actual}% / {country.target}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${country.actual >= country.target ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min((country.actual / country.target) * 100, 100)}%` }}
                      />
                    </div>
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

export default PerformanceView;
