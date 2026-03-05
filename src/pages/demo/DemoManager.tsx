/**
 * DEMO: Manager Dashboard
 * Standalone demo — no auth or database calls required.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Target, TrendingUp, Bell,
  Calendar, CheckSquare, MessageSquare, FileText,
  LogOut, ChevronLeft, ChevronRight, Eye, ArrowLeft,
  Zap, BarChart3, Clock, Award, Settings, GitBranch,
  UserCheck, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import softwareValaLogo from "@/assets/software-vala-logo.png";

// ─── Mock Data ────────────────────────────────────────────────────
const MOCK_STATS = [
  { label: "Team Members", value: "24", change: "2 on leave", icon: Users, color: "text-blue-500" },
  { label: "Tasks This Week", value: "148", change: "92% completed", icon: CheckSquare, color: "text-green-500" },
  { label: "Leads Assigned", value: "56", change: "38 in progress", icon: Target, color: "text-purple-500" },
  { label: "SLA Breaches", value: "2", change: "Down from 7", icon: AlertCircle, color: "text-red-500" },
];

const MOCK_TEAM = [
  { name: "Priya Gupta", role: "Senior Dev", tasks: 12, completed: 9, status: "online" },
  { name: "Rahul Verma", role: "Lead Designer", tasks: 8, completed: 8, status: "online" },
  { name: "Sita Reddy", role: "QA Engineer", tasks: 15, completed: 11, status: "busy" },
  { name: "Amit Singh", role: "Backend Dev", tasks: 10, completed: 7, status: "online" },
  { name: "Kavya Nair", role: "Frontend Dev", tasks: 9, completed: 6, status: "offline" },
];

const MOCK_TASKS = [
  { id: 1, title: "Review Q1 sales report", due: "Today", priority: "high", assignee: "Priya G." },
  { id: 2, title: "Interview candidate DEV-112", due: "Tomorrow", priority: "medium", assignee: "Self" },
  { id: 3, title: "Deploy v2.4 hotfix", due: "Today", priority: "high", assignee: "Rahul V." },
  { id: 4, title: "Client demo prep — SchoolERP", due: "Thu", priority: "medium", assignee: "Sita R." },
  { id: 5, title: "Weekly team sync", due: "Fri", priority: "low", assignee: "Team" },
];

const MOCK_GOALS = [
  { name: "Lead Conversion Rate", target: 30, current: 26 },
  { name: "Demo Satisfaction Score", target: 90, current: 88 },
  { name: "Ticket Resolution < 24h", target: 95, current: 91 },
  { name: "Team Utilisation", target: 85, current: 79 },
];

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "team", label: "My Team", icon: Users, badge: 24 },
  { id: "tasks", label: "Tasks", icon: CheckSquare, badge: 148 },
  { id: "leads", label: "Leads", icon: Target, badge: 56 },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "messages", label: "Messages", icon: MessageSquare, badge: 7 },
  { id: "goals", label: "Goals & KPIs", icon: Award },
  { id: "settings", label: "Settings", icon: Settings },
];

const SectionPlaceholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
      <Zap className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-muted-foreground max-w-sm">
      This module is fully operational in the live system. Demo mode shows a preview.
    </p>
    <Badge variant="outline">Demo Mode</Badge>
  </div>
);

const DashboardContent = () => (
  <div className="space-y-6">
    {/* Stats */}
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
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Team Performance */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-500" /> Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_TEAM.map((member) => {
            const pct = Math.round((member.completed / member.tasks) * 100);
            return (
              <div key={member.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      member.status === "online" ? "bg-green-500" :
                      member.status === "busy" ? "bg-yellow-500" : "bg-gray-400"
                    }`} />
                    <span className="font-medium">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{member.role}</span>
                  </div>
                  <span className="text-xs font-medium">
                    {member.completed}/{member.tasks} tasks
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Goals */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" /> KPI Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOCK_GOALS.map((goal) => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <div key={goal.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground truncate mr-2">{goal.name}</span>
                  <span className={`font-medium ${pct >= 95 ? "text-green-500" : pct >= 85 ? "text-yellow-500" : "text-red-500"}`}>
                    {goal.current}/{goal.target}
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>

    {/* Upcoming Tasks */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-green-500" /> Upcoming Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {MOCK_TASKS.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                task.priority === "high" ? "bg-red-500" :
                task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
              }`} />
              <span className="flex-1 text-sm">{task.title}</span>
              <span className="text-xs text-muted-foreground">{task.assignee}</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1 gap-1">
                <Clock className="w-2.5 h-2.5" /> {task.due}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const DemoManager = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const renderContent = () => {
    if (activeSection === "dashboard") return <DashboardContent />;
    const item = menuItems.find((m) => m.id === activeSection);
    return <SectionPlaceholder title={item?.label ?? "Section"} />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Demo Banner */}
      <div className="bg-purple-600 text-white text-center py-1.5 text-xs font-medium flex items-center justify-center gap-2">
        <Eye className="w-3 h-3" />
        DEMO MODE — Manager Dashboard · No real data
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-xs text-white hover:bg-white/20 ml-4"
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
          <div className="p-3 border-b flex items-center gap-2">
            <img src={softwareValaLogo} alt="Logo" className="w-8 h-8 rounded-lg flex-shrink-0" />
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">Software Vala</p>
                <p className="text-xs text-muted-foreground truncate">Manager</p>
              </div>
            )}
          </div>

          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === item.id
                    ? "bg-purple-600 text-white"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>

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
              {collapsed ? <ChevronRight className="w-4 h-4 flex-shrink-0" /> : (
                <><ChevronLeft className="w-4 h-4 flex-shrink-0" /><span>Collapse</span></>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card border-b px-4 py-2.5 flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold">
                {menuItems.find((m) => m.id === activeSection)?.label ?? "Dashboard"}
              </h1>
              <p className="text-xs text-muted-foreground">Manager · manager@softwarevala.com</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full text-[9px] text-destructive-foreground flex items-center justify-center">
                  7
                </span>
              </Button>
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted">
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  MG
                </div>
                <span className="text-xs font-medium hidden sm:block">Manager</span>
              </div>
            </div>
          </header>

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

export default DemoManager;
