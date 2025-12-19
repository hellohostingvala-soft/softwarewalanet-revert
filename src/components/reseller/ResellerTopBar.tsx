import { motion } from 'framer-motion';
import { Bell, Search, Menu, X, Bot, AlertTriangle, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ResellerTopBarProps {
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export const ResellerTopBar = ({ onMobileMenuToggle, mobileMenuOpen }: ResellerTopBarProps) => {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-border/30">
      <div className="flex items-center justify-between px-4 h-16">
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={onMobileMenuToggle}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products, leads..."
              className="pl-10 bg-secondary/30 border-border/30"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Buzzer Alert */}
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/30"
            animate={{
              boxShadow: [
                '0 0 5px hsla(142, 71%, 45%, 0.2)',
                '0 0 15px hsla(142, 71%, 45%, 0.4)',
                '0 0 5px hsla(142, 71%, 45%, 0.2)'
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <AlertTriangle className="w-4 h-4 text-neon-green" />
            <span className="text-xs text-neon-green font-medium">2 New Leads</span>
          </motion.div>

          {/* Tier Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-blue/10 border border-neon-blue/30">
            <Award className="w-4 h-4 text-neon-blue" />
            <span className="text-xs text-neon-blue font-medium">Silver</span>
          </div>

          {/* AI Help */}
          <motion.button
            className="relative p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue"
            animate={{
              boxShadow: [
                '0 0 10px hsla(217, 91%, 60%, 0.2)',
                '0 0 20px hsla(217, 91%, 60%, 0.4)',
                '0 0 10px hsla(217, 91%, 60%, 0.2)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot className="w-5 h-5" />
          </motion.button>

          <button className="relative p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-red" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-blue to-primary flex items-center justify-center text-background font-bold text-sm">
              RS
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">Reseller Partner</p>
              <p className="text-xs text-muted-foreground">Delhi NCR Territory</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
