import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle } from "lucide-react";

const SEOAudit = () => {
  const [auditLogs] = useState([
    { id: "AUD001", time: "2025-06-20 14:32:15", action: "Keyword Added", actor: "SEO-****-4521", approvalRef: "APR-2025-0892" },
    { id: "AUD002", time: "2025-06-20 13:45:22", action: "Meta Rule Proposed", actor: "SEO-****-4521", approvalRef: "APR-2025-0891" },
    { id: "AUD003", time: "2025-06-20 12:18:09", action: "Re-crawl Requested", actor: "SEO-****-4521", approvalRef: "APR-2025-0890" },
    { id: "AUD004", time: "2025-06-20 11:55:33", action: "Automation Toggle", actor: "SEO-****-4521", approvalRef: "APR-2025-0889" },
    { id: "AUD005", time: "2025-06-20 10:22:41", action: "Issue Reviewed", actor: "SEO-****-4521", approvalRef: "N/A" },
    { id: "AUD006", time: "2025-06-19 16:45:18", action: "Issue Escalated", actor: "SEO-****-4521", approvalRef: "ESC-2025-0234" },
    { id: "AUD007", time: "2025-06-19 15:30:22", action: "Schema Rule Proposed", actor: "SEO-****-4521", approvalRef: "APR-2025-0888" },
    { id: "AUD008", time: "2025-06-19 14:12:55", action: "Keyword Paused", actor: "SEO-****-4521", approvalRef: "N/A" },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">Audit Trail</h2>
        </div>
        <Badge className="bg-slate-700 text-slate-300">
          Read Only
        </Badge>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-400" />
        <p className="text-yellow-400 text-sm">
          This is an immutable audit log. No modifications or exports are permitted.
        </p>
      </div>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Time</TableHead>
                <TableHead className="text-slate-400">Action</TableHead>
                <TableHead className="text-slate-400">Actor</TableHead>
                <TableHead className="text-slate-400">Approval Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id} className="border-slate-700/50">
                  <TableCell className="text-slate-300 font-mono text-sm">{log.time}</TableCell>
                  <TableCell className="text-white">{log.action}</TableCell>
                  <TableCell className="text-slate-300 font-mono text-sm">{log.actor}</TableCell>
                  <TableCell className={log.approvalRef === "N/A" ? "text-slate-500" : "text-cyan-400 font-mono text-sm"}>
                    {log.approvalRef}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SEOAudit;
