import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Lock, 
  Download,
  Calendar,
  User,
  Activity,
  Search,
  Link2,
  Zap
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  target: string;
  details: string;
  category: "meta" | "keyword" | "ai" | "technical";
}

const mockAuditLogs: AuditEntry[] = [
  {
    id: "seo-log-001",
    timestamp: "2024-01-20 15:42:18",
    action: "Meta Title Updated",
    actor: "SEO-3421",
    target: "/solutions",
    details: "Updated from 'Solutions' to 'Enterprise Solutions | Company'",
    category: "meta",
  },
  {
    id: "seo-log-002",
    timestamp: "2024-01-20 14:28:33",
    action: "Keyword Added",
    actor: "SEO-3421",
    target: "/products/crm",
    details: "Added 'small business crm' - Reason: Low difficulty opportunity",
    category: "keyword",
  },
  {
    id: "seo-log-003",
    timestamp: "2024-01-20 11:15:42",
    action: "AI Suggestion Reviewed",
    actor: "SEO-3421",
    target: "Internal Link Suggestion",
    details: "Marked as reviewed, pending implementation",
    category: "ai",
  },
  {
    id: "seo-log-004",
    timestamp: "2024-01-19 16:55:21",
    action: "Technical Issue Flagged",
    actor: "SEO-3421",
    target: "/products/enterprise",
    details: "Flagged slow LCP for Server Manager",
    category: "technical",
  },
  {
    id: "seo-log-005",
    timestamp: "2024-01-19 10:08:14",
    action: "OG Description Updated",
    actor: "SEO-3421",
    target: "/pricing",
    details: "Added OpenGraph description for social sharing",
    category: "meta",
  },
];

const SEOReportsAudit = () => {
  const [logs] = useState<AuditEntry[]>(mockAuditLogs);

  const getCategoryIcon = (category: AuditEntry["category"]) => {
    switch (category) {
      case "meta": return <FileText className="h-3 w-3" />;
      case "keyword": return <Search className="h-3 w-3" />;
      case "ai": return <Activity className="h-3 w-3" />;
      case "technical": return <Zap className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: AuditEntry["category"]) => {
    switch (category) {
      case "meta": return "bg-cyan-500/20 text-cyan-400";
      case "keyword": return "bg-purple-500/20 text-purple-400";
      case "ai": return "bg-pink-500/20 text-pink-400";
      case "technical": return "bg-amber-500/20 text-amber-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const handleExportPDF = () => {
    toast({
      title: "Exporting PDF",
      description: "Generating read-only PDF report. Action logged.",
    });
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-100">
            <FileText className="h-5 w-5 text-slate-400" />
            SEO Reports & Audit
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">
              <Lock className="h-3 w-3 mr-1" />
              Read-Only
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleExportPDF}
            >
              <Download className="h-3 w-3 mr-1" />
              Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
            <p className="text-lg font-bold text-cyan-400">47</p>
            <p className="text-xs text-cyan-400/70">Meta Changes</p>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
            <p className="text-lg font-bold text-purple-400">23</p>
            <p className="text-xs text-purple-400/70">Keywords Added</p>
          </div>
          <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-center">
            <p className="text-lg font-bold text-pink-400">18</p>
            <p className="text-xs text-pink-400/70">AI Reviews</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-lg font-bold text-amber-400">12</p>
            <p className="text-xs text-amber-400/70">Tech Flags</p>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Timestamp
                </th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">
                  <Activity className="h-3 w-3 inline mr-1" />
                  Action
                </th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">
                  <User className="h-3 w-3 inline mr-1" />
                  Actor
                </th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Target</th>
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Category</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-slate-700/50 hover:bg-slate-800/30"
                >
                  <td className="py-2 px-3 text-slate-400 text-xs font-mono">
                    {log.timestamp}
                  </td>
                  <td className="py-2 px-3 text-slate-100">{log.action}</td>
                  <td className="py-2 px-3 text-slate-300 font-mono text-xs">
                    {log.actor}
                  </td>
                  <td className="py-2 px-3 text-slate-300">{log.target}</td>
                  <td className="py-2 px-3">
                    <Badge className={getCategoryColor(log.category)}>
                      {getCategoryIcon(log.category)}
                      <span className="ml-1">{log.category}</span>
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Immutable Notice */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400">
            📋 Audit logs are IMMUTABLE. All changes (meta, keywords, AI reviews, tech flags)
            are permanently recorded and reversible.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SEOReportsAudit;
