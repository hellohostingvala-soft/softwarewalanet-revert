import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, FileText, Link, Code, Send } from "lucide-react";
import { toast } from "sonner";

const SEOAutomation = () => {
  const [automations] = useState([
    { 
      id: "AUTO001", 
      name: "Auto Meta Generation", 
      description: "Automatically generate meta titles and descriptions using AI based on page content",
      icon: FileText,
      status: true,
      lastRun: "2025-06-20 12:00:00",
      pagesAffected: 1847
    },
    { 
      id: "AUTO002", 
      name: "Auto Internal Linking", 
      description: "Automatically suggest and create internal links between related content",
      icon: Link,
      status: true,
      lastRun: "2025-06-20 08:00:00",
      linksCreated: 342
    },
    { 
      id: "AUTO003", 
      name: "Auto Schema Suggestions", 
      description: "AI-powered schema markup suggestions based on page type and content",
      icon: Code,
      status: false,
      lastRun: "2025-06-19 16:00:00",
      schemasGenerated: 89
    },
  ]);

  const handleRequestToggle = (id: string, name: string) => {
    toast.info(`Toggle request for "${name}" submitted for approval`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">SEO Automation</h2>
        <Badge className="bg-cyan-500/20 text-cyan-400">
          <Zap className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {automations.map((automation) => (
          <Card key={automation.id} className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-500/20 rounded-lg">
                    <automation.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{automation.name}</h3>
                      <Badge className={automation.status ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}>
                        {automation.status ? "ON" : "OFF"}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{automation.description}</p>
                    <div className="flex gap-6 mt-4 text-sm">
                      <div>
                        <span className="text-slate-500">Last Run: </span>
                        <span className="text-slate-300">{automation.lastRun}</span>
                      </div>
                      {automation.pagesAffected && (
                        <div>
                          <span className="text-slate-500">Pages Affected: </span>
                          <span className="text-cyan-400">{automation.pagesAffected.toLocaleString()}</span>
                        </div>
                      )}
                      {automation.linksCreated && (
                        <div>
                          <span className="text-slate-500">Links Created: </span>
                          <span className="text-cyan-400">{automation.linksCreated}</span>
                        </div>
                      )}
                      {automation.schemasGenerated && (
                        <div>
                          <span className="text-slate-500">Schemas Generated: </span>
                          <span className="text-cyan-400">{automation.schemasGenerated}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={automation.status} disabled className="opacity-50" />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                    onClick={() => handleRequestToggle(automation.id, automation.name)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Request Toggle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Automation Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Meta Tags Auto-Generated</p>
              <p className="text-2xl font-bold text-white mt-2">3,694</p>
              <p className="text-xs text-slate-500">This month</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Internal Links Added</p>
              <p className="text-2xl font-bold text-white mt-2">1,247</p>
              <p className="text-xs text-slate-500">This month</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Time Saved</p>
              <p className="text-2xl font-bold text-cyan-400 mt-2">156 hrs</p>
              <p className="text-xs text-slate-500">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SEOAutomation;
