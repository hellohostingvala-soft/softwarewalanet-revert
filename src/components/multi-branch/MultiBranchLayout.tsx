import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  Users,
  Receipt,
  Package,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  Menu,
  LogOut,
  User,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MenuItem {
  title: string;
  icon: React.ElementType;
  path?: string;
  children?: { title: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/multi-branch" },
  {
    title: "Branch Management",
    icon: Building2,
    children: [
      { title: "All Branches", path: "/multi-branch/branches" },
      { title: "Add Branch", path: "/multi-branch/branches/add" },
      { title: "Branch Admins", path: "/multi-branch/branches/admins" },
    ],
  },
  {
    title: "Employees",
    icon: Users,
    children: [
      { title: "All Employees", path: "/multi-branch/employees" },
      { title: "Roles & Access", path: "/multi-branch/employees/roles" },
    ],
  },
  {
    title: "Billing",
    icon: Receipt,
    children: [
      { title: "All Invoices", path: "/multi-branch/billing" },
      { title: "Create Invoice", path: "/multi-branch/billing/create" },
      { title: "Consolidated", path: "/multi-branch/billing/consolidated" },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    children: [
      { title: "Stock Overview", path: "/multi-branch/inventory" },
      { title: "Low Stock Alerts", path: "/multi-branch/inventory/alerts" },
    ],
  },
  { title: "Reports", icon: BarChart3, path: "/multi-branch/reports" },
  { title: "Settings", icon: Settings, path: "/multi-branch/settings" },
];

const branches = [
  { id: "hq", name: "Head Office", location: "Mumbai" },
  { id: "br1", name: "Branch 1", location: "Delhi" },
  { id: "br2", name: "Branch 2", location: "Bangalore" },
  { id: "br3", name: "Branch 3", location: "Chennai" },
];

export default function MultiBranchLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Branch Management"]);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const location = useLocation();

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title) ? prev.filter((m) => m !== title) : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (children?: { path: string }[]) =>
    children?.some((c) => location.pathname.startsWith(c.path));

  return (
    <div className="min-h-screen bg-slate-50 flex w-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-slate-900 text-white flex flex-col transition-all duration-300 fixed h-full z-40",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-700">
          <Building2 className="h-8 w-8 text-blue-400 flex-shrink-0" />
          {!sidebarCollapsed && (
            <span className="ml-3 font-bold text-lg">BranchPro</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "w-full flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors",
                      isParentActive(item.children) && "bg-slate-800 text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left text-sm">
                          {item.title}
                        </span>
                        {expandedMenus.includes(item.title) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                  {!sidebarCollapsed && expandedMenus.includes(item.title) && (
                    <div className="bg-slate-950">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={cn(
                            "block pl-12 pr-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors",
                            isActive(child.path) &&
                              "text-blue-400 bg-slate-800 border-r-2 border-blue-400"
                          )}
                        >
                          {child.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path!}
                  className={cn(
                    "flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors",
                    isActive(item.path!) &&
                      "bg-slate-800 text-white border-r-2 border-blue-400"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="ml-3 text-sm">{item.title}</span>
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-blue-600">SA</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Super Admin</p>
                <p className="text-xs text-slate-400 truncate">admin@company.com</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Branch Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[200px] justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{selectedBranch.name}</p>
                      <p className="text-xs text-slate-500">{selectedBranch.location}</p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px] bg-white z-50" align="start">
                <DropdownMenuLabel>Select Branch</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {branches.map((branch) => (
                  <DropdownMenuItem
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch)}
                    className={cn(
                      "cursor-pointer",
                      selectedBranch.id === branch.id && "bg-blue-50"
                    )}
                  >
                    <div>
                      <p className="font-medium">{branch.name}</p>
                      <p className="text-xs text-slate-500">{branch.location}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                className="pl-9 w-64 bg-slate-50 border-slate-200"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm">SA</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white z-50" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer text-red-600">
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
