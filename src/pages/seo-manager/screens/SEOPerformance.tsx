import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MousePointer, BarChart3, Target } from "lucide-react";

const SEOPerformance = () => {
  const metrics = [
    { label: "Impressions", value: "1.2M", icon: Eye, change: "+18%", positive: true },
    { label: "Clicks", value: "45.2K", icon: MousePointer, change: "+12%", positive: true },
    { label: "CTR", value: "3.8%", icon: BarChart3, change: "+0.4%", positive: true },
    { label: "Avg Position", value: "8.4", icon: Target, change: "-1.2", positive: true },
  ];

  const topPages = [
    { page: "/products/software-development", impressions: "245K", clicks: "12.4K", ctr: "5.1%", position: "3.2" },
    { page: "/services/web-design", impressions: "189K", clicks: "8.9K", ctr: "4.7%", position: "5.8" },
    { page: "/blog/tech-trends-2025", impressions: "156K", clicks: "7.2K", ctr: "4.6%", position: "7.1" },
    { page: "/about-us", impressions: "98K", clicks: "4.1K", ctr: "4.2%", position: "9.4" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-white">Performance Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {metric.label}
                </CardTitle>
                <metric.icon className="h-5 w-5 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <p className={`text-xs mt-1 ${metric.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {metric.change} vs last period
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400">Impressions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-500">
              Impressions trend chart
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400">Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-500">
              Clicks trend chart
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Top Performing Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <span className="text-white font-mono text-sm truncate max-w-xs">{page.page}</span>
                <div className="flex gap-8 text-sm">
                  <div className="text-center">
                    <p className="text-slate-400">Impressions</p>
                    <p className="text-white font-medium">{page.impressions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400">Clicks</p>
                    <p className="text-white font-medium">{page.clicks}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400">CTR</p>
                    <p className="text-white font-medium">{page.ctr}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400">Avg Pos</p>
                    <p className="text-cyan-400 font-medium">{page.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SEOPerformance;
