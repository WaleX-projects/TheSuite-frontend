import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { employeesApi } from "@/lib/employeesApi";
import { attendanceApi } from "@/lib/attendanceApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, X, Briefcase, Phone, Mail, MapPin, Calendar, DollarSign, RefreshCw, Edit, Copy, Eye, EyeOff 
} from "lucide-react";
import { toast } from "sonner";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

// Edit Modal imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Leave Request Modal
import {
  Dialog as LeaveDialog,
  DialogContent as LeaveDialogContent,
  DialogDescription as LeaveDialogDescription,
  DialogFooter as LeaveDialogFooter,
  DialogHeader as LeaveDialogHeader,
  DialogTitle as LeaveDialogTitle,
} from "@/components/ui/dialog";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [employee, setEmployee] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payslip, setPayslip] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [payslipLoading, setPayslipLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [updating, setUpdating] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Show/hide full account number
  const [showFullAccount, setShowFullAccount] = useState(false);

  // Load Employee Data
  const loadEmployee = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data } = await employeesApi.get(id);
      
      setEmployee(data);
      console.log("incoming data", data);

      // Initialize edit form
      setEditForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        date_of_birth: data.date_of_birth || "",
        hire_date: data.hire_date || "",

        // Critical: Use actual IDs for update
        department: data.department_id || data.department?.id || "",
        position: data.position_id || data.position?.id || "",

        // Display names
        department_detail: data.department_detail || data.department?.name || "",
        position_detail: data.position_detail || data.position?.title || "",

        // Bank Info
        bank_name: data.bank_name || "",
        bank_account_name: data.bank_account_name || "",
        bank_account_number: data.masked_account_number || data.bank_account_number || "",
        bank_account_type: data.bank_account_type || "",
        bank_code: data.bank_code || "",
        currency: data.currency || "",
      });
    } catch (err) {
      toast.error("Failed to load employee details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadAttendance = useCallback(async () => {
    if (!id) return;
    try {
      setAttendanceLoading(true);
      const { data } = await attendanceApi.get(id);
      const records = Array.isArray(data) ? data : data?.results || [];
      setAttendance(records);
    } catch (err) {
      toast.error("Failed to load attendance records");
      console.error(err);
    } finally {
      setAttendanceLoading(false);
    }
  }, [id]);

  const loadPayslips = useCallback(async () => {
    if (!id) return;
    try {
      setPayslipLoading(true);
      const { data } = await employeesApi.listEmployeepayslip(id);
      const records = Array.isArray(data) ? data : data?.results || [];
      setPayslip(records);
    } catch (err) {
      toast.error("Failed to load payslips");
      console.error(err);
    } finally {
      setPayslipLoading(false);
    }
  }, [id]);

  const handleToggleStatus = async () => {
    if (!employee || !id) return;
    try {
      if (employee.status === "active") {
        await employeesApi.deactivate(id);
        toast.success("Employee deactivated successfully");
      } else {
        await employeesApi.activate(id);
        toast.success("Employee activated successfully");
      }
      await loadEmployee();
    } catch (err) {
      toast.error("Failed to update employee status");
      console.error(err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setUpdating(true);
    try {
      const payload = {
        first_name: editForm.first_name?.trim(),
        last_name: editForm.last_name?.trim(),
        email: editForm.email?.trim(),
        phone: editForm.phone?.trim() || null,
        address: editForm.address?.trim() || null,
        date_of_birth: editForm.date_of_birth || null,
        hire_date: editForm.hire_date || null,
        department: editForm.department || null,
        position: editForm.position || null,
        bank_name: editForm.bank_name?.trim() || null,
        bank_account_name: editForm.bank_account_name?.trim() || null,
        bank_account_number: editForm.bank_account_number?.trim() || null,
        bank_account_type: editForm.bank_account_type || null,
        bank_code: editForm.bank_code?.trim() || null,
        currency: editForm.currency || null,
      };
      console.log("payload", payload);
      await employeesApi.update(id, payload);
      
      toast.success("Employee details updated successfully");
      setIsEditModalOpen(false);
      await loadEmployee(); // Refresh data
    } catch (err: any) {
      console.error("Update error:", err.response?.data);
      const errorMsg = err.response?.data?.message || 
                      Object.values(err.response?.data || {})[0]?.[0] || 
                      "Failed to update employee";
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  // Leave Request Form State
  const [leaveForm, setLeaveForm] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const handleLeaveInputChange = (field: string, value: string) => {
    setLeaveForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !leaveForm.leave_type || !leaveForm.start_date || !leaveForm.end_date) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmittingLeave(true);
    try {
      // Replace with your actual leave API endpoint
      // await leaveApi.create({ employee: id, ...leaveForm });
      toast.success("Leave request submitted successfully");
      setIsLeaveModalOpen(false);
      setLeaveForm({ leave_type: "", start_date: "", end_date: "", reason: "" });
      // Optionally refresh leaves if you have them loaded separately
    } catch (err: any) {
      toast.error("Failed to submit leave request");
      console.error(err);
    } finally {
      setSubmittingLeave(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [loadEmployee]);

  // Copy Account Number
  const copyAccountNumber = () => {
    const accNumber = employee?.bank_account_number || employee?.masked_account_number;
    if (accNumber) {
      navigator.clipboard.writeText(accNumber);
      toast.success("Account number copied!");
    }
  };

  // Calendar Events
  const presentEvents = attendance.map((a: any) => {
    const clockIn = a.clock_in ? a.clock_in.substring(0, 5) : "—";
    const clockOut = a.clock_out ? a.clock_out.substring(0, 5) : "—";
    const totalHrs = a.total_hours ? `${Number(a.total_hours).toFixed(1)} hrs` : "—";
    const title = `In: ${clockIn} | Out: ${clockOut} ${totalHrs}`;

    return {
      title,
      date: a.date,
      backgroundColor: a.status === "late" ? "#f59e0b" : "#10b981",
      textColor: "#ffffff",
      borderColor: "transparent",
    };
  });

  const absentEvents: any[] = [];
  if (attendance.length > 0) {
    const attendanceDates = new Set(attendance.map((a: any) => a.date));
    const dates = attendance.map((a: any) => new Date(a.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const current = new Date(minDate);
    while (current <= maxDate) {
      const dateStr = current.toISOString().split("T")[0];
      const dayOfWeek = current.getDay();

      if (!attendanceDates.has(dateStr) && dayOfWeek !== 0) {
        absentEvents.push({
          title: "Absent",
          date: dateStr,
          backgroundColor: "#ef4444",
          textColor: "#ffffff",
          display: "background",
        });
      }
      current.setDate(current.getDate() + 1);
    }
  }

  const allCalendarEvents = [...presentEvents, ...absentEvents];
  const leaves = employee?.leave || employee?.leaves || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading employee profile...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Employee not found
      </div>
    );
  }

  const accountNumberDisplay = showFullAccount 
    ? (employee.bank_account_number || employee.masked_account_number || "—")
    : (employee.masked_account_number || "••••••••••");

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

        <div className="flex gap-3">
          <Button
            onClick={() => setIsEditModalOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Employee
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={employee.status === "active" ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {employee.status === "active" ? (
                  <>
                    <X className="h-4 w-4" />
                    Deactivate Employee
                  </>
                ) : (
                  <>Activate Employee</>
                )}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {employee.status === "active"
                    ? "Deactivate Employee"
                    : "Activate Employee"}
                </AlertDialogTitle>

                <AlertDialogDescription>
                  {employee.status === "active"
                    ? "This employee will no longer be able to participate in active operations such as attendance, payroll, and scheduling."
                    : "This employee will be restored to active operations including attendance and payroll."}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleToggleStatus}>
                  {employee.status === "active" ? "Deactivate" : "Activate"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance" onClick={loadAttendance}>Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave History</TabsTrigger>
          <TabsTrigger value="payslip" onClick={loadPayslips}>Payslips</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Personal Info */}
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

            {/* Bank Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Bank Name</span>
                  <p className="font-medium">{employee.bank_name || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Account Name</span>
                  <p className="font-medium">{employee.bank_account_name || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Account Number</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium tracking-widest font-mono">
                      {accountNumberDisplay}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAccountNumber}
                      className="h-7 w-7 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullAccount(!showFullAccount)}
                      className="h-7 w-7 p-0"
                    >
                      {showFullAccount ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Account Type</span>
                  <p className="font-medium">{employee.bank_account_type || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Currency</span>
                  <p className="font-medium">{employee.currency || "—"}</p>
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
          </div>
        </TabsContent>

        {/* Attendance Tab - Improved UI */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Attendance Calendar</CardTitle>
              <Button variant="outline" onClick={loadAttendance} disabled={attendanceLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${attendanceLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-500"></div>
                  <span>Present / Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span>Absent (Weekdays)</span>
                </div>
                <div className="text-muted-foreground">Sundays are off-days</div>
              </div>

              {attendance.length === 0 && !attendanceLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-6xl mb-4 opacity-40">📅</div>
                  <h3 className="text-xl font-medium mb-2">No Attendance Records</h3>
                  <p className="text-muted-foreground max-w-sm">
                    This employee has no attendance data yet. Records will appear here once they start clocking in.
                  </p>
                </div>
              ) : (
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  height="auto"
                  events={allCalendarEvents}
                  eventDisplay="block"
                  dayMaxEvents={3}
                  weekends={true}
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,dayGridWeek"
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Tab */}
        <TabsContent value="leave">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Leave History</h2>
            <Button onClick={() => setIsLeaveModalOpen(true)}>
              Request Leave
            </Button>
          </div>

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

        {/* Payslip Tab */}
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payslip Records</CardTitle>
              <Button variant="outline" onClick={loadPayslips} disabled={payslipLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${payslipLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
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
                  {payslip.length === 0 && !payslipLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No payslip records found
                      </TableCell>
                    </TableRow>
                  )}
                  {payslipLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Loading payslips...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ====================== EDIT MODAL ====================== */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee Details</DialogTitle>
            <DialogDescription>
              Update information for {employee.first_name} {employee.last_name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={editForm.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={editForm.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editForm.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={editForm.date_of_birth}
                  onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">Hire Date</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={editForm.hire_date}
                  onChange={(e) => handleInputChange("hire_date", e.target.value)}
                />
              </div>

              {/* Department & Position (Display + Hidden ID) */}
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={editForm.department_detail} disabled />
                <input type="hidden" value={editForm.department} />
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <Input value={editForm.position_detail} disabled />
                <input type="hidden" value={editForm.position} />
              </div>
            </div>

            {/* Bank Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Bank Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={editForm.bank_name}
                    onChange={(e) => handleInputChange("bank_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_name">Account Name</Label>
                  <Input
                    id="bank_account_name"
                    value={editForm.bank_account_name}
                    onChange={(e) => handleInputChange("bank_account_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    value={editForm.bank_account_number}
                    onChange={(e) => handleInputChange("bank_account_number", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_code">Bank Code</Label>
                  <Input
                    id="bank_code"
                    value={editForm.bank_code}
                    onChange={(e) => handleInputChange("bank_code", e.target.value)}
                    placeholder="e.g. 058 (GTBank)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_type">Account Type</Label>
                  <Select 
                    value={editForm.bank_account_type} 
                    onValueChange={(value) => handleInputChange("bank_account_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={editForm.currency}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                    placeholder="NGN"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? "Saving Changes..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ====================== LEAVE REQUEST MODAL ====================== */}
      <LeaveDialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <LeaveDialogContent>
          <LeaveDialogHeader>
            <LeaveDialogTitle>Request Leave</LeaveDialogTitle>
            <LeaveDialogDescription>
              Submit a new leave request for {employee.first_name} {employee.last_name}
            </LeaveDialogDescription>
          </LeaveDialogHeader>

          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select 
                value={leaveForm.leave_type} 
                onValueChange={(value) => handleLeaveInputChange("leave_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="maternity">Maternity Leave</SelectItem>
                  <SelectItem value="paternity">Paternity Leave</SelectItem>
                  <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={leaveForm.start_date}
                  onChange={(e) => handleLeaveInputChange("start_date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={leaveForm.end_date}
                  onChange={(e) => handleLeaveInputChange("end_date", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={leaveForm.reason}
                onChange={(e) => handleLeaveInputChange("reason", e.target.value)}
                placeholder="Please provide a reason for your leave request..."
                rows={4}
              />
            </div>

            <LeaveDialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsLeaveModalOpen(false)}
                disabled={submittingLeave}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingLeave}>
                {submittingLeave ? "Submitting..." : "Submit Request"}
              </Button>
            </LeaveDialogFooter>
          </form>
        </LeaveDialogContent>
      </LeaveDialog>
    </div>
  );
}