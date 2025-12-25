import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { toast } from "sonner";

const SEOPages = () => {
  const [pages] = useState([
    { id: "PG001", url: "/products/software-development", title: "Software Development Services", indexStatus: "indexed", lastCrawl: "2025-06-20", score: 94 },
    { id: "PG002", url: "/services/web-design", title: "Professional Web Design", indexStatus: "indexed", lastCrawl: "2025-06-20", score: 88 },
    { id: "PG003", url: "/about-us", title: "About Our Company", indexStatus: "indexed", lastCrawl: "2025-06-19", score: 91 },
    { id: "PG004", url: "/blog/tech-trends-2025", title: "Tech Trends 2025", indexStatus: "pending", lastCrawl: "2025-06-18", score: 76 },
    { id: "PG005", url: "/contact", title: "Contact Us", indexStatus: "indexed", lastCrawl: "2025-06-20", score: 85 },
    { id: "PG006", url: "/pricing", title: "Pricing Plans", indexStatus: "noindex", lastCrawl: "2025-06-17", score: 0 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "indexed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "noindex": return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for page ${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Pages (View Only)</h2>
        <Badge className="bg-slate-700 text-slate-300">Read Only</Badge>
      </div>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">All Indexed Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Page URL</TableHead>
                <TableHead className="text-slate-400">Title</TableHead>
                <TableHead className="text-slate-400">Index Status</TableHead>
                <TableHead className="text-slate-400">Last Crawl</TableHead>
                <TableHead className="text-slate-400">Score</TableHead>
                <TableHead className="text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id} className="border-slate-700/50">
                  <TableCell className="text-slate-300 font-mono text-sm">{page.url}</TableCell>
                  <TableCell className="text-white">{page.title}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(page.indexStatus)}>
                      {page.indexStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">{page.lastCrawl}</TableCell>
                  <TableCell className={`font-semibold ${getScoreColor(page.score)}`}>
                    {page.score > 0 ? page.score : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => handleViewDetails(page.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
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

export default SEOPages;
