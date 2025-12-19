import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  ListTodo, 
  BarChart3, 
  Heart, 
  Lightbulb,
  Wallet, 
  Bell, 
  User,
  Zap,
  DollarSign
} from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "lead-manager", label: "Lead Manager", icon: Users, path: "/lead-manager" },
  { id: "task-manager", label: "Task Manager", icon: ListTodo, path: "/task-manager" },
  { id: "performance", label: "Performance Manager", icon: BarChart3, path: "/performance", active: true },
  { id: "client-success", label: "Client Success", icon: Heart, path: "/client-success" },
  { id: "rnd", label: "R&D", icon: Lightbulb, path: "/rnd-dashboard" },
  { id: "finance", label: "Finance", icon: DollarSign, path: "#" },
  { id: "wallet", label: "Wallet", icon: Wallet, path: "#" },
  { id: "notifications", label: "Notifications", icon: Bell, path: "#", badge: 4 },
  { id: "profile", label: "Profile", icon: User, path: "#" },
];

export const PerformanceSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-slate-900/90 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(6, 182, 212, 0.3)",
                "0 0 40px rgba(6, 182, 212, 0.5)",
                "0 0 20px rgba(6, 182, 212, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <p className="font-bold text-white text-sm">SOFTWARE VALA</p>
            <p className="text-xs text-cyan-400">Performance Hub</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.active || location.pathname === item.path;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => item.path !== "#" && navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                isActive 
                  ? "bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-white border border-cyan-500/50" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 5 }}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : ""}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Live Status */}
      <div className="p-4 border-t border-cyan-500/20">
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/30">
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs text-slate-400">System Live</span>
          </div>
          <p className="text-xs text-cyan-400">All metrics updating in real-time</p>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-cyan-500/20">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
            PM
          </div>
          <div className="flex-1">
            <p className="text-sm text-white">Performance Manager</p>
            <p className="text-xs text-slate-500">vala(pm)0001</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
