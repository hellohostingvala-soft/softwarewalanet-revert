import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";

const SEOReports = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">SEO Reports</h2>
        <div className="flex items-center gap-2 text-yellow-400 text-sm">
          <AlertTriangle className="h-4 w-4" />
          No export / No copy
        </div>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="daily" className="data-[state=active]:bg-cyan-600">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-cyan-600">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-cyan-600">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-cyan-400">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-slate-400">Impressions</span>
                    <span className="text-white font-medium">42,150</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-slate-400">Clicks</span>
                    <span className="text-white font-medium">1,589</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-slate-400">Avg CTR</span>
                    <span className="text-white font-medium">3.77%</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-800/50 rounded">
                    <span className="text-slate-400">Avg Position</span>
                    <span className="text-white font-medium">8.2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-cyan-400">Page-wise Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { page: "/products/software", change: "+5 positions", positive: true },
                    { page: "/services/web-design", change: "+2 positions", positive: true },
                    { page: "/blog/tech-trends", change: "-1 position", positive: false },
                    { page: "/about-us", change: "No change", positive: null },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between p-3 bg-slate-800/50 rounded">
                      <span className="text-slate-300 font-mono text-sm">{item.page}</span>
                      <span className={
                        item.positive === true ? "text-emerald-400" :
                        item.positive === false ? "text-red-400" :
                        "text-slate-400"
                      }>{item.change}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-cyan-400">Weekly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-slate-500">
                Weekly SEO performance chart
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-cyan-400">Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-slate-500">
                Monthly SEO trends chart
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SEOReports;
