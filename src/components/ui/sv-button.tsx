/**
 * SoftwareVala Button Components
 * Primary, Secondary, Icon buttons with premium micro-interactions
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================
// PRIMARY BUTTON
// ============================================
interface SVButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles = {
  primary: `
    bg-primary text-primary-foreground
    hover:bg-primary/90 
    active:bg-primary/80
    disabled:bg-primary/40 disabled:cursor-not-allowed
    shadow-md hover:shadow-lg
  `,
  secondary: `
    bg-transparent text-primary border-2 border-primary
    hover:bg-primary/10
    active:bg-primary/20
    disabled:border-primary/40 disabled:text-primary/40 disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent text-foreground
    hover:bg-secondary/60
    active:bg-secondary/80
    disabled:text-muted-foreground disabled:cursor-not-allowed
  `,
  danger: `
    bg-destructive text-destructive-foreground
    hover:bg-destructive/90
    active:bg-destructive/80
    disabled:bg-destructive/40 disabled:cursor-not-allowed
    shadow-md
  `,
  success: `
    bg-[hsl(142,76%,45%)] text-white
    hover:bg-[hsl(142,76%,40%)]
    active:bg-[hsl(142,76%,35%)]
    disabled:bg-[hsl(142,76%,45%)/0.4] disabled:cursor-not-allowed
    shadow-md
  `,
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px] rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-base min-h-[44px] rounded-xl gap-2',
  lg: 'px-6 py-3 text-lg min-h-[52px] rounded-2xl gap-2',
  xl: 'px-8 py-4 text-xl min-h-[60px] rounded-2xl gap-3',
};

export const SVButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  ...props
}: SVButtonProps) => {
  const isDisabled = disabled || loading;
  
  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={cn(size === 'sm' ? 'w-4 h-4' : size === 'lg' || size === 'xl' ? 'w-6 h-6' : 'w-5 h-5')} />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={cn(size === 'sm' ? 'w-4 h-4' : size === 'lg' || size === 'xl' ? 'w-6 h-6' : 'w-5 h-5')} />
      )}
    </motion.button>
  );
};

// ============================================
// ICON BUTTON
// ============================================
interface SVIconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: LucideIcon;
  label: string;
  variant?: 'default' | 'ghost' | 'outline' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'square' | 'circle';
  showTooltip?: boolean;
}

const iconVariantStyles = {
  default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'bg-transparent text-foreground hover:bg-secondary/60',
  outline: 'bg-transparent border-2 border-border text-foreground hover:bg-secondary/40',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
};

const iconSizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10 min-h-[44px] min-w-[44px]',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const SVIconButton = ({
  icon: Icon,
  label,
  variant = 'default',
  size = 'md',
  shape = 'square',
  showTooltip = true,
  className,
  disabled,
  ...props
}: SVIconButtonProps) => {
  const button = (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        iconVariantStyles[variant],
        iconSizeStyles[size],
        shape === 'circle' ? 'rounded-full' : 'rounded-xl',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      disabled={disabled}
      aria-label={label}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </motion.button>
  );

  if (!showTooltip) return button;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================
// LINK BUTTON (for navigation)
// ============================================
interface SVLinkButtonProps extends SVButtonProps {
  href?: string;
  external?: boolean;
}

export const SVLinkButton = ({
  href,
  external = false,
  children,
  ...props
}: SVLinkButtonProps) => {
  const handleClick = () => {
    if (href) {
      if (external) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <SVButton onClick={handleClick} {...props}>
      {children}
    </SVButton>
  );
};

export default SVButton;
