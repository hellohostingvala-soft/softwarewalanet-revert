import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, UserPlus, GraduationCap, ClipboardCheck,
  FileText, Award, Calendar, Settings, ChevronLeft, ChevronRight,
  Briefcase, Target, TrendingUp
} from 'lucide-react';
import { useState } from 'react';

interface HRSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'HR Dashboard', icon: LayoutDashboard },
  { id: 'hiring', label: 'Hiring Pipeline', icon: UserPlus, badge: 8 },
  { id: 'candidates', label: 'Candidates', icon: Users },
  { id: 'onboarding', label: 'Onboarding', icon: ClipboardCheck },
  { id: 'training', label: 'Training Programs', icon: GraduationCap },
  { id: 'performance', label: 'Performance Reviews', icon: TrendingUp },
  { id: 'documents', label: 'HR Documents', icon: FileText },
  { id: 'positions', label: 'Open Positions', icon: Briefcase },
  { id: 'goals', label: 'Goals & OKRs', icon: Target },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'calendar', label: 'HR Calendar', icon: Calendar },
];

const HRSidebar = ({ activeSection, setActiveSection }: HRSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-950 via-violet-950/20 to-slate-950 border-r border-violet-500/20 z-40"
    >
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-violet-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Users className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-white">HR & Training</h1>
              <p className="text-xs text-violet-400">People Operations</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-violet-500/50 hover:bg-violet-400 transition-colors z-50"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation */}
      <nav className="p-4 space-y-1 mt-4">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              whileHover={{ x: collapsed ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 border border-violet-500/50 text-violet-300 shadow-lg shadow-violet-500/10'
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-violet-300'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-violet-400' : ''}`} />
              {!collapsed && (
                <>
                  <span className="font-medium flex-1 text-left text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-400">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="hr-active"
                      className="w-2 h-2 rounded-full bg-violet-400"
                    />
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Stats Widget */}
      {!collapsed && (
        <div className="absolute bottom-20 left-4 right-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-violet-300 font-semibold">Team Overview</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-slate-800/50">
                <div className="text-xl font-bold text-white">156</div>
                <div className="text-[10px] text-slate-400">Total Staff</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-800/50">
                <div className="text-xl font-bold text-emerald-400">8</div>
                <div className="text-[10px] text-slate-400">Open Roles</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="absolute bottom-4 left-4 right-4">
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-violet-300 hover:bg-slate-800/50 transition-all ${collapsed ? 'justify-center' : ''}`}>
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Settings</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default HRSidebar;
