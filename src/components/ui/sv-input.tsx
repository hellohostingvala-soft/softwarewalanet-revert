/**
 * SoftwareVala Form Components
 * Input, Dropdown, Toggle with premium styling
 */

import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, AlertCircle, Check, ChevronDown, LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

// ============================================
// INPUT FIELD
// ============================================
interface SVInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
}

const inputSizeStyles = {
  sm: 'h-10 text-sm px-3',
  md: 'h-12 text-base px-4 min-h-[44px]',
  lg: 'h-14 text-lg px-5',
};

export const SVInput = forwardRef<HTMLInputElement, SVInputProps>(({
  label,
  error,
  hint,
  icon: Icon,
  size = 'md',
  type = 'text',
  className,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const isSearch = type === 'search';

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      )}
      <div className="relative">
        {(Icon || isSearch) && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isSearch ? <Search className="w-5 h-5" /> : Icon && <Icon className="w-5 h-5" />}
          </div>
        )}
        <input
          ref={ref}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={cn(
            'w-full rounded-xl border bg-background text-foreground transition-all duration-200',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-destructive focus:ring-destructive/50' : 'border-border hover:border-primary/50',
            inputSizeStyles[size],
            (Icon || isSearch) && 'pl-11',
            isPassword && 'pr-11',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1.5 text-sm text-destructive"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
        {!error && hint && (
          <p className="text-sm text-muted-foreground">{hint}</p>
        )}
      </AnimatePresence>
    </div>
  );
});

SVInput.displayName = 'SVInput';

// ============================================
// DROPDOWN / SELECT
// ============================================
interface SVSelectOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface SVSelectProps {
  label?: string;
  options: SVSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SVSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  disabled = false,
  size = 'md',
}: SVSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-1.5 relative">
      {label && (
        <Label className="text-sm font-medium text-foreground">{label}</Label>
      )}
      <div className="relative">
        <motion.button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full rounded-xl border bg-background text-left flex items-center justify-between transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
            error ? 'border-destructive' : 'border-border hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed',
            inputSizeStyles[size]
          )}
          whileTap={!disabled ? { scale: 0.99 } : undefined}
        >
          <span className={cn(!selectedOption && 'text-muted-foreground')}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon && <selectedOption.icon className="w-4 h-4" />}
                {selectedOption.label}
              </span>
            ) : placeholder}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="max-h-60 overflow-y-auto py-1">
                  {options.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange?.(option.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-secondary/60 transition-colors min-h-[44px]',
                        value === option.value && 'bg-primary/10 text-primary'
                      )}
                      whileHover={{ x: 4 }}
                    >
                      {option.icon && <option.icon className="w-4 h-4" />}
                      <span className="flex-1">{option.label}</span>
                      {value === option.value && <Check className="w-4 h-4 text-primary" />}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
};

// ============================================
// TOGGLE / SWITCH
// ============================================
interface SVToggleProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const toggleSizeStyles = {
  sm: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
  md: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
  lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
};

export const SVToggle = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
}: SVToggleProps) => {
  const styles = toggleSizeStyles[size];

  return (
    <label className={cn(
      'inline-flex items-center gap-3 cursor-pointer select-none',
      disabled && 'opacity-50 cursor-not-allowed'
    )}>
      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          'relative rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          styles.track,
          checked ? 'bg-primary' : 'bg-muted'
        )}
        disabled={disabled}
      >
        <motion.span
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white shadow-md',
            styles.thumb
          )}
          animate={{ x: checked ? parseInt(styles.translate.replace('translate-x-', '')) * 4 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
    </label>
  );
};

export default SVInput;
