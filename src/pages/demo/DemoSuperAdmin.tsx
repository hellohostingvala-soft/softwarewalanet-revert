/**
 * DEMO: Super Admin Dashboard
 * Standalone demo — no auth or database calls required.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Shield, Bell, TrendingUp,
  Server, Globe, Settings, LogOut, ChevronLeft, ChevronRight,
  Activity, DollarSign, Package, Star, AlertTriangle,
  CheckCircle, Clock, Zap, BarChart3, Eye, Lock,
  Building2, Briefcase, ArrowLeft, Database, Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import softwareValaLogo from "@/assets/software-vala-logo.png";

// ─── Mock Data ───────────────────────────────────────────────────
const MOCK_STATS = [
  { label: "Total Users", value: "12,847", change: "+8.2%", icon: Users, color: "text-blue-500" },
  { label: "Active Franchises", value: "342", change: "+3.1%", icon: Building2, color: "text-green-500" },
  { label: "Revenue (MTD)", value: "₹48.6L", change: "+15.4%", icon: DollarSign, color: "text-yellow-500" },
  { label: "Demos Running", value: "127", change: "+22%", icon: Server, color: "text-purple-500" },
];

const MOCK_RECENT_ACTIVITY = [
  { id: 1, event: "New franchise registered", user: "Rahul Sharma", time: "2 min ago", type: "success" },
  { id: 2, event: "Demo server restarted", user: "System Auto", time: "5 min ago", type: "warning" },
  { id: 3, event: "Payment received ₹1,25,000", user: "Prime Client #287", time: "12 min ago", type: "success" },
  { id: 4, event: "Lead assigned to franchise", user: "Delhi Region", time: "18 min ago", type: "info" },
  { id: 5, event: "User role upgraded to Prime", user: "Priya Singh", time: "30 min ago", type: "success" },
  { id: 6, event: "API rate limit warning", user: "SaaS-HRM module", time: "45 min ago", type: "warning" },
];

const MOCK_SYSTEM_HEALTH = [
  { name: "API Gateway", status: 99.9, color: "bg-green-500" },
  { name: "Demo Servers", status: 97.2, color: "bg-green-500" },
  { name: "Auth Service", status: 100, color: "bg-green-500" },
  { name: "Payment Gateway", status: 99.5, color: "bg-green-500" },
  { name: "Database Cluster", status: 98.1, color: "bg-green-500" },
];

const MOCK_TOP_FRANCHISES = [
  { name: "Mumbai Central", leads: 142, revenue: "₹8.4L", rating: 4.9 },
  { name: "Delhi North", leads: 128, revenue: "₹7.1L", rating: 4.8 },
  { name: "Bangalore Tech Hub", leads: 116, revenue: "₹6.9L", rating: 4.7 },
  { name: "Chennai Metro", leads: 98, revenue: "₹5.8L", rating: 4.6 },
];

// ─── Sidebar Menu Items ───────────────────────────────────────────
const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users, badge: "1.2K" },
  { id: "franchises", label: "Franchises", icon: Building2, badge: 342 },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "servers", label: "Demo Servers", icon: Server, badge: "127" },
  { id: "security", label: "Security", icon: Shield },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "api", label: "API Manager", icon: Database },
  { id: "roles", label: "Roles & Perms", icon: Key },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── Section Content ──────────────────────────────────────────────
const SectionPlaceholder = ({ title, description }: { title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
      <Zap className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-muted-foreground max-w-sm">{description}</p>
    <Badge variant="outline">Demo Mode</Badge>
  </div>
);

const DashboardContent = () => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {MOCK_STATS.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-background/50 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-green-500">{stat.change} this month</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Recent Activity */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {MOCK_RECENT_ACTIVITY.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                activity.type === "success" ? "bg-green-500" :
                activity.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.event}</p>
                <p className="text-xs text-muted-foreground">{activity.user}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" /> System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_SYSTEM_HEALTH.map((service) => (
            <div key={service.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{service.name}</span>
                <span className="font-medium text-green-500">{service.status}%</span>
              </div>
              <Progress value={service.status} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>

    {/* Top Franchises */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" /> Top Franchises This Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOCK_TOP_FRANCHISES.map((franchise, i) => (
            <div key={franchise.name} className="p-3 border rounded-lg space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">#{i + 1}</Badge>
                <span className="text-xs text-yellow-500">★ {franchise.rating}</span>
              </div>
              <p className="text-sm font-semibold">{franchise.name}</p>
              <p className="text-xs text-muted-foreground">{franchise.leads} leads · {franchise.revenue}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────
const DemoSuperAdmin = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const renderContent = () => {
    if (activeSection === "dashboard") return <DashboardContent />;
    const item = menuItems.find((m) => m.id === activeSection);
    return (
      <SectionPlaceholder
        title={item?.label ?? "Section"}
        description={`The ${item?.label} module is fully functional in the live system. This is a demo preview.`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Demo Banner */}
      <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs font-medium flex items-center justify-center gap-2">
        <Eye className="w-3 h-3" />
        DEMO MODE — Super Admin Dashboard · No real data
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-xs text-primary-foreground hover:bg-primary-foreground/20 ml-4"
          onClick={() => navigate("/demos/public")}
        >
          <ArrowLeft className="w-3 h-3 mr-1" /> Back to Demos
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${collapsed ? "w-16" : "w-56"} flex-shrink-0 bg-card border-r flex flex-col transition-all duration-300`}
        >
          {/* Logo */}
          <div className="p-3 border-b flex items-center gap-2">
            <img src={softwareValaLogo} alt="Logo" className="w-8 h-8 rounded-lg flex-shrink-0" />
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">Software Vala</p>
                <p className="text-xs text-muted-foreground truncate">Super Admin</p>
              </div>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* Collapse + Logout */}
          <div className="p-2 border-t space-y-0.5">
            <button
              onClick={() => navigate("/demos/public")}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Exit Demo</span>}
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-card border-b px-4 py-2.5 flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold">
                {menuItems.find((m) => m.id === activeSection)?.label ?? "Dashboard"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Super Admin · demo@softwarevala.com
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full text-[9px] text-destructive-foreground flex items-center justify-center">
                  5
                </span>
              </Button>
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  SA
                </div>
                <span className="text-xs font-medium hidden sm:block">Super Admin</span>
              </div>
            </div>
          </header>

          {/* Page */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DemoSuperAdmin;
