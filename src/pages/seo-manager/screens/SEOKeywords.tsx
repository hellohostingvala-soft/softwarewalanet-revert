import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pause, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";

const SEOKeywords = () => {
  const [keywords] = useState([
    { id: "KW001", keyword: "software development services", page: "/products/software", position: 3, change: 2, volume: 12400, status: "tracking" },
    { id: "KW002", keyword: "web design company", page: "/services/web-design", position: 7, change: -1, volume: 8900, status: "tracking" },
    { id: "KW003", keyword: "mobile app development", page: "/services/mobile", position: 12, change: 5, volume: 15200, status: "tracking" },
    { id: "KW004", keyword: "custom software solutions", page: "/products/custom", position: 5, change: 0, volume: 6300, status: "tracking" },
    { id: "KW005", keyword: "enterprise software", page: "/enterprise", position: 18, change: -3, volume: 4100, status: "paused" },
    { id: "KW006", keyword: "cloud services", page: "/services/cloud", position: 9, change: 4, volume: 9800, status: "tracking" },
  ]);

  const handleAddKeyword = () => {
    toast.info("Keyword addition request submitted for approval");
  };

  const handlePauseTracking = (id: string) => {
    toast.success(`Tracking paused for keyword ${id}`);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-emerald-400";
    if (change < 0) return "text-red-400";
    return "text-slate-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Keyword Tracking</h2>
        <Button onClick={handleAddKeyword} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Keyword
        </Button>
      </div>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">All Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Keyword</TableHead>
                <TableHead className="text-slate-400">Page</TableHead>
                <TableHead className="text-slate-400">Position</TableHead>
                <TableHead className="text-slate-400">Change</TableHead>
                <TableHead className="text-slate-400">Volume</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywords.map((kw) => (
                <TableRow key={kw.id} className="border-slate-700/50">
                  <TableCell className="text-white font-medium">{kw.keyword}</TableCell>
                  <TableCell className="text-slate-300 font-mono text-sm">{kw.page}</TableCell>
                  <TableCell className="text-cyan-400 font-semibold">#{kw.position}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 ${getChangeColor(kw.change)}`}>
                      {getChangeIcon(kw.change)}
                      <span>{kw.change > 0 ? `+${kw.change}` : kw.change}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">{kw.volume.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={kw.status === "tracking" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}>
                      {kw.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {kw.status === "tracking" && (
                      <Button size="sm" variant="ghost" onClick={() => handlePauseTracking(kw.id)}>
                        <Pause className="h-4 w-4 text-yellow-400" />
                      </Button>
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

export default SEOKeywords;
