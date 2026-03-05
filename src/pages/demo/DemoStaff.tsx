/**
 * DEMO: Staff Dashboard
 * Standalone demo — no auth or database calls required.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CheckSquare, MessageSquare, Bell,
  Clock, Calendar, FileText, User, LogOut,
  ChevronLeft, ChevronRight, Eye, ArrowLeft, Zap,
  Headphones, Star, TrendingUp, Target, Settings,
  AlertCircle, CheckCircle, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import softwareValaLogo from "@/assets/software-vala-logo.png";

// ─── Mock Data ────────────────────────────────────────────────────
const MOCK_STATS = [
  { label: "My Tasks Today", value: "12", change: "7 completed", icon: CheckSquare, color: "text-green-500" },
  { label: "Open Tickets", value: "5", change: "2 urgent", icon: Headphones, color: "text-blue-500" },
  { label: "Pending Replies", value: "8", change: "3 overdue", icon: MessageSquare, color: "text-orange-500" },
  { label: "My Rating", value: "4.7★", change: "From 48 reviews", icon: Star, color: "text-yellow-500" },
];

const MOCK_MY_TASKS = [
  { id: 1, title: "Follow up with lead #LM-442", priority: "high", due: "11:00 AM", done: false },
  { id: 2, title: "Send demo credentials to client", priority: "high", due: "12:30 PM", done: true },
  { id: 3, title: "Update CRM notes for Raj Industries", priority: "medium", due: "2:00 PM", done: false },
  { id: 4, title: "Respond to support ticket #ST-891", priority: "medium", due: "3:30 PM", done: false },
  { id: 5, title: "Complete daily activity report", priority: "low", due: "6:00 PM", done: false },
  { id: 6, title: "Call back missed number +91-9876543210", priority: "high", due: "ASAP", done: false },
];

const MOCK_TICKETS = [
  { id: "ST-891", client: "ABC Enterprises", issue: "Demo server not loading", status: "open", urgency: "high" },
  { id: "ST-887", client: "Sharma Retail", issue: "Invoice generation error", status: "in-progress", urgency: "medium" },
  { id: "ST-880", client: "Tech Solutions Ltd", issue: "Password reset request", status: "open", urgency: "low" },
  { id: "ST-875", client: "Gupta Foods", issue: "Training session booking", status: "resolved", urgency: "low" },
];

const MOCK_SCHEDULE = [
  { time: "10:00 AM", event: "Product demo — Restaurant POS", type: "demo" },
  { time: "12:00 PM", event: "Lunch break", type: "break" },
  { time: "2:00 PM", event: "Client onboarding call — ABC Enterprises", type: "call" },
  { time: "3:30 PM", event: "Team standup meeting", type: "meeting" },
  { time: "5:00 PM", event: "Submit daily report", type: "task" },
];

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "My Tasks", icon: CheckSquare, badge: 12 },
  { id: "tickets", label: "Support Tickets", icon: Headphones, badge: 5 },
  { id: "messages", label: "Messages", icon: MessageSquare, badge: 8 },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "leads", label: "My Leads", icon: Target },
  { id: "reports", label: "Daily Report", icon: FileText },
  { id: "profile", label: "My Profile", icon: User },
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
      {/* My Tasks */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-green-500" /> Today's Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {MOCK_MY_TASKS.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                task.done ? "opacity-50" : "hover:bg-muted/50"
              }`}
            >
              <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center ${
                task.done ? "bg-green-500 border-green-500" : "border-muted-foreground"
              }`}>
                {task.done && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className={`flex-1 text-sm ${task.done ? "line-through" : ""}`}>{task.title}</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={task.priority === "high" ? "destructive" : "outline"}
                  className="text-[10px] h-4 px-1"
                >
                  {task.priority}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  <Clock className="w-3 h-3 inline mr-0.5" />{task.due}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" /> Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {MOCK_SCHEDULE.map((item) => (
            <div key={item.time} className="flex items-start gap-2 text-sm">
              <span className="text-xs text-muted-foreground w-20 flex-shrink-0 mt-0.5">{item.time}</span>
              <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                item.type === "demo" ? "bg-purple-500" :
                item.type === "call" ? "bg-blue-500" :
                item.type === "meeting" ? "bg-green-500" :
                item.type === "break" ? "bg-gray-400" : "bg-orange-500"
              }`} />
              <span className="text-xs">{item.event}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>

    {/* Support Tickets */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Headphones className="w-4 h-4 text-blue-500" /> My Support Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {MOCK_TICKETS.map((ticket) => (
            <div key={ticket.id} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors">
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono">
                {ticket.id}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ticket.client}</p>
                <p className="text-xs text-muted-foreground truncate">{ticket.issue}</p>
              </div>
              <Badge
                variant={
                  ticket.status === "resolved" ? "secondary" :
                  ticket.status === "in-progress" ? "outline" : "destructive"
                }
                className="text-[10px] h-5 px-1.5 hidden sm:flex"
              >
                {ticket.status}
              </Badge>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                ticket.urgency === "high" ? "bg-red-500" :
                ticket.urgency === "medium" ? "bg-yellow-500" : "bg-green-500"
              }`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const DemoStaff = () => {
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
      <div className="bg-teal-600 text-white text-center py-1.5 text-xs font-medium flex items-center justify-center gap-2">
        <Eye className="w-3 h-3" />
        DEMO MODE — Staff Dashboard · No real data
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
                <p className="text-xs text-muted-foreground truncate">Staff Portal</p>
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
                    ? "bg-teal-600 text-white"
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
              <p className="text-xs text-muted-foreground">Staff · staff@softwarevala.com</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive rounded-full text-[9px] text-destructive-foreground flex items-center justify-center">
                  4
                </span>
              </Button>
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted">
                <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                  SF
                </div>
                <span className="text-xs font-medium hidden sm:block">Staff</span>
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

export default DemoStaff;
