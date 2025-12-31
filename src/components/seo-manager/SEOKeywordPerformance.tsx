import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  Target,
  Info,
  Plus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Keyword {
  id: string;
  keyword: string;
  position: number;
  positionChange: number;
  volume: number;
  difficulty: "easy" | "medium" | "hard";
  intent: "informational" | "transactional" | "navigational" | "commercial";
  page: string;
}

const mockKeywords: Keyword[] = [
  {
    id: "kw-001",
    keyword: "enterprise software solutions",
    position: 8,
    positionChange: 3,
    volume: 2400,
    difficulty: "hard",
    intent: "commercial",
    page: "/solutions",
  },
  {
    id: "kw-002",
    keyword: "best crm for small business",
    position: 12,
    positionChange: -2,
    volume: 8100,
    difficulty: "medium",
    intent: "transactional",
    page: "/products/crm",
  },
  {
    id: "kw-003",
    keyword: "how to improve sales process",
    position: 4,
    positionChange: 1,
    volume: 3200,
    difficulty: "easy",
    intent: "informational",
    page: "/blog/sales-process",
  },
  {
    id: "kw-004",
    keyword: "automation platform pricing",
    position: 15,
    positionChange: 0,
    volume: 1800,
    difficulty: "medium",
    intent: "transactional",
    page: "/pricing",
  },
];

const SEOKeywordPerformance = () => {
  const [keywords] = useState<Keyword[]>(mockKeywords);

  const getDifficultyColor = (difficulty: Keyword["difficulty"]) => {
    switch (difficulty) {
      case "easy": return "bg-emerald-500/20 text-emerald-400";
      case "medium": return "bg-amber-500/20 text-amber-400";
      case "hard": return "bg-red-500/20 text-red-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const getIntentColor = (intent: Keyword["intent"]) => {
    switch (intent) {
      case "informational": return "bg-blue-500/20 text-blue-400";
      case "transactional": return "bg-purple-500/20 text-purple-400";
      case "navigational": return "bg-cyan-500/20 text-cyan-400";
      case "commercial": return "bg-pink-500/20 text-pink-400";
      default: return "bg-slate-500/20 text-slate-400";
    }
  };

  const handleAddKeyword = () => {
    toast({
      title: "Add Keyword",
      description: "Manual keyword addition requires a documented reason.",
    });
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-100">
            <Search className="h-5 w-5 text-purple-400" />
            Keyword Performance
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={handleAddKeyword}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add (Requires Reason)
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {keywords.map((kw, index) => (
          <motion.div
            key={kw.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-slate-100">{kw.keyword}</h4>
                </div>
                <p className="text-xs text-slate-400">{kw.page}</p>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(kw.difficulty)}>
                    {kw.difficulty}
                  </Badge>
                  <Badge className={getIntentColor(kw.intent)}>
                    <Target className="h-3 w-3 mr-1" />
                    {kw.intent}
                  </Badge>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-2xl font-bold text-slate-100">#{kw.position}</span>
                  {kw.positionChange > 0 ? (
                    <span className="flex items-center text-xs text-emerald-400">
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      +{kw.positionChange}
                    </span>
                  ) : kw.positionChange < 0 ? (
                    <span className="flex items-center text-xs text-red-400">
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                      {kw.positionChange}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Vol: {kw.volume.toLocaleString()}/mo
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* AI Suggestion Notice */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-400 mt-0.5" />
          <p className="text-xs text-blue-400">
            AI suggests keywords based on search intent & difficulty.
            Manual adds require documented reasoning.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SEOKeywordPerformance;
