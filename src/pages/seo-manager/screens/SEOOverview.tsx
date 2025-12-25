import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, FileText, TrendingUp, BarChart3 } from "lucide-react";

const SEOOverview = () => {
  const stats = [
    { label: "Site Health Score", value: "92/100", icon: Activity, trend: "+3 this week", color: "text-emerald-400" },
    { label: "Indexed Pages", value: "1,847", icon: FileText, trend: "+24 new", color: "text-blue-400" },
    { label: "Keyword Movement", value: "+156", icon: TrendingUp, trend: "↑ 89 | ↓ 42 | → 25", color: "text-purple-400" },
    { label: "Organic Traffic", value: "45.2K", icon: BarChart3, trend: "+12% vs last month", color: "text-cyan-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400">Traffic Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-500">
              Organic traffic trend visualization
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400">Keyword Position Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-500">
              Position distribution chart
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default SEOOverview;
