import { useEffect, useState, useCallback, useMemo } from "react";
import { attendanceApi } from "@/lib/attendanceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Users, Clock, AlertTriangle, TrendingUp, RefreshCw, Download, Calendar 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "present": return "default" as const;
    case "late": return "secondary" as const;
    case "absent": return "destructive" as const;
    default: return "outline" as const;
  }
};

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [count, setCount] = useState(0);

  // Dashboard data
  const [dashboard, setDashboard] = useState({
    presentToday: 0,
    totalToday: 0,
    lateToday: 0,
    absentToday: 0,
    monthlyAverage: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Load Dashboard
  const loadDash = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const { data } = await attendanceApi.dashboard();
      console.log("dashboard", data)
      setDashboard({
        presentToday: data.attendance_count_currentday || 0,
        totalToday: data.total_employee_count || data.total_today || 0,
        lateToday: data.late_count || 0,
        absentToday: data.absent_today_count || data.absent_count || 0,
        monthlyAverage: data.monthly_average || 0,
      });
    } catch (err) {
      toast.error("Failed to load dashboard data");
      console.error(err);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // Load Attendance Records
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        page_size: pageSize,
        search: debouncedSearch,
        start_date: startDate,
        end_date: endDate,
      };

      if (status && status !== "all") params.status = status;

      const { data } = await attendanceApi.list(params);
      console.log("list", data)

      setRecords(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      toast.error("Failed to load attendance records");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, status, startDate, endDate]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadDash();
  }, [loadDash]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(count / pageSize);

  const presentPercentage = useMemo(() => {
    return dashboard.totalToday > 0 
      ? ((dashboard.presentToday / dashboard.totalToday) * 100).toFixed(1) 
      : "0";
  }, [dashboard]);

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

 /* const exportCSV = async () => {
    try {
      // You can replace this with actual API export endpoint if available
      const { data } = await attendanceApi.list({ .../* your filters );
      const csvContent = "data:text/csv;charset=utf-8," 
        + records.map(r => 
            `\( {r.employee_name}, \){r.department},\( {r.date}, \){r.clock_in},\( {r.clock_out}, \){r.total_hours},${r.status}`
          ).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `attendance_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Attendance exported successfully");
    } catch (err) {
      toast.error("Failed to export attendance");
    }
  };
*/
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview and detailed attendance records
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Present Today
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={loadDash} disabled={dashboardLoading}>
              <RefreshCw className={`h-4 w-4 ${dashboardLoading ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <>
                <div className="text-3xl font-bold text-green-600">
                  {dashboard.presentToday} <span className="text-xl text-muted-foreground">/ {dashboard.totalToday}</span>
                </div>
                <p className="text-sm text-green-600 mt-1 font-medium">
                  {presentPercentage}% attendance rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Late Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold text-orange-600">
                {dashboard.lateToday}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Absent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold text-red-600">
                {dashboard.absentToday}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold">
                {dashboard.monthlyAverage}%
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end bg-card p-4 rounded-xl border">
        <div className="flex-1 min-w-[280px]">
          <Input
            placeholder="Search employee name or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="w-auto"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="w-auto"
          />
        </div>

        <Button variant="outline" onClick={resetFilters}>
          Clear Filters
        </Button>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Attendance Records</CardTitle>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20">
                    <div className="flex flex-col items-center justify-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-medium">No attendance records found</h3>
                      <p className="text-muted-foreground mt-2">
                        Try adjusting your filters or check back later
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow key={r.id || r.employee_id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{r.employee_name || "Unknown"}</TableCell>
                    <TableCell>{r.department || "—"}</TableCell>
                    <TableCell>
                      {r.date ? new Date(r.date).toLocaleDateString('en-GB') : "—"}
                    </TableCell>
                    <TableCell className="font-mono">{r.clock_in || "—"}</TableCell>
                    <TableCell className="font-mono">{r.clock_out || "—"}</TableCell>
                    <TableCell>
                      {r.total_hours ? Number(r.total_hours).toFixed(1) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(r.status)} className="capitalize">
                        {r.status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Showing {records.length} of {count} records
          </span>

          <Select
            value={pageSize.toString()}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}