import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Link, Code } from "lucide-react";
import { toast } from "sonner";

const SEOMetaRules = () => {
  const [titleRules] = useState([
    { id: "TR001", pattern: "Product Pages", template: "{Product Name} | {Category} | Company", status: "active" },
    { id: "TR002", pattern: "Blog Posts", template: "{Title} - {Category} Blog | Company", status: "active" },
    { id: "TR003", pattern: "Service Pages", template: "Professional {Service} Services | Company", status: "active" },
  ]);

  const [descRules] = useState([
    { id: "DR001", pattern: "Product Pages", template: "Discover {Product Name}. {Short Description}. Get started today.", status: "active" },
    { id: "DR002", pattern: "Blog Posts", template: "{Excerpt}. Read more about {Topic} on our blog.", status: "active" },
  ]);

  const [canonicalRules] = useState([
    { id: "CR001", rule: "Remove trailing slashes", status: "active" },
    { id: "CR002", rule: "Force HTTPS", status: "active" },
    { id: "CR003", rule: "Remove query parameters", status: "active" },
  ]);

  const [schemaRules] = useState([
    { id: "SR001", type: "Organization", pages: "All", status: "active" },
    { id: "SR002", type: "Product", pages: "Product Pages", status: "active" },
    { id: "SR003", type: "Article", pages: "Blog Posts", status: "active" },
    { id: "SR004", type: "LocalBusiness", pages: "Contact", status: "pending" },
  ]);

  const handleProposeRule = () => {
    toast.info("Rule proposal submitted for approval");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Meta Rules</h2>
        <Button onClick={handleProposeRule} className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Propose Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Title Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {titleRules.map((rule) => (
              <div key={rule.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-medium">{rule.pattern}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400">{rule.status}</Badge>
                </div>
                <code className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded block">
                  {rule.template}
                </code>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {descRules.map((rule) => (
              <div key={rule.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-medium">{rule.pattern}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400">{rule.status}</Badge>
                </div>
                <code className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded block">
                  {rule.template}
                </code>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Link className="h-5 w-5" />
              Canonical Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canonicalRules.map((rule) => (
              <div key={rule.id} className="flex justify-between items-center bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <span className="text-slate-300">{rule.rule}</span>
                <Badge className="bg-emerald-500/20 text-emerald-400">{rule.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Code className="h-5 w-5" />
              Schema Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {schemaRules.map((rule) => (
              <div key={rule.id} className="flex justify-between items-center bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <div>
                  <span className="text-white font-medium">{rule.type}</span>
                  <span className="text-slate-500 text-sm ml-2">→ {rule.pages}</span>
                </div>
                <Badge className={rule.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"}>
                  {rule.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default SEOMetaRules;
