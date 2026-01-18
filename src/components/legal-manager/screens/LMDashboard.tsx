import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Scale, FileCheck, AlertTriangle, Copyright, Award, Globe,
  Eye, Edit, Lock, Unlock, CheckCircle, XCircle, History, Trash2
} from "lucide-react";
import { toast } from "sonner";

interface LMDashboardProps {
  activeSubSection: string;
}

const stats = [
  { label: "Active Agreements", value: "247", icon: FileCheck, color: "emerald" },
  { label: "Pending Acceptances", value: "34", icon: AlertTriangle, color: "yellow" },
  { label: "Policy Violations", value: "8", icon: XCircle, color: "red" },
  { label: "Copyright Alerts", value: "5", icon: Copyright, color: "orange" },
  { label: "Trademark Status", value: "Active", icon: Award, color: "cyan" },
  { label: "Country Compliance", value: "92%", icon: Globe, color: "blue" },
];

const recentAgreements = [
  { id: "AGR-001", name: "End User Agreement v4.2", status: "active", type: "User", updated: "2 hours ago" },
  { id: "AGR-002", name: "Franchise Agreement - India", status: "pending", type: "Franchise", updated: "5 hours ago" },
  { id: "AGR-003", name: "Developer NDA Template", status: "active", type: "Developer", updated: "1 day ago" },
  { id: "AGR-004", name: "Reseller Terms v3.0", status: "review", type: "Reseller", updated: "2 days ago" },
  { id: "AGR-005", name: "Admin Agreement", status: "active", type: "Admin", updated: "3 days ago" },
];

const LMDashboard = ({ activeSubSection }: LMDashboardProps) => {
  const handleAction = (action: string, item: string) => {
    const actions: Record<string, () => void> = {
      view: () => toast.info(`Viewing: ${item}`),
      edit: () => toast.info(`Editing: ${item}`),
      lock: () => toast.warning(`Locking: ${item}`),
      unlock: () => toast.success(`Unlocking: ${item}`),
      publish: () => toast.success(`Published: ${item}`),
      revoke: () => toast.error(`Revoked: ${item}`),
      history: () => toast.info(`Viewing history: ${item}`),
    };
    actions[action]?.();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "review": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center shadow-lg">
          <Scale className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Legal Dashboard</h1>
          <p className="text-muted-foreground">Overview of all legal & compliance matters</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`bg-${stat.color}-500/10 border-${stat.color}-500/30 cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => toast.info(`Viewing ${stat.label}: ${stat.value}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                    <span className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Agreements */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-rose-400" />
            Recent Agreements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAgreements.map((agreement) => (
              <motion.div
                key={agreement.id}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-rose-600/20 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{agreement.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{agreement.type}</Badge>
                      <span className="text-xs text-muted-foreground">{agreement.updated}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(agreement.status)}>{agreement.status}</Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction("view", agreement.name)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction("edit", agreement.name)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction("lock", agreement.name)}>
                      <Lock className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction("publish", agreement.name)}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleAction("history", agreement.name)}>
                      <History className="w-4 h-4" />
                    </Button>
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

export default LMDashboard;
