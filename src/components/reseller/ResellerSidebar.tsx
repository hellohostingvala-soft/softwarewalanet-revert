import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Link2, 
  Wallet, 
  MessageSquare, 
  GraduationCap, 
  HeadphonesIcon,
  Bot,
  BarChart3,
  Target,
  MapPin,
  Megaphone,
  FileText,
  Award,
  Clock,
  ShoppingCart,
  Shield,
  Zap,
  ChevronRight
} from 'lucide-react';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Lead Inbox', icon: Users, badge: 12 },
  { id: 'demos', label: 'Demo Sharing', icon: Link2 },
  { id: 'scripts', label: 'AI Sales Script', icon: Bot },
  { id: 'wallet', label: 'Wallet & Commission', icon: Wallet },
  { id: 'chat', label: 'Customer Chat', icon: MessageSquare, badge: 5 },
  { id: 'products', label: 'Product Library', icon: Package },
  { id: 'marketing', label: 'Marketing Toolkit', icon: Megaphone },
  { id: 'followup', label: 'Follow-Up Manager', icon: Clock },
  { id: 'performance', label: 'Performance Board', icon: BarChart3 },
  { id: 'escalation', label: 'Escalation', icon: HeadphonesIcon },
  { id: 'territory', label: 'Territory View', icon: MapPin },
  { id: 'incentives', label: 'Incentives', icon: Award },
  { id: 'training', label: 'Micro Training', icon: GraduationCap },
  { id: 'leadpool', label: 'Shared Lead Pool', icon: Target },
  { id: 'orders', label: 'Lead to Order', icon: ShoppingCart },
  { id: 'compliance', label: 'Compliance', icon: Shield }
];

interface ResellerSidebarProps {
  activeItem: string;
  onItemChange: (item: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export const ResellerSidebar = ({ 
  activeItem, 
  onItemChange, 
  collapsed, 
  onCollapsedChange 
}: ResellerSidebarProps) => {
  const navigate = useNavigate();

  return (
    <aside className={`fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} hidden lg:block`}>
      <div className="h-full glass-panel border-r border-border/30 flex flex-col">
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-primary flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/')}
            >
              <Zap className="w-5 h-5 text-background" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <p className="font-mono font-bold text-sm text-foreground">SOFTWARE VALA</p>
                  <p className="text-[10px] text-neon-blue">Reseller Portal</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => onItemChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  activeItem === item.id
                    ? 'bg-neon-blue/10 text-neon-blue border-l-2 border-neon-blue'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
                whileHover={{ x: 3 }}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium flex-1 text-left truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-neon-blue/20 text-neon-blue">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="m-4 p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors self-end"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </aside>
  );
};
