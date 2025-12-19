import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Link2, Wallet, MessageSquare, 
  GraduationCap, HeadphonesIcon, Bot, BarChart3, Target,
  Megaphone, Star, Settings, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { LeadInboxReseller } from '@/components/reseller/LeadInboxReseller';
import { DemoSharingHub } from '@/components/reseller/DemoSharingHub';
import { SalesScriptAI } from '@/components/reseller/SalesScriptAI';
import { ResellerWallet } from '@/components/reseller/ResellerWallet';
import { CustomerChatMasked } from '@/components/reseller/CustomerChatMasked';
import { MarketingToolkit } from '@/components/reseller/MarketingToolkit';
import { ResellerPerformanceBoard } from '@/components/reseller/ResellerPerformanceBoard';
import { MicroTrainingLessons } from '@/components/reseller/MicroTrainingLessons';
import ResellerEscalations from '@/components/reseller/ResellerEscalations';
import ResellerTargets from '@/components/reseller/ResellerTargets';
import ResellerDash from '@/components/reseller/ResellerDash';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Lead Inbox', icon: Users, badge: 12 },
  { id: 'demos', label: 'Demo Sharing', icon: Link2 },
  { id: 'scripts', label: 'AI Sales Script', icon: Bot, badge: 'AI' },
  { id: 'wallet', label: 'Wallet & Commission', icon: Wallet },
  { id: 'chat', label: 'Customer Chat', icon: MessageSquare, badge: 5 },
  { id: 'marketing', label: 'Marketing Toolkit', icon: Megaphone },
  { id: 'targets', label: 'Targets & Goals', icon: Target },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'escalations', label: 'Escalations', icon: HeadphonesIcon },
  { id: 'training', label: 'Micro Training', icon: GraduationCap },
];

const ResellerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'leads': return <LeadInboxReseller />;
      case 'demos': return <DemoSharingHub />;
      case 'scripts': return <SalesScriptAI />;
      case 'wallet': return <ResellerWallet />;
      case 'chat': return <CustomerChatMasked />;
      case 'marketing': return <MarketingToolkit />;
      case 'performance': return <ResellerPerformanceBoard />;
      case 'training': return <MicroTrainingLessons />;
      case 'escalations': return <ResellerEscalations />;
      case 'targets': return <ResellerTargets />;
      default: return <ResellerDash />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.1),transparent_50%)]" />
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <pattern id="reseller-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="1" fill="currentColor" className="text-emerald-400" />
              <line x1="40" y1="0" x2="40" y2="80" stroke="currentColor" strokeWidth="0.2" className="text-teal-500" />
              <line x1="0" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="0.2" className="text-teal-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#reseller-grid)" />
        </svg>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -40, 0], opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
            transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-emerald-500/20 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white">SOFTWARE VALA</h1>
            <p className="text-xs text-emerald-400">Reseller Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-emerald-400">Online</span>
          </motion.div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`fixed left-0 top-16 bottom-0 ${collapsed ? 'w-20' : 'w-64'} bg-slate-900/60 backdrop-blur-xl border-r border-emerald-500/20 z-40 transition-all duration-300`}
        >
          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-6 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/50 hover:bg-emerald-400 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Navigation */}
          <nav className="p-4 space-y-2 mt-4">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : 'hover:bg-slate-800/50 text-slate-400 hover:text-emerald-400'
                }`}
              >
                <div className={`relative ${activeSection === item.id ? 'text-emerald-400' : ''}`}>
                  <item.icon className="w-5 h-5" />
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="reseller-sidebar-glow"
                      className="absolute inset-0 bg-emerald-400/30 blur-md rounded-full"
                    />
                  )}
                </div>
                {!collapsed && (
                  <>
                    <span className="font-medium flex-1 text-left text-sm">{item.label}</span>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.badge === 'AI' 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {activeSection === item.id && (
                      <motion.div
                        layoutId="reseller-active-dot"
                        className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
                      />
                    )}
                  </>
                )}
              </motion.button>
            ))}
          </nav>

          {/* Performance Widget */}
          {!collapsed && (
            <div className="absolute bottom-20 left-4 right-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-emerald-400 font-semibold">Performance</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Conversion</span>
                      <span className="text-emerald-400">78%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        initial={{ width: 0 }}
                        animate={{ width: '78%' }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Rating</span>
                      <span className="text-amber-400">4.2/5</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: '84%' }}
                        transition={{ duration: 1, delay: 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Button */}
          <div className="absolute bottom-4 left-4 right-4">
            <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 transition-all ${collapsed ? 'justify-center' : ''}`}>
              <Settings className="w-5 h-5" />
              {!collapsed && <span className="font-medium">Settings</span>}
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} p-6 min-h-screen transition-all duration-300`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ResellerDashboard;
