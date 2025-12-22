import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { Monitor, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserOnlineStatus } from '@/hooks/useLiveActivityLogs';
import { LiveStatusIndicator, getStatusFromUserData, getStatusLabel } from './LiveStatusIndicator';

interface LiveOnlineUsersProps {
  users: UserOnlineStatus[];
  maxHeight?: string;
}

const roleColors: Record<string, string> = {
  master: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  super_admin: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  developer: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  demo_manager: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  franchise: 'bg-green-500/20 text-green-400 border-green-500/30',
  reseller: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  influencer: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  client_success: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  prime: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  client: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export function LiveOnlineUsers({ users, maxHeight = '400px' }: LiveOnlineUsersProps) {
  const sortedUsers = [...users].sort((a, b) => {
    // Online users first
    if (a.is_online !== b.is_online) return a.is_online ? -1 : 1;
    // Then by last seen
    return new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime();
  });

  const getSessionDuration = (user: UserOnlineStatus) => {
    if (!user.session_started_at || !user.is_online) return null;
    const minutes = differenceInMinutes(new Date(), new Date(user.session_started_at));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          Live User Status
          <Badge variant="outline" className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
            {users.filter(u => u.is_online).length} Online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full" style={{ maxHeight }}>
          <div className="space-y-2 pr-4">
            {sortedUsers.map((user, index) => {
              const status = getStatusFromUserData(user);
              const sessionDuration = getSessionDuration(user);

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl",
                    "bg-muted/20 border border-border/50",
                    "hover:bg-muted/30 transition-colors"
                  )}
                >
                  {/* Status Indicator */}
                  <LiveStatusIndicator status={status} size="md" />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs border",
                          roleColors[user.user_role] || 'bg-gray-500/20 text-gray-400'
                        )}
                      >
                        {user.user_role.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getStatusLabel(status)}
                      </span>
                    </div>

                    {user.current_page && (
                      <p className="text-xs text-muted-foreground mt-1 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {user.current_page}
                      </p>
                    )}
                  </div>

                  {/* Session Duration / Last Seen */}
                  <div className="text-right shrink-0">
                    {sessionDuration ? (
                      <div className="flex items-center gap-1 text-sm font-medium text-green-400">
                        <Clock className="w-3 h-3" />
                        {sessionDuration}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(user.last_seen_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
