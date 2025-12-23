/**
 * SoftwareVala Card Components
 * Product/Demo Card, Info Card with premium styling
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon, ExternalLink, Play, Star } from 'lucide-react';
import { SVButton } from './sv-button';
import { SVBadge, StatusType } from './sv-badge';

// ============================================
// BASE CARD
// ============================================
interface SVCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const SVCard = ({ children, className, hover = true, onClick }: SVCardProps) => (
  <motion.div
    className={cn(
      'bg-card rounded-2xl border border-border shadow-lg overflow-hidden',
      hover && 'hover:shadow-xl transition-shadow duration-300',
      onClick && 'cursor-pointer',
      className
    )}
    whileHover={hover ? { y: -4 } : undefined}
    whileTap={onClick ? { scale: 0.99 } : undefined}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

// ============================================
// PRODUCT / DEMO CARD
// ============================================
interface SVDemoCardProps {
  title: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  status?: StatusType;
  rating?: number;
  onViewDemo?: () => void;
  onLaunchDemo?: () => void;
  featured?: boolean;
  className?: string;
}

export const SVDemoCard = ({
  title,
  category,
  description,
  imageUrl,
  status = 'live',
  rating,
  onViewDemo,
  onLaunchDemo,
  featured = false,
  className,
}: SVDemoCardProps) => (
  <SVCard className={cn(featured && 'ring-2 ring-primary', className)}>
    {/* Image Section */}
    {imageUrl && (
      <div className="relative h-40 bg-secondary overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <SVBadge status={status} />
          {featured && <SVBadge status="popular" />}
        </div>
      </div>
    )}
    
    {/* Content */}
    <div className="p-5 space-y-3">
      {/* Category Tag */}
      {category && (
        <span className="text-xs font-medium text-primary uppercase tracking-wider">
          {category}
        </span>
      )}
      
      {/* Title & Rating */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-lg text-foreground line-clamp-2">{title}</h3>
        {rating && (
          <div className="flex items-center gap-1 text-[hsl(45,100%,50%)]">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      )}
      
      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <SVButton 
          variant="primary" 
          size="sm" 
          icon={Play}
          onClick={onLaunchDemo}
          fullWidth
        >
          Launch Demo
        </SVButton>
        <SVButton 
          variant="secondary" 
          size="sm" 
          icon={ExternalLink}
          onClick={onViewDemo}
        >
          View
        </SVButton>
      </div>
    </div>
  </SVCard>
);

// ============================================
// INFO CARD
// ============================================
interface SVInfoCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  value?: string | number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  onClick?: () => void;
}

const colorStyles = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-[hsl(142,76%,50%)]/10 text-[hsl(142,76%,50%)]',
  warning: 'bg-[hsl(45,100%,50%)]/10 text-[hsl(45,100%,50%)]',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-[hsl(200,100%,50%)]/10 text-[hsl(200,100%,50%)]',
};

export const SVInfoCard = ({
  icon: Icon,
  title,
  description,
  value,
  color = 'primary',
  className,
  onClick,
}: SVInfoCardProps) => (
  <SVCard className={cn('p-5', className)} onClick={onClick}>
    <div className="space-y-3">
      {/* Icon */}
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorStyles[color])}>
        <Icon className="w-6 h-6" />
      </div>
      
      {/* Value */}
      {value !== undefined && (
        <p className="text-3xl font-bold text-foreground">{value}</p>
      )}
      
      {/* Title */}
      <h4 className="font-semibold text-foreground">{title}</h4>
      
      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  </SVCard>
);

// ============================================
// FEATURE CARD
// ============================================
interface SVFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export const SVFeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
}: SVFeatureCardProps) => (
  <motion.div 
    className={cn(
      'p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm',
      'hover:bg-card hover:border-primary/30 transition-all duration-300',
      className
    )}
    whileHover={{ scale: 1.02 }}
  >
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h4 className="font-semibold text-foreground mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);

export default SVCard;
