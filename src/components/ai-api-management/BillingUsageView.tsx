import { motion } from "framer-motion";
import { 
  DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3,
  Play, Square, CreditCard, AlertTriangle, CheckCircle2, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PROVIDER_COSTS = [
  { name: 'OpenAI', cost: 245, percentage: 35, color: 'emerald', trend: '+12%' },
  { name: 'Google', cost: 156, percentage: 22, color: 'blue', trend: '+8%' },
  { name: 'AWS', cost: 134, percentage: 19, color: 'orange', trend: '-3%' },
  { name: 'Anthropic', cost: 89, percentage: 13, color: 'violet', trend: '+15%' },
  { name: 'Others', cost: 78, percentage: 11, color: 'slate', trend: '+2%' },
];

const USAGE_BREAKDOWN = [
  { category: 'Text AI (LLM)', usage: '2.4M tokens', cost: '$312', percentage: 45 },
  { category: 'Image AI', usage: '45K images', cost: '$89', percentage: 13 },
  { category: 'Payment APIs', usage: '12K transactions', cost: '$67', percentage: 10 },
  { category: 'Storage', usage: '4.5TB', cost: '$89', percentage: 13 },
  { category: 'Messaging', cost: '$78', usage: '156K messages', percentage: 11 },
  { category: 'Analytics', cost: '$56', usage: '890K events', percentage: 8 },
];

const UNPAID_SERVICES = [
  { name: 'Razorpay', amount: '$28', days: 5, critical: false },
  { name: 'SendGrid', amount: '$18', days: 12, critical: true },
  { name: 'Runway Gen-2', amount: '$45', days: 3, critical: false },
];

const AUTO_STOP_SUGGESTIONS = [
  { name: 'ElevenLabs', reason: 'No usage in 7 days', savings: '$18/mo' },
  { name: 'Auth0', reason: 'Low usage (< 5%)', savings: '$23/mo' },
  { name: 'Stable Diffusion XL', reason: 'Stopped for 14 days', savings: '$0/mo' },
];

export const BillingUsageView = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Billing & Usage
          </h1>
          <p className="text-sm text-muted-foreground">Cost analysis and usage tracking</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/50">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            21 Paid
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/50">
            <AlertTriangle className="w-3 h-3 mr-1" />
            3 Unpaid
          </Badge>
        </div>
      </div>

      {/* Top Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/50">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">$702</p>
            <p className="text-xs text-muted-foreground">Total Paid (Month)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <Badge variant="outline" className="text-[10px] text-red-400 border-red-500/50">
                Overdue
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">$91</p>
            <p className="text-xs text-muted-foreground">Total Unpaid</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/50">
                <TrendingDown className="w-3 h-3 mr-1" />
                -5%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-white">$41</p>
            <p className="text-xs text-muted-foreground">Potential Savings</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <PieChart className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">24</p>
            <p className="text-xs text-muted-foreground">Total Services</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Provider-wise Cost */}
        <Card className="bg-slate-900/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Cost by Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PROVIDER_COSTS.map((provider) => (
              <div key={provider.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20">{provider.name}</span>
                <div className="flex-1">
                  <Progress value={provider.percentage} className="h-2" />
                </div>
                <span className="text-xs text-white w-14 text-right">${provider.cost}</span>
                <Badge variant="outline" className={cn(
                  "text-[9px] px-1.5",
                  provider.trend.startsWith('+') ? "text-emerald-400 border-emerald-500/50" : "text-red-400 border-red-500/50"
                )}>
                  {provider.trend}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Usage Breakdown */}
        <Card className="bg-slate-900/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Usage by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {USAGE_BREAKDOWN.map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24">{item.category}</span>
                <div className="flex-1">
                  <Progress value={item.percentage} className="h-2" />
                </div>
                <span className="text-xs text-emerald-400 w-12 text-right">{item.cost}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Unpaid Services */}
        <Card className="bg-gradient-to-br from-amber-500/5 to-red-500/5 border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Unpaid Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {UNPAID_SERVICES.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/10">
                <div>
                  <p className="text-sm text-white">{service.name}</p>
                  <p className="text-[10px] text-muted-foreground">{service.days} days overdue</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium",
                    service.critical ? "text-red-400" : "text-amber-400"
                  )}>{service.amount}</span>
                  <Button size="sm" className="h-7 bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                    <CreditCard className="w-3 h-3 mr-1" />
                    Pay
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Auto-Stop Suggestions */}
        <Card className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-violet-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Auto-Stop Suggestions (AI)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {AUTO_STOP_SUGGESTIONS.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/10">
                <div>
                  <p className="text-sm text-white">{service.name}</p>
                  <p className="text-[10px] text-muted-foreground">{service.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400">Save {service.savings}</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-amber-500/50 text-amber-400 hover:bg-amber-500/20">
                    <Square className="w-3 h-3 mr-1" />
                    Stop
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
