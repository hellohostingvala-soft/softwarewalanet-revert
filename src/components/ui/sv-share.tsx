/**
 * SoftwareVala Copy & Share Components
 * Copy button with animation, Share button with all social options
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Copy, Check, Share2, X, Link, Mail, MessageSquare,
  QrCode, ExternalLink
} from 'lucide-react';
import { SVIconButton } from './sv-button';
import { toast } from 'sonner';

// ============================================
// COPY BUTTON
// ============================================
interface SVCopyButtonProps {
  text: string;
  label?: string;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onCopy?: () => void;
}

export const SVCopyButton = ({
  text,
  label = 'Copy',
  variant = 'icon',
  size = 'md',
  className,
  onCopy,
}: SVCopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  }, [text, onCopy]);

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={handleCopy}
        className={cn(
          'relative inline-flex items-center justify-center rounded-xl transition-colors',
          'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
          size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10 min-h-[44px]',
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={copied ? 'Copied!' : label}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              transition={{ duration: 0.2 }}
            >
              <Check className={cn(
                'text-[hsl(142,76%,50%)]',
                size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
              )} />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Copy className={cn(
                size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
              )} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl font-medium transition-colors',
        'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
        size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-5 py-3 text-base' : 'px-4 py-2 text-sm min-h-[44px]',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-[hsl(142,76%,50%)]"
          >
            <Check className="w-4 h-4" />
            Copied!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ============================================
// SHARE OPTIONS
// ============================================
interface ShareOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: (url: string, title: string) => void;
}

const shareOptions: ShareOption[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    ),
    color: 'bg-[#25D366] hover:bg-[#20BD5A]',
    action: (url, title) => window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank'),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: 'bg-[#1877F2] hover:bg-[#166FE5]',
    action: (url) => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'),
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: 'bg-[#000000] hover:bg-[#1a1a1a]',
    action: (url, title) => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank'),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: 'bg-[#0A66C2] hover:bg-[#0958A8]',
    action: (url, title) => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank'),
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    color: 'bg-[#26A5E4] hover:bg-[#1E96D1]',
    action: (url, title) => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank'),
  },
  {
    id: 'reddit',
    label: 'Reddit',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
      </svg>
    ),
    color: 'bg-[#FF4500] hover:bg-[#E63E00]',
    action: (url, title) => window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank'),
  },
  {
    id: 'copy',
    label: 'Copy Link',
    icon: <Link className="w-6 h-6" />,
    color: 'bg-secondary hover:bg-secondary/80',
    action: async (url) => {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    },
  },
  {
    id: 'email',
    label: 'Email',
    icon: <Mail className="w-6 h-6" />,
    color: 'bg-[#EA4335] hover:bg-[#D93025]',
    action: (url, title) => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`, '_blank'),
  },
  {
    id: 'sms',
    label: 'SMS',
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'bg-[hsl(142,76%,50%)] hover:bg-[hsl(142,76%,45%)]',
    action: (url, title) => window.open(`sms:?body=${encodeURIComponent(title + ' ' + url)}`, '_blank'),
  },
];

// ============================================
// SHARE BUTTON
// ============================================
interface SVShareButtonProps {
  url: string;
  title?: string;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SVShareButton = ({
  url,
  title = 'Check this out!',
  variant = 'icon',
  size = 'md',
  className,
}: SVShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleShare = async (option: ShareOption) => {
    option.action(url, title);
    if (option.id !== 'copy') {
      setIsOpen(false);
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Trigger Button */}
      {variant === 'icon' ? (
        <SVIconButton
          icon={Share2}
          label="Share"
          size={size}
          onClick={() => setIsOpen(true)}
          className={className}
        />
      ) : (
        <motion.button
          onClick={() => setIsOpen(true)}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl font-medium transition-colors',
            'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
            size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-5 py-3 text-base' : 'px-4 py-2 text-sm min-h-[44px]',
            className
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Share2 className="w-4 h-4" />
          Share
        </motion.button>
      )}

      {/* Share Modal / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Sheet/Modal */}
            <motion.div
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'fixed z-50 bg-card border border-border shadow-2xl',
                isMobile 
                  ? 'bottom-0 left-0 right-0 rounded-t-3xl max-h-[80vh]' 
                  : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl w-full max-w-md'
              )}
            >
              {/* Drag Handle (mobile) */}
              {isMobile && (
                <div className="flex justify-center py-3">
                  <div className="w-10 h-1 rounded-full bg-muted" />
                </div>
              )}
              
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">Share</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Share Options Grid */}
              <div className="p-5 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-4 gap-4">
                  {shareOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => handleShare(option)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary/50 transition-colors min-h-[80px]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-white',
                        option.color
                      )}>
                        {option.icon}
                      </div>
                      <span className="text-xs text-muted-foreground text-center line-clamp-1">
                        {option.label}
                      </span>
                    </motion.button>
                  ))}
                  
                  {/* QR Code Option */}
                  <motion.button
                    onClick={() => setShowQR(!showQR)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary/50 transition-colors min-h-[80px]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-muted-foreground">QR Code</span>
                  </motion.button>
                </div>

                {/* QR Code Display */}
                <AnimatePresence>
                  {showQR && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-white rounded-xl flex justify-center"
                    >
                      <div className="text-center">
                        <div className="w-40 h-40 bg-muted rounded-lg flex items-center justify-center mb-2">
                          <QrCode className="w-24 h-24 text-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">Scan to open</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SVCopyButton;
