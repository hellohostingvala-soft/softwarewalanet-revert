import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, Download, Play, Square, CheckCircle2, 
  Clock, AlertTriangle, Package, Shield, Zap, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const APPS_DATA = [
  { id: 1, name: "CRM Mobile", demo: "CRM Demo v2.1", status: "ready", version: "1.0.5", size: "24 MB", downloads: 156 },
  { id: 2, name: "HR Manager", demo: "HR Demo", status: "building", version: "2.0.0", size: "-", progress: 67 },
  { id: 3, name: "Sales Tracker", demo: "Sales Demo", status: "failed", version: "1.2.0", size: "-", error: "Build failed" },
  { id: 4, name: "Inventory App", demo: "Inventory Demo", status: "ready", version: "1.1.0", size: "18 MB", downloads: 89 },
  { id: 5, name: "Task Manager", demo: "Task Demo", status: "pending", version: "1.0.0", size: "-" },
];

const BUILD_TYPES = [
  { value: "debug", label: "Debug APK", description: "For testing" },
  { value: "release", label: "Release APK", description: "For production" },
  { value: "aab", label: "AAB Bundle", description: "Play Store ready" },
];

export const UnifiedAPKBuilder = () => {
  const [selectedBuildType, setSelectedBuildType] = useState("release");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return CheckCircle2;
      case "building": return Clock;
      case "failed": return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "green";
      case "building": return "amber";
      case "failed": return "red";
      default: return "slate";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Mobile / APK Builder</h2>
          <p className="text-muted-foreground">Generate Android APK & AAB from demos</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Package className="w-4 h-4 mr-2" />
          New Build
        </Button>
      </div>

      {/* Build Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Apps", value: 5, icon: Smartphone, color: "blue" },
          { label: "Ready", value: 2, icon: CheckCircle2, color: "green" },
          { label: "Building", value: 1, icon: Clock, color: "amber" },
          { label: "Total Downloads", value: 245, icon: Download, color: "violet" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/30`}
          >
            <div className="flex items-center justify-between">
              <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Build Type Selector */}
      <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
        <label className="text-sm font-medium text-white mb-3 block">Build Type</label>
        <div className="grid grid-cols-3 gap-3">
          {BUILD_TYPES.map((type) => (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedBuildType(type.value)}
              className={cn(
                "p-4 rounded-lg border text-left transition-all",
                selectedBuildType === type.value
                  ? "bg-emerald-500/20 border-emerald-500/50"
                  : "bg-background/30 border-border/50 hover:border-emerald-500/30"
              )}
            >
              <p className="text-sm font-medium text-white">{type.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Apps Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">APP</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">DEMO</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">VERSION</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">STATUS</th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground">SIZE</th>
              <th className="text-right p-3 text-xs font-medium text-muted-foreground">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {APPS_DATA.map((app) => {
              const StatusIcon = getStatusIcon(app.status);
              const color = getStatusColor(app.status);
              return (
                <tr key={app.id} className="border-t border-border/30 hover:bg-muted/10">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-sm text-white font-medium">{app.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{app.demo}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-xs">
                      v{app.version}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {app.status === "building" ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                          <span className="text-xs text-amber-400">Building {app.progress}%</span>
                        </div>
                        <Progress value={app.progress} className="h-1" />
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs capitalize",
                          `border-${color}-500/50 text-${color}-400`
                        )}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {app.status}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{app.size}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      {app.status === "ready" && (
                        <>
                          <Button variant="ghost" size="sm" className="h-8 text-green-400">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {app.status === "building" && (
                        <Button variant="ghost" size="sm" className="h-8 text-red-400">
                          <Square className="w-4 h-4 mr-1" />
                          Stop
                        </Button>
                      )}
                      {app.status === "failed" && (
                        <Button variant="ghost" size="sm" className="h-8 text-amber-400">
                          <Play className="w-4 h-4 mr-1" />
                          Retry
                        </Button>
                      )}
                      {app.status === "pending" && (
                        <Button variant="ghost" size="sm" className="h-8 text-emerald-400">
                          <Zap className="w-4 h-4 mr-1" />
                          Build
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-sm font-medium text-white">APK Security</p>
            <p className="text-xs text-muted-foreground">
              All APKs are signed with internal key, license + domain locked, reverse engineering resistant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
