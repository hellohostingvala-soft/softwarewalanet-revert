import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Globe,
  Zap
} from "lucide-react";

interface HealthMetric {
  label: string;
  score: number;
  status: "healthy" | "warning" | "critical";
  icon: React.ReactNode;
}

const healthMetrics: HealthMetric[] = [
  { label: "Overall SEO Score", score: 78, status: "healthy", icon: <Activity className="h-4 w-4" /> },
  { label: "On-Page SEO", score: 85, status: "healthy", icon: <CheckCircle className="h-4 w-4" /> },
  { label: "Technical SEO", score: 62, status: "warning", icon: <Zap className="h-4 w-4" /> },
  { label: "Backlink Health", score: 71, status: "healthy", icon: <Globe className="h-4 w-4" /> },
];

const organicStats = {
  totalTraffic: "124.5K",
  trafficChange: "+12.3%",
  avgPosition: "14.2",
  positionChange: "-2.1",
  indexedPages: "1,847",
  crawlErrors: 23,
};

const SEOHealthOverview = () => {
  const getStatusColor = (status: HealthMetric["status"]) => {
    switch (status) {
      case "healthy": return "text-emerald-400";
      case "warning": return "text-amber-400";
      case "critical": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-100">
          <Activity className="h-5 w-5 text-emerald-400" />
          SEO Health Overview
          <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            White-Hat Only
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <p className="text-xs text-slate-400">Organic Traffic</p>
            <p className="text-xl font-bold text-slate-100">{organicStats.totalTraffic}</p>
            <span className="text-xs text-emerald-400">{organicStats.trafficChange}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <p className="text-xs text-slate-400">Avg Position</p>
            <p className="text-xl font-bold text-slate-100">{organicStats.avgPosition}</p>
            <span className="text-xs text-emerald-400">{organicStats.positionChange}</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <p className="text-xs text-slate-400">Indexed Pages</p>
            <p className="text-xl font-bold text-slate-100">{organicStats.indexedPages}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <p className="text-xs text-slate-400">Crawl Errors</p>
            <p className="text-xl font-bold text-amber-400">{organicStats.crawlErrors}</p>
            <span className="text-xs text-amber-400">Needs attention</span>
          </motion.div>
        </div>

        {/* Health Scores */}
        <div className="space-y-3">
          {healthMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(metric.status)}>{metric.icon}</span>
                  <span className="text-sm text-slate-200">{metric.label}</span>
                </div>
                <span className={`text-lg font-bold ${getStatusColor(metric.status)}`}>
                  {metric.score}%
                </span>
              </div>
              <Progress value={metric.score} className={`h-1.5 ${getProgressColor(metric.score)}`} />
            </motion.div>
          ))}
        </div>

        {/* White-Hat Notice */}
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-xs text-emerald-400">
            ✓ White-hat SEO only. No keyword stuffing, cloaking, or fake backlinks allowed.
            All changes are logged and reversible.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SEOHealthOverview;
