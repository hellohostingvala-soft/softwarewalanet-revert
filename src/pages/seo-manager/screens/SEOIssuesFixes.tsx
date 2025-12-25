import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const SEOIssuesFixes = () => {
  const [issues] = useState([
    { id: "ISS001", type: "Missing Meta Description", severity: "high", affectedPages: 24, status: "pending" },
    { id: "ISS002", type: "Duplicate Title Tags", severity: "medium", affectedPages: 8, status: "pending" },
    { id: "ISS003", type: "Broken Internal Links", severity: "high", affectedPages: 12, status: "in_progress" },
    { id: "ISS004", type: "Missing Alt Text", severity: "low", affectedPages: 156, status: "pending" },
    { id: "ISS005", type: "Slow Page Speed", severity: "medium", affectedPages: 5, status: "reviewed" },
    { id: "ISS006", type: "Mobile Usability", severity: "high", affectedPages: 3, status: "fixed" },
    { id: "ISS007", type: "Missing H1 Tags", severity: "medium", affectedPages: 7, status: "pending" },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fixed": return "bg-emerald-500/20 text-emerald-400";
      case "reviewed": return "bg-purple-500/20 text-purple-400";
      case "in_progress": return "bg-cyan-500/20 text-cyan-400";
      case "pending": return "bg-slate-500/20 text-slate-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const handleMarkReviewed = (id: string) => {
    toast.success(`Issue ${id} marked as reviewed`);
  };

  const handleEscalate = (id: string) => {
    toast.info(`Issue ${id} escalated to Super Admin`);
  };

  const pendingCount = issues.filter(i => i.status === "pending").length;
  const highSeverityCount = issues.filter(i => i.severity === "high" && i.status !== "fixed").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Issues & Fixes</h2>
        <div className="flex gap-2">
          <Badge className="bg-slate-700 text-slate-300">{pendingCount} Pending</Badge>
          <Badge className="bg-red-500/20 text-red-400">{highSeverityCount} High Severity</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-400 text-sm">Total Issues</p>
            <p className="text-3xl font-bold text-white mt-2">{issues.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-400 text-sm">High Severity</p>
            <p className="text-3xl font-bold text-red-400 mt-2">{issues.filter(i => i.severity === "high").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-400 text-sm">In Progress</p>
            <p className="text-3xl font-bold text-cyan-400 mt-2">{issues.filter(i => i.status === "in_progress").length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-400 text-sm">Fixed</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">{issues.filter(i => i.status === "fixed").length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">All Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Issue Type</TableHead>
                <TableHead className="text-slate-400">Severity</TableHead>
                <TableHead className="text-slate-400">Affected Pages</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id} className="border-slate-700/50">
                  <TableCell className="text-white font-medium">{issue.type}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">{issue.affectedPages} pages</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {issue.status !== "fixed" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleMarkReviewed(issue.id)}>
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEscalate(issue.id)}>
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        </Button>
                      </div>
                    )}
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

export default SEOIssuesFixes;
