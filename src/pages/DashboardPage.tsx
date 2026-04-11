import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CalendarOff, 
  DollarSign, 
  Building2, 
  Activity,
  TrendingUp,
  Clock
} from "lucide-react";
import { dashboardApi } from "@/lib/dashboardApi";
import { toast } from "sonner";

interface Stats {
  totalEmployees: number;
  activeLeaves: number;
  totalPayroll: number;
  activeCompanies: number;
  presentToday?: number;
  attendanceRate?: number;
  totalDepartments?: number;
}

export default function DashboardPage() {
  const { user, isSuperAdmin } = useAuth();

  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeLeaves: 0,
    totalPayroll: 0,
    activeCompanies: 0,
    presentToday: 0,
    attendanceRate: 0,
    totalDepartments: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.stats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Main KPI Cards (improved for 300 employees context)
  const mainStatCards = [
    {
      label: "Total Employees",
      value: stats.totalEmployees.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950",
      trend: "+12 this month",
    },
    {
      label: "Present Today",
      value: stats.presentToday ?? 0,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950",
      trend: `${stats.attendanceRate ?? 0}% attendance rate`,
    },
    {
      label: "Active Leaves",
      value: stats.activeLeaves,
      icon: CalendarOff,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-950",
      trend: "Today",
    },
    {
      label: "Total Payroll",
      value: `₦${stats.totalPayroll.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-950",
      trend: "This month",
    },
  ];

  const superAdminCard = isSuperAdmin
    ? {
        label: "Active Companies",
        value: stats.activeCompanies.toLocaleString(),
        icon: Building2,
        color: "text-purple-600",
        bgColor: "bg-purple-100 dark:bg-purple-950",
        trend: "Managed",
      }
    : null;

  return (
    <div className="space-y-8 p-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-xl text-muted-foreground mt-1">
            Welcome back, {user?.first_name || "Admin"} 👋
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={fetchDashboardStats} variant="outline" size="sm">
            Refresh
          </Button>
          <Button size="sm">View Reports</Button>
        </div>
      </div>

      {/* KPI Cards - Better Visual Design */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mainStatCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-semibold tracking-tight">
                    {loading ? "—" : stat.value}
                  </p>
                  {stat.trend && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </p>
                  )}
                </div>

                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.bgColor}`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Super Admin Card */}
        {superAdminCard && (
          <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    {superAdminCard.label}
                  </p>
                  <p className="text-4xl font-semibold tracking-tight">
                    {loading ? "—" : superAdminCard.value}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {superAdminCard.trend}
                  </p>
                </div>

                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${superAdminCard.bgColor}`}>
                  <superAdminCard.icon className={`h-7 w-7 ${superAdminCard.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Links / Next Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm">Present</span>
              <span className="font-semibold text-green-600">
                {stats.presentToday || 0} / {stats.totalEmployees}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-sm">On Leave</span>
              <span className="font-semibold text-orange-600">
                {stats.activeLeaves}
              </span>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => window.location.href = '/attendance'}
            >
              View Full Attendance
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Loading recent activity...
              </p>
            ) : (
              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  Activity feed will appear here as employees clock in/out, 
                  leaves are approved, etc.
                </p>
                {/* You can later map real activity data here */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs text-muted-foreground">
        Last updated: {new Date().toLocaleTimeString()} • HR Suite Connect
      </p>
    </div>
  );
}