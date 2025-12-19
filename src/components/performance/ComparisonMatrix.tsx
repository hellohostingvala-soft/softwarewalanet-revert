import { useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown,
  Calendar
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const comparisonData = {
  regions: [
    { name: "North America", score: 92, growth: "+8%", revenue: "$245K" },
    { name: "Europe", score: 88, growth: "+5%", revenue: "$198K" },
    { name: "Asia Pacific", score: 85, growth: "+12%", revenue: "$167K" },
    { name: "Middle East", score: 78, growth: "+3%", revenue: "$89K" },
  ],
  roles: [
    { name: "Developer", score: 91, avgTime: "4.2h", quality: 94 },
    { name: "Sales", score: 87, avgTime: "2.8h", quality: 89 },
    { name: "Support", score: 82, avgTime: "1.2h", quality: 91 },
    { name: "Reseller", score: 79, avgTime: "N/A", quality: 85 },
  ],
  periods: [
    { period: "This Week", score: 87, tasks: 156, conversion: "32%" },
    { period: "Last Week", score: 84, tasks: 142, conversion: "28%" },
    { period: "This Month", score: 86, tasks: 623, conversion: "31%" },
    { period: "Last Month", score: 82, tasks: 589, conversion: "27%" },
  ],
};

export const ComparisonMatrix = () => {
  const [comparisonType, setComparisonType] = useState<"region" | "role" | "period">("region");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Comparison Matrix
          </h2>
          <p className="text-slate-400 text-sm mt-1">Data-only comparison — No personal attacks, pure metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          {[
            { id: "region", label: "Region vs Region" },
            { id: "role", label: "Role vs Role" },
            { id: "period", label: "Period vs Period" },
          ].map((type) => (
            <Button
              key={type.id}
              variant={comparisonType === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => setComparisonType(type.id as any)}
              className={comparisonType === type.id 
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" 
                : "border-slate-700 text-slate-400"
              }
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Region Comparison */}
      {comparisonType === "region" && (
        <Card className="p-6 bg-slate-900/50 backdrop-blur-xl border-cyan-500/30">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Region Performance Comparison</h3>
          </div>
          
          <div className="space-y-4">
            {comparisonData.regions.map((region, index) => (
              <motion.div
                key={region.name}
                className="flex items-center gap-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-40">
                  <p className="font-medium text-white">{region.name}</p>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Performance Score</span>
                    <span className="text-cyan-400 font-semibold">{region.score}</span>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${region.score}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-6 w-48">
                  <div className="text-center">
                    <p className={`font-semibold ${region.growth.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                      {region.growth}
                    </p>
                    <p className="text-xs text-slate-500">Growth</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-amber-400">{region.revenue}</p>
                    <p className="text-xs text-slate-500">Revenue</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Role Comparison */}
      {comparisonType === "role" && (
        <Card className="p-6 bg-slate-900/50 backdrop-blur-xl border-cyan-500/30">
          <div className="flex items-center gap-2 mb-6">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Role Performance Comparison</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {comparisonData.roles.map((role, index) => (
              <motion.div
                key={role.name}
                className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="font-semibold text-white mb-4">{role.name}</h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Score</span>
                      <span className="text-cyan-400">{role.score}</span>
                    </div>
                    <Progress value={role.score} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Avg Time</span>
                    <span className="text-sm text-emerald-400">{role.avgTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Quality</span>
                    <span className="text-sm text-cyan-400">{role.quality}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Period Comparison */}
      {comparisonType === "period" && (
        <Card className="p-6 bg-slate-900/50 backdrop-blur-xl border-cyan-500/30">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Period-over-Period Comparison</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {comparisonData.periods.map((period, index) => (
              <motion.div
                key={period.period}
                className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">{period.period}</h4>
                  <div className="flex items-center gap-2">
                    {index % 2 === 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-slate-800/50">
                    <p className="text-2xl font-bold text-cyan-400">{period.score}</p>
                    <p className="text-xs text-slate-500">Score</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-800/50">
                    <p className="text-2xl font-bold text-emerald-400">{period.tasks}</p>
                    <p className="text-xs text-slate-500">Tasks</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-800/50">
                    <p className="text-2xl font-bold text-amber-400">{period.conversion}</p>
                    <p className="text-xs text-slate-500">Conversion</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Mission Statement */}
      <Card className="p-5 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border-cyan-500/30">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Mission: Fair Performance</h3>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto">
            Make performance measurable, transparent, fair, motivating, gamified, and future-proof.
            Without stress. Without bias. Without manual interference.
          </p>
        </div>
      </Card>
    </div>
  );
};
