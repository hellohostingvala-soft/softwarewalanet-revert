/**
 * SoftwareVala Status Badges
 * Live, New, Popular, Coming Soon badges
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Circle, Sparkles, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export type StatusType = 'live' | 'new' | 'popular' | 'coming-soon' | 'active' | 'inactive' | 'pending';

interface SVBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const badgeConfig: Record<StatusType, {
  label: string;
  icon: typeof Circle;
  bg: string;
  text: string;
  glow?: string;
}> = {
  live: {
    label: 'Live',
    icon: Circle,
    bg: 'bg-[hsl(142,76%,50%)]/15',
    text: 'text-[hsl(142,76%,50%)]',
    glow: '0 0 12px hsl(142 76% 50% / 0.4)',
  },
  new: {
    label: 'New',
    icon: Sparkles,
    bg: 'bg-[hsl(200,100%,50%)]/15',
    text: 'text-[hsl(200,100%,50%)]',
    glow: '0 0 12px hsl(200 100% 50% / 0.4)',
  },
  popular: {
    label: 'Popular',
    icon: TrendingUp,
    bg: 'bg-[hsl(280,100%,60%)]/15',
    text: 'text-[hsl(280,100%,60%)]',
    glow: '0 0 12px hsl(280 100% 60% / 0.4)',
  },
  'coming-soon': {
    label: 'Coming Soon',
    icon: Clock,
    bg: 'bg-muted',
    text: 'text-muted-foreground',
  },
  active: {
    label: 'Active',
    icon: CheckCircle,
    bg: 'bg-[hsl(142,76%,50%)]/15',
    text: 'text-[hsl(142,76%,50%)]',
  },
  inactive: {
    label: 'Inactive',
    icon: Circle,
    bg: 'bg-muted',
    text: 'text-muted-foreground',
  },
  pending: {
    label: 'Pending',
    icon: AlertCircle,
    bg: 'bg-[hsl(45,100%,50%)]/15',
    text: 'text-[hsl(45,100%,50%)]',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2',
};

const iconSizes = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export const SVBadge = ({
  status,
  size = 'md',
  pulse = true,
  className,
}: SVBadgeProps) => {
  const config = badgeConfig[status];
  const Icon = config.icon;
  const showPulse = pulse && (status === 'live' || status === 'active');

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bg,
        config.text,
        sizeStyles[size],
        className
      )}
      style={config.glow ? { boxShadow: config.glow } : undefined}
    >
      <span className="relative">
        <Icon className={cn(iconSizes[size], status === 'live' && 'fill-current')} />
        {showPulse && (
          <motion.span
            className={cn(
              'absolute inset-0 rounded-full',
              status === 'live' ? 'bg-[hsl(142,76%,50%)]' : 'bg-[hsl(142,76%,50%)]'
            )}
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </span>
      {config.label}
    </span>
  );
};

// ============================================
// CUSTOM BADGE
// ============================================
interface SVCustomBadgeProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const customColors = {
  primary: 'bg-primary/15 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-[hsl(142,76%,50%)]/15 text-[hsl(142,76%,50%)]',
  warning: 'bg-[hsl(45,100%,50%)]/15 text-[hsl(45,100%,50%)]',
  danger: 'bg-destructive/15 text-destructive',
  info: 'bg-[hsl(200,100%,50%)]/15 text-[hsl(200,100%,50%)]',
};

export const SVCustomBadge = ({
  children,
  color = 'primary',
  size = 'md',
  className,
}: SVCustomBadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full font-medium',
      customColors[color],
      sizeStyles[size],
      className
    )}
  >
    {children}
  </span>
);

export default SVBadge;
