import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Zap } from 'lucide-react';
import FranchiseNewSidebar from '@/components/franchise/FranchiseNewSidebar';
import { FranchiseTopBar } from '@/components/franchise/FranchiseTopBar';
import FranchiseDash from '@/components/franchise/FranchiseDash';
import FranchiseLeadConsole from '@/components/franchise/FranchiseLeadConsole';
import FranchiseDemoPanel from '@/components/franchise/FranchiseDemoPanel';
import FranchiseWalletCommission from '@/components/franchise/FranchiseWalletCommission';
import FranchiseContractTerritory from '@/components/franchise/FranchiseContractTerritory';
import FranchiseAITraining from '@/components/franchise/FranchiseAITraining';
import FranchisePerformanceBoard from '@/components/franchise/FranchisePerformanceBoard';
import FranchiseEscalationScreen from '@/components/franchise/FranchiseEscalationScreen';
import { FranchiseAuditLogs } from '@/components/franchise/FranchiseAuditLogs';

const FranchiseDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'leads': return <FranchiseLeadConsole />;
      case 'demos': return <FranchiseDemoPanel />;
      case 'wallet': return <FranchiseWalletCommission />;
      case 'territory': return <FranchiseContractTerritory />;
      case 'training': return <FranchiseAITraining />;
      case 'performance': return <FranchisePerformanceBoard />;
      case 'escalations': return <FranchiseEscalationScreen />;
      case 'audit': return <FranchiseAuditLogs />;
      default: return <FranchiseDash />;
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(220,55%,6%)]">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, hsl(200,80%,50%)/0.08 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, hsl(280,70%,50%)/0.05 0%, transparent 40%),
            radial-gradient(circle at 40% 80%, hsl(160,70%,50%)/0.05 0%, transparent 40%)
          `
        }} />
      </div>

      <FranchiseNewSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="relative transition-all duration-300 lg:ml-64">
        <FranchiseTopBar
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />

        <div className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* AI Assistant Indicator */}
        <motion.div
          className="fixed bottom-6 right-6 bg-[hsl(220,50%,12%)]/90 backdrop-blur-xl px-4 py-3 rounded-full flex items-center gap-3 cursor-pointer border border-[hsl(200,80%,40%)]/30 hover:border-[hsl(200,80%,50%)]/50 transition-all shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-[hsl(160,70%,50%)]"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm text-[hsl(220,20%,70%)]">AI Assistant Active</span>
          <Bot className="w-4 h-4 text-[hsl(200,80%,60%)]" />
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
            <div className="absolute inset-0 bg-[hsl(220,55%,4%)]/90 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-[hsl(220,60%,8%)] border-r border-[hsl(200,80%,40%)]/20 p-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(200,80%,50%)] to-[hsl(180,70%,45%)] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">SOFTWARE VALA</p>
                  <p className="text-[10px] text-[hsl(200,80%,60%)]">Franchise Portal</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FranchiseDashboard;
