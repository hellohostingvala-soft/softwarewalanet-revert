import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, AlertTriangle, CheckCircle, 
  XCircle, Clock, Power, UserCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: { value: number; isPositive: boolean };
  delay?: number;
}

function StatsCard({ title, value, icon, color, bgColor, trend, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className={cn(
        "border-border/50 overflow-hidden",
        "bg-gradient-to-br from-card to-muted/20"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{title}</p>
              <p className={cn("text-2xl font-bold", color)}>{value}</p>
              {trend && (
                <p className={cn(
                  "text-xs mt-1",
                  trend.isPositive ? "text-green-400" : "text-red-400"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}% from last hour
                </p>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", bgColor)}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface LiveStatsCardsProps {
  stats: {
    totalLogs: number;
    successCount: number;
    failCount: number;
    blockedCount: number;
    warningCount: number;
    onlineCount: number;
    offlineCount: number;
    pendingCount: number;
    forceLoggedOutCount: number;
  };
}

export function LiveStatsCards({ stats }: LiveStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatsCard
        title="Online Now"
        value={stats.onlineCount}
        icon={<Users className="w-5 h-5 text-green-400" />}
        color="text-green-400"
        bgColor="bg-green-400/10"
        delay={0}
      />
      <StatsCard
        title="Total Activities"
        value={stats.totalLogs}
        icon={<Activity className="w-5 h-5 text-blue-400" />}
        color="text-blue-400"
        bgColor="bg-blue-400/10"
        delay={0.1}
      />
      <StatsCard
        title="Successful"
        value={stats.successCount}
        icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
        color="text-emerald-400"
        bgColor="bg-emerald-400/10"
        delay={0.2}
      />
      <StatsCard
        title="Warnings"
        value={stats.warningCount}
        icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
        color="text-amber-400"
        bgColor="bg-amber-400/10"
        delay={0.3}
      />
      <StatsCard
        title="Failed"
        value={stats.failCount}
        icon={<XCircle className="w-5 h-5 text-red-400" />}
        color="text-red-400"
        bgColor="bg-red-400/10"
        delay={0.4}
      />
      <StatsCard
        title="Blocked"
        value={stats.blockedCount}
        icon={<XCircle className="w-5 h-5 text-orange-400" />}
        color="text-orange-400"
        bgColor="bg-orange-400/10"
        delay={0.5}
      />
      <StatsCard
        title="Pending Approval"
        value={stats.pendingCount}
        icon={<UserCheck className="w-5 h-5 text-yellow-400" />}
        color="text-yellow-400"
        bgColor="bg-yellow-400/10"
        delay={0.6}
      />
      <StatsCard
        title="Force Logged Out"
        value={stats.forceLoggedOutCount}
        icon={<Power className="w-5 h-5 text-red-400" />}
        color="text-red-400"
        bgColor="bg-red-400/10"
        delay={0.7}
      />
    </div>
  );
}
