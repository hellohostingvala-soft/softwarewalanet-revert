import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Monitor, 
  Search, 
  ExternalLink, 
  Wand2, 
  RefreshCw,
  Trash2,
  Filter,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

const demos = [
  { 
    name: "RetailMaster Pro Demo - Nigeria", 
    product: "RetailMaster Pro",
    url: "demo-ng.retailmaster.com",
    status: "active",
    hasError: false,
    views: 456,
    created: "2 days ago"
  },
  { 
    name: "FoodServe Plus Demo - Kenya", 
    product: "FoodServe Plus",
    url: "demo-ke.foodserve.com",
    status: "active",
    hasError: false,
    views: 321,
    created: "3 days ago"
  },
  { 
    name: "HotelHub Demo - UAE", 
    product: "HotelHub Enterprise",
    url: "demo-ae.hotelhub.com",
    status: "error",
    hasError: true,
    errorType: "Button not working",
    views: 189,
    created: "5 days ago"
  },
  { 
    name: "StockFlow Demo - South Africa", 
    product: "StockFlow Advanced",
    url: "demo-za.stockflow.com",
    status: "active",
    hasError: false,
    views: 234,
    created: "1 week ago"
  },
  { 
    name: "SalonPro Demo - India", 
    product: "SalonPro Suite",
    url: "demo-in.salonpro.com",
    status: "error",
    hasError: true,
    errorType: "Page not loading",
    views: 156,
    created: "1 week ago"
  },
  { 
    name: "GymMaster Demo - Egypt", 
    product: "GymMaster Elite",
    url: "demo-eg.gymmaster.com",
    status: "active",
    hasError: false,
    views: 198,
    created: "2 weeks ago"
  },
];

export const DemoManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demo Manager</h1>
          <p className="text-muted-foreground">Manage all demo instances</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search demos..." className="pl-9 w-[250px]" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2 text-amber-400 border-amber-400/30">
            <Wand2 className="w-4 h-4" />
            Fix All Errors (AI)
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Demos", value: demos.length, color: "from-blue-500 to-cyan-500" },
          { label: "Active", value: demos.filter(d => d.status === "active").length, color: "from-emerald-500 to-teal-500" },
          { label: "With Errors", value: demos.filter(d => d.hasError).length, color: "from-red-500 to-orange-500" },
          { label: "Total Views", value: demos.reduce((acc, d) => acc + d.views, 0).toLocaleString(), color: "from-violet-500 to-purple-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            Demo List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {demos.map((demo, index) => (
              <motion.div
                key={demo.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-lg bg-background/50 border transition-all ${
                  demo.hasError ? "border-red-500/30" : "border-border/50 hover:border-blue-500/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    demo.hasError ? "bg-red-500/20" : "bg-blue-500/20"
                  }`}>
                    {demo.hasError ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{demo.name}</div>
                    <div className="text-sm text-muted-foreground">{demo.product}</div>
                    <div className="text-xs text-blue-400">{demo.url}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {demo.hasError && (
                    <Badge variant="outline" className="text-red-400 border-red-400/30">
                      {demo.errorType}
                    </Badge>
                  )}
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">{demo.views}</div>
                    <div className="text-xs text-muted-foreground">views</div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={demo.status === "active" ? "text-emerald-400 border-emerald-400/30" : "text-red-400 border-red-400/30"}
                  >
                    {demo.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    {demo.hasError && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-400">
                        <Wand2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400">
                      <Trash2 className="w-4 h-4" />
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
