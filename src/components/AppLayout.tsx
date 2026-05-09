import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi } from "@/lib/dashboardApi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
/*
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarOff,
  DollarSign,
  CreditCard,
  Bell,
  Network,
  User,
  LogOut,
  Menu,
  X,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Bot,
  Clock,
  Building2,

  // Added Icons
  Wallet,
  UserCog,
  FileSpreadsheet,
  CalendarDays,
  CalendarRange,
  Landmark,
  BadgeDollarSign,
  FolderTree,
  ClipboardList,
  ShieldCheck,
  PieChart,
  Banknote,
  Receipt,
  HandCoins,
  TrendingUp,
  Layers3,
  NotebookTabs,
} from "lucide-react";
*/
import {
  // Layout & Navigation
  LayoutDashboard,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,

  // People & Organization
  Users,
  User,
  UserCog,
  Building2,
  Briefcase,

  // Attendance & Time
  CalendarCheck,
  CalendarOff,
  CalendarDays,
  CalendarRange,
  Clock,

  // Payroll & Finance
  DollarSign,
  CreditCard,
  Wallet,
  Banknote,
  Landmark,
  Receipt,
  HandCoins,
  BadgeDollarSign,

  // Reports & Analytics
  BarChart3,
  PieChart,
  TrendingUp,

  // System & Settings
  Settings,
  ShieldCheck,
  Network,
  Layers3,

  // Tasks & Data
  FileSpreadsheet,
  ClipboardList,
  FolderTree,
  NotebookTabs,

  // AI & Notifications
  Bot,
  Bell,

  // Auth / Actions
  LogOut,
} from "lucide-react";
type NavItem = {
  to?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  superOnly?: boolean;
  children?: NavItem[];
};

    const navItems: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },

  {
    label: "Team",
    icon: Users,
    children: [
      { to: "/employees", label: "All Employees", icon: Users },
      { to: "/departments", label: "Departments", icon: Building2 },
      { to: "/companies", label: "Company Setup", icon: Building2, superOnly: true },
    ],
  },

  {
    label: "Work & Attendance",
    icon: CalendarCheck,
    children: [
      { to: "/attendance", label: "Attendance Records", icon: CalendarCheck },
      { to: "/timesheets", label: "Timesheets", icon: Clock, superOnly: true },
      { to: "/shifts", label: "Work Shifts", icon: Clock, superOnly: true },
      { to: "/holidays", label: "Holidays", icon: CalendarDays },
    ],
  },

  {
    label: "Time Off",
    icon: CalendarOff,
    children: [
      { to: "/leave", label: "Leave Requests", icon: CalendarOff },
      { to: "/leave-balance", label: "Leave Balances", icon: CalendarRange },
      { to: "/leave-policy", label: "Leave Policies", icon: Settings },
    ],
  },

  {
    label: "Salary & Payroll",
    icon: DollarSign,
    children: [
      { to: "/payroll/runs", label: "Run Payroll", icon: DollarSign },
      { to: "/payroll/payslips", label: "Employee Payslips", icon: CreditCard,superOnly: true },
      { to: "/payroll/inputs", label: "Salary Inputs", icon: FileSpreadsheet,superOnly: true  },

      { to: "/payroll/components", label: "Pay Items (Allowances & Deductions)", icon: Wallet },
      { to: "/payroll/position-salary", label: "Salary by Role", icon: Briefcase,superOnly: true  },
      { to: "/payroll/employee-overrides", label: "Custom Employee Pay", icon: UserCog },
    ],
  },

  { to: "/ai", label: "AI Helper", icon: Bot },
  { to: "/notifications", label: "Alerts", icon: Bell },

  { to: "/settings", label: "System Settings", icon: Settings },

  { to: "/subscriptions", label: "Billing & Plans", icon: Wallet },
];
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // ================= CHAT STATE =================
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  // Filter nav items based on permissions
  const filteredNavItems = navItems.filter((item) => {
    if (item.superOnly) return isSuperAdmin;
    if (item.children) {
      return item.children.some((child) => !child.superOnly || isSuperAdmin);
    }
    return true;
  });

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isChildActive = (children: NavItem[] = []) =>
    children.some((child) => child.to && location.pathname.startsWith(child.to));

  const isActive = (item: NavItem): boolean => {
    if (item.to) return location.pathname.startsWith(item.to);
    if (item.children) return isChildActive(item.children);
    return false;
  };

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoadingChat(true);

    try {
      const { data } = await dashboardApi.chat({ message: userMessage.content });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data?.reply || data?.message || "No response from AI" },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong." }]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold tracking-tight">The Suit</span>
            )}
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNavItems.map((item, index) => {
            const active = isActive(item);
            const hasChildren = !!item.children;
            const isOpen = openDropdowns[item.label] ?? (hasChildren && isChildActive(item.children!));

            if (hasChildren) {
              return (
                <div key={index} className="space-y-1">
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="transition-transform duration-200">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Children */}
                  {isOpen && !sidebarCollapsed && (
                    <div className="ml-6 space-y-1 pl-2 border-l border-border/50">
                      {item.children!
                        .filter((child) => !child.superOnly || isSuperAdmin)
                        .map((child, cIndex) => {
                          const childActive = child.to && location.pathname.startsWith(child.to);
                          return (
                            <Link
                              key={cIndex}
                              to={child.to!}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                                childActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              <child.icon className="h-4 w-4 flex-shrink-0" />
                              {child.label}
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            }

            // Regular link
            return (
              <Link
                key={index}
                to={item.to!}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section at Bottom */}
        <div className="border-t border-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3 px-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col items-start text-left min-w-0">
                    <span className="font-medium text-sm truncate">
                      {user?.first_name} {user?.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-4 lg:px-6">
          <button className="lg:hidden mr-4" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="flex-1 flex items-center gap-3 lg:hidden">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Briefcase className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold tracking-tight">The Suit</span>
            </Link>
          </div>

          <div className="flex-1" />

          {/* Mobile User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { logout(); navigate("/login"); }}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
            <div className="bg-card w-72 h-full p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                <Link to="/dashboard" className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold">The Suit</span>
                </Link>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="space-y-6">
                {filteredNavItems.map((item, index) => {
                  if (item.children) {
                    return (
                      <div key={index} className="space-y-2">
                        <div className="px-4 text-sm font-semibold text-muted-foreground">{item.label}</div>
                        {item.children
                          .filter((c) => !c.superOnly || isSuperAdmin)
                          .map((child, cIndex) => (
                            <Link
                              key={cIndex}
                              to={child.to!}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                                location.pathname.startsWith(child.to!)
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              <child.icon className="h-5 w-5" />
                              {child.label}
                            </Link>
                          ))}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={index}
                      to={item.to!}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                        location.pathname.startsWith(item.to!)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* AI Chat Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="rounded-full h-14 w-14 shadow-xl text-lg"
          onClick={() => setChatOpen(true)}
        >
          💬
        </Button>
      </div>

      {/* AI Chat Modal */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-lg h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>AI Assistant</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-muted/30">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-sm max-w-[80%] ${
                  msg.role === "user" ? "bg-primary text-white ml-auto" : "bg-white border"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {loadingChat && <div className="text-sm text-muted-foreground">Thinking...</div>}
          </div>

          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder="Ask anything about payroll, attendance, or employees..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} disabled={loadingChat}>
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}