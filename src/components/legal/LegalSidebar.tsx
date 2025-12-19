import { motion } from "framer-motion";
import { 
  Scale, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Building2, 
  Shield,
  BookOpen,
  Gavel,
  AlertTriangle,
  ClipboardList,
  Eye,
  Lock,
  Key,
  Globe
} from "lucide-react";

interface LegalSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const LegalSidebar = ({ activeSection, setActiveSection }: LegalSidebarProps) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "templates", label: "Contract Templates", icon: FileText },
    { id: "client-contracts", label: "Client Contracts", icon: Users },
    { id: "franchise-agreements", label: "Franchise Agreements", icon: Building2 },
    { id: "developer-nda", label: "Developer NDA & IP", icon: Shield },
    { id: "policy-center", label: "Policy Center", icon: BookOpen },
    { id: "compliance", label: "Compliance Rulebook", icon: Gavel },
    { id: "disputes", label: "Dispute Tracker", icon: AlertTriangle },
    { id: "risk-analysis", label: "Risk Analysis", icon: AlertTriangle },
    { id: "audit-logs", label: "Audit Logs", icon: ClipboardList },
    { id: "ip-protection", label: "IP Protection", icon: Lock },
    { id: "license-manager", label: "License Manager", icon: Key },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 bg-gradient-to-b from-stone-900 to-stone-950 border-r border-amber-900/30 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-amber-900/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/50">
            <Scale className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Legal & Compliance</h1>
            <p className="text-xs text-amber-500/70">Manager Dashboard</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <motion.div 
          className="mt-4 p-3 rounded-lg bg-stone-800/50 border border-amber-900/30"
          animate={{ boxShadow: ["0 0 15px rgba(245,158,11,0.1)", "0 0 25px rgba(245,158,11,0.2)", "0 0 15px rgba(245,158,11,0.1)"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-400 font-medium">Compliance Active</span>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-amber-600/20 to-amber-700/10 text-amber-400 border border-amber-600/30"
                  : "text-stone-400 hover:text-amber-400 hover:bg-stone-800/50"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-amber-500" : ""}`} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="legalActiveIndicator"
                  className="ml-auto w-2 h-2 rounded-full bg-amber-500"
                  initial={false}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-amber-900/30">
        <div className="p-3 rounded-lg bg-stone-800/30 border border-stone-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-stone-500" />
            <span className="text-xs text-stone-500">Jurisdiction</span>
          </div>
          <p className="text-sm text-stone-300">Global Multi-Region</p>
        </div>
      </div>
    </motion.aside>
  );
};

export default LegalSidebar;
