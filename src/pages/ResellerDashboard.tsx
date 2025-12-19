import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Zap, Menu, X } from 'lucide-react';
import { ResellerSidebar } from '@/components/reseller/ResellerSidebar';
import { ResellerTopBar } from '@/components/reseller/ResellerTopBar';
import { LeadInboxReseller } from '@/components/reseller/LeadInboxReseller';
import { DemoSharingHub } from '@/components/reseller/DemoSharingHub';
import { SalesScriptAI } from '@/components/reseller/SalesScriptAI';
import { ResellerWallet } from '@/components/reseller/ResellerWallet';
import { CustomerChatMasked } from '@/components/reseller/CustomerChatMasked';
import { MarketingToolkit } from '@/components/reseller/MarketingToolkit';
import { ResellerPerformanceBoard } from '@/components/reseller/ResellerPerformanceBoard';
import { MicroTrainingLessons } from '@/components/reseller/MicroTrainingLessons';

// Dashboard Overview
const DashboardOverview = () => {
  const metrics = [
    { label: 'Total Leads', value: '234', change: '+18 this week', color: 'neon-blue' },
    { label: 'Conversions', value: '42', change: '18% rate', color: 'neon-green' },
    { label: 'Commission', value: '₹1.26L', change: '+₹15K pending', color: 'neon-purple' },
    { label: 'Active Shares', value: '89', change: '12 today', color: 'neon-teal' },
    { label: 'Wallet Balance', value: '₹85K', change: 'Withdrawable', color: 'neon-orange' },
    { label: 'Monthly Target', value: '78%', change: '₹22K to go', color: 'primary' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-foreground">
          Reseller <span className="text-neon-blue">Dashboard</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track your performance and earnings</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-panel p-4 border border-border/30 hover:border-neon-blue/30 transition-all"
          >
            <span className="text-xs text-muted-foreground">{metric.label}</span>
            <p className="text-2xl font-mono font-bold text-foreground">{metric.value}</p>
            <p className="text-xs text-neon-blue">{metric.change}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ResellerDashboard = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeItem) {
      case 'leads': return <LeadInboxReseller />;
      case 'demos': return <DemoSharingHub />;
      case 'scripts': return <SalesScriptAI />;
      case 'wallet': return <ResellerWallet />;
      case 'chat': return <CustomerChatMasked />;
      case 'marketing': return <MarketingToolkit />;
      case 'performance': return <ResellerPerformanceBoard />;
      case 'training': return <MicroTrainingLessons />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(222,47%,4%)] via-[hsl(220,50%,7%)] to-[hsl(217,55%,5%)]">
      <ResellerSidebar
        activeItem={activeItem}
        onItemChange={setActiveItem}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <ResellerTopBar
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />

        <div className="p-4 lg:p-6">
          {renderContent()}
        </div>

        {/* AI Assistant */}
        <motion.div
          className="fixed bottom-6 right-6 glass-panel px-4 py-3 rounded-full flex items-center gap-3 cursor-pointer hover:border-neon-blue/50 border border-border/30 transition-all"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            className="w-3 h-3 rounded-full bg-neon-green"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm text-muted-foreground">AI Replying to 3 leads</span>
          <Bot className="w-4 h-4 text-neon-blue" />
        </motion.div>
      </main>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute left-0 top-0 bottom-0 w-64 glass-panel border-r border-border/30 p-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-background" />
                </div>
                <div>
                  <p className="font-mono font-bold text-sm text-foreground">SOFTWARE VALA</p>
                  <p className="text-[10px] text-neon-blue">Reseller Portal</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResellerDashboard;
