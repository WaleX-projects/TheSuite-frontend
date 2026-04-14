import { useEffect, useState, useCallback } from "react";
import { leaveApi, LeaveRequest, LeaveType } from "@/lib/leaveApi";
import { employeesApi } from "@/lib/employeesApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

const statusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved": return "default";
    case "rejected": return "destructive";
    case "pending": return "secondary";
    default: return "outline";
  }
};

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved": return "text-green-600 bg-green-100";
    case "rejected": return "text-red-600 bg-red-100";
    case "pending": return "text-yellow-600 bg-yellow-100";
    default: return "text-gray-600 bg-gray-100";
  }
};

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [summary, setSummary] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [open, setOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");

  // Pagination for employees (if your employeesApi supports page param)
  const [employeePage, setEmployeePage] = useState(1);
  const [hasMoreEmployees, setHasMoreEmployees] = useState(true);

  const [form, setForm] = useState({
    employee: "",
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [leaveRes, leaveTypeRes] = await Promise.all([
        leaveApi.list(),
        leaveApi.listLeaveTypes(),
      ]);

      setLeaves(leaveRes.data?.results || leaveRes.data || []);
      setLeaveTypes(leaveTypeRes.data?.results || leaveTypeRes.data || []);

      // Fetch summary if endpoint exists
      try {
        const sumRes = await leaveApi.summary();
        setSummary(sumRes.data || []);
      } catch (e) {
        // Summary optional
      }
    } catch (error) {
      toast.error("Failed to load leave data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load employees with pagination
  const fetchEmployees = async (page: number = 1) => {
    if (loadingEmployees) return;
    setLoadingEmployees(true);

    try {
      const res = await employeesApi.list({ params: { page } });
      const newEmployees = res.data?.results || res.data || [];

      if (page === 1) {
        setEmployees(newEmployees);
      } else {
        setEmployees((prev) => [...prev, ...newEmployees]);
      }

      setHasMoreEmployees(!!res.data?.next);
      setEmployeePage(page);
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    fetchEmployees(1);
  }, [fetchInitialData]);

  // Load more employees (infinite scroll style - you can also use a "Load More" button)
  const loadMoreEmployees = () => {
    if (hasMoreEmployees) fetchEmployees(employeePage + 1);
  };

  // Filtered leaves
  const filteredLeaves = leaves
    .filter((leave) => {
      const matchesSearch =
        (leave.employee_name || "").toLowerCase().includes(search.toLowerCase()) ||
        leave.reason.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || leave.status.toLowerCase() === statusFilter;
      const matchesEmployee = employeeFilter === "all" || leave.employee.toString() === employeeFilter;

      return matchesSearch && matchesStatus && matchesEmployee;
    })
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
  };

  const isFormValid =
    form.employee &&
    form.leave_type &&
    form.start_date &&
    form.end_date &&
    form.reason.trim().length > 5 &&
    new Date(form.end_date) >= new Date(form.start_date);

  const handleApply = async () => {
    if (!isFormValid) {
      toast.error("Please fill all fields correctly. Reason must be at least 5 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await leaveApi.create(form);

      toast.success("Leave request submitted successfully!");
      setForm({ employee: "", leave_type: "", start_date: "", end_date: "", reason: "" });
      setOpen(false);
      fetchInitialData(); // Refresh list
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    try {
      await leaveApi.updateStatus(id, status);
      toast.success(`Leave request ${status} successfully`);
      fetchInitialData();
    } catch {
      toast.error(`Failed to ${status} leave request`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-sm text-gray-500">Manage employee leave requests</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Apply for Leave
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>

            <div className="space-y-5 pt-4">
              {/* Employee Select */}
              <div>
                <Label>Select Employee</Label>
                <Select value={form.employee} onValueChange={(val) => setForm({ ...form, employee: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                    {hasMoreEmployees && (
                      <SelectItem value="load-more" onClick={loadMoreEmployees} disabled={loadingEmployees}>
                        {loadingEmployees ? "Loading..." : "Load more employees..."}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Leave Type */}
              <div>
                <Label>Leave Type</Label>
                <Select value={form.leave_type} onValueChange={(val) => setForm({ ...form, leave_type: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} ({type.days_allowed} days allowed)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    min={form.start_date || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Reason for Leave</Label>
                <Textarea
                  placeholder="Explain the reason for your leave request..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={4}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleApply}
                disabled={!isFormValid || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Leave Request"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {summary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">{s.leave_type || s.name}</p>
                <p className="text-3xl font-bold mt-2">{s.remaining} days</p>
                <p className="text-xs text-gray-400 mt-1">
                  {s.used} used • {s.total || s.days_allowed} total
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by employee or reason..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leave Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests ({filteredLeaves.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredLeaves.map((leave) => {
                const days = calculateDays(leave.start_date, leave.end_date);

                return (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">
                      {leave.employee_name || "Unknown Employee"}
                    </TableCell>
                    <TableCell>{leave.leave_type_name || "—"}</TableCell>
                    <TableCell>{leave.start_date}</TableCell>
                    <TableCell>{leave.end_date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{days} day{days !== 1 ? "s" : ""}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate" title={leave.reason}>
                      {leave.reason}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(leave.status)} className={statusColor(leave.status)}>
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {leave.status.toLowerCase() === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(leave.id, "approved")}
                            className="hover:bg-green-100 hover:text-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(leave.id, "rejected")}
                            className="hover:bg-red-100 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredLeaves.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}