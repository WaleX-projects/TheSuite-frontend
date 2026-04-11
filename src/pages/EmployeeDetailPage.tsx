import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { employeesApi } from "@/lib/employeesApi";
import { attendanceApi } from "@/lib/attendanceApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, X, Briefcase, Phone, Mail, MapPin, Calendar, Building2, DollarSign, 
  RefreshCw 
} from "lucide-react";
import { toast } from "sonner";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [employee, setEmployee] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payslip, setPayslip] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Load employee details
  const loadEmployee = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data } = await employeesApi.get(id);
      setEmployee(data);
    } catch (err) {
      toast.error("Failed to load employee details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load attendance records
  const loadAttendance = async () => {
    if (!id) return;
    try {
      setAttendanceLoading(true);
      const { data } = await attendanceApi.get(id);
      const records = Array.isArray(data) ? data : data.results || [];
      setAttendance(records);
    } catch (err) {
      toast.error("Failed to load attendance records");
      console.error(err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Load payslips
  const loadPayslips = async () => {
    if (!id) return;
    try {
      const { data } = await employeesApi.listEmployeepayslip(id);
      const records = Array.isArray(data) ? data : data.results || [];
      setPayslip(records);
    } catch (err) {
      toast.error("Failed to load payslips");
      console.error(err);
    }
  };

  // Toggle employee active status
  const handleToggleStatus = async () => {
    if (!employee || !id) return;
    try {
      if (employee.status === "active") {
        await employeesApi.deactivate(id);
        toast.success("Employee deactivated successfully");
      } else {
        await employeesApi.activate(id); // Make sure your API has this method
        toast.success("Employee activated successfully");
      }
      loadEmployee(); // Refresh
    } catch (err) {
      toast.error("Failed to update employee status");
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [loadEmployee]);

  // Prepare calendar events
  const presentEvents = attendance.map((a: any) => ({
    title: a.clock_out_time 
      ? `${a.clock_in_time || ""} - ${a.clock_out_time}` 
      : (a.clock_in_time || "No Punch"),
    date: a.date,
    backgroundColor: a.status === "late" ? "#f59e0b" : "#10b981", // amber for late, green for present
    textColor: "#ffffff",
    borderColor: "transparent",
  }));

  // Generate Absent events for days without records (except Sundays)
  const absentEvents: any[] = [];
  if (attendance.length > 0) {
    const attendanceDates = new Set(attendance.map((a: any) => a.date));

    const dates = attendance.map((a: any) => new Date(a.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    let current = new Date(minDate);
    while (current <= maxDate) {
      const dateStr = current.toISOString().split("T")[0];
      const dayOfWeek = current.getDay(); // 0 = Sunday

      if (!attendanceDates.has(dateStr) && dayOfWeek !== 0) {
        absentEvents.push({
          title: "Absent",
          date: dateStr,
          backgroundColor: "#ef4444", // red
          textColor: "#ffffff",
          display: "background", // fills the whole day cell
        });
      }
      current.setDate(current.getDate() + 1);
    }
  }

  const allCalendarEvents = [...presentEvents, ...absentEvents];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading employee profile...</div>;
  }

  if (!employee) {
    return <div className="text-center py-16 text-muted-foreground">Employee not found</div>;
  }

  const leaves = employee.leave || employee.leaves || [];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {employee.first_name} {employee.last_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {employee.position_detail || employee.department_detail || "Employee"}
          </p>
        </div>

        <Button 
          onClick={handleToggleStatus}
          variant={employee.status === "active" ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          {employee.status === "active" ? (
            <>
              <X className="h-4 w-4" /> Deactivate Employee
            </>
          ) : (
            <>Activate Employee</>
          )}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance" onClick={loadAttendance}>Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave History</TabsTrigger>
          <TabsTrigger value="payslip" onClick={loadPayslips}>Payslips</TabsTrigger>
        </TabsList>

        {/* ==================== OVERVIEW TAB ==================== */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Full Name</span>
                  <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.address || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.date_of_birth || "—"}</span>
                </div>
              </CardContent>
            </Card>
              
            <Card>
  <CardHeader>
    <CardTitle className="text-base flex items-center gap-2">
      <DollarSign className="h-4 w-4 text-primary" />
      Account Information
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-3 text-sm">
  
    <div>
      <span className="text-muted-foreground">Bank Name</span>
      <p className="font-medium">
        {employee.bank_name || "-"}
      </p>
    </div>

    <div>
      <span className="text-muted-foreground">Account Name</span>
      <p className="font-medium">
        {employee.bank_account_name || "-"}
      </p>
    </div>

    <div>
      <span className="text-muted-foreground">Account Number</span>
      <p className="font-medium tracking-widest">
        {employee.masked_account_number}
      </p>
    </div>

    <div>
      <span className="text-muted-foreground">Account Type</span>
      <p className="font-medium">
        {employee.bank_account_type || "-"}
      </p>
    </div>

    <div>
      <span className="text-muted-foreground">Currency</span>
      <p className="font-medium">
        {employee.currency || "-"}
      </p>
    </div>
  </CardContent>
</Card>

            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" /> Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Department</span>
                  <p className="font-medium">{employee.department_detail || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block">Position</span>
                  <p className="font-medium">{employee.position_detail || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block">Hire Date</span>
                  <p className="font-medium">{employee.hire_date || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block">Status</span>
                  <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                    {employee.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact + Bank Info (you can split or combine as needed) */}
            {/* Add your Emergency Contact and Account Information cards here similarly */}
          </div>
        </TabsContent>

        {/* ==================== ATTENDANCE TAB ==================== */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attendance Calendar</CardTitle>
              <Button 
                variant="outline" 
                onClick={loadAttendance} 
                disabled={attendanceLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${attendanceLoading ? "animate-spin" : ""}`} />
                Refresh Attendance
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-500"></div>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500"></div>
                  <span>Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span>Absent (Weekdays only)</span>
                </div>
                <div className="text-muted-foreground">Sundays shown as normal weekends</div>
              </div>

              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                height="auto"
                events={allCalendarEvents}
                eventDisplay="block"
                dayMaxEvents={2}
                weekends={true}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,dayGridWeek"
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== LEAVE TAB ==================== */}
        <TabsContent value="leave">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((l: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{l.leave_type || l.type || "—"}</TableCell>
                      <TableCell>{l.start_date}</TableCell>
                      <TableCell>{l.end_date}</TableCell>
                      <TableCell>{l.total_days || "—"}</TableCell>
                      <TableCell className="max-w-[250px] truncate">{l.reason || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={l.status === "approved" ? "default" : l.status === "rejected" ? "destructive" : "secondary"}>
                          {l.status || "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {leaves.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No leave records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== PAYSLIP TAB ==================== */}
        <TabsContent value="payslip">
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {[
              { 
                label: "Total Earned (YTD)", 
                value: `₦${payslip.reduce((sum: number, p: any) => sum + parseFloat(p.net_salary || p.amount || 0), 0).toLocaleString()}` 
              },
              { 
                label: "Last Salary", 
                value: payslip.length > 0 
                  ? `₦${parseFloat(payslip[payslip.length - 1].net_salary || payslip[payslip.length - 1].amount || 0).toLocaleString()}` 
                  : "—" 
              },
              { label: "Total Records", value: payslip.length.toString() },
            ].map((s, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-2">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslip.map((p: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{p.payroll_month} / {p.payroll_year}</TableCell>
                      <TableCell>₦{parseFloat(p.basic_salary || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">₦{parseFloat(p.total_allowance || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">₦{parseFloat(p.total_deduction || 0).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">₦{parseFloat(p.net_salary || p.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "paid" ? "default" : "secondary"}>
                          {p.payroll_status || p.status || "—"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {payslip.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No payslip records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}