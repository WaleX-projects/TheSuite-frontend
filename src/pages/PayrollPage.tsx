import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { payrollApi } from "@/lib/payrollApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Eye, TrendingUp, Users, DollarSign, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface PayrollRecord {
  id: string;
  month: number;
  year: number;
  status: "draft" | "processed" | "paid" | "failed" | "running";
  total_amount?: number;
  employee_count?: number;
  created_at: string;
}

export default function PayrollDashboard() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [polling, setPolling] = useState(false);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // ================= LOAD PAYROLL RECORDS =================
  const loadPayrolls = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const { data } = await payrollApi.list();
      const payrollData = Array.isArray(data) ? data : data.results || [];
      setRecords(payrollData);
    } catch (error) {
      if (!silent) {
        toast.error("Failed to load payroll records");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayrolls();
  }, [loadPayrolls]);

  // Polling when a payroll is running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (polling) {
      interval = setInterval(() => {
        loadPayrolls(true); // silent refresh
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [polling, loadPayrolls]);

  // ================= RUN PAYROLL =================
  const handleRunPayroll = async () => {
    if (!form.month || !form.year) {
      toast.error("Please select month and year");
      return;
    }

    setRunning(true);

    try {
      await payrollApi.run({
        month: Number(form.month),
        year: Number(form.year),
      });

      toast.success("Payroll started successfully! Processing in background...", {
        duration: 5000,
      });

      setDialogOpen(false);
      setPolling(true); // Start polling for updates

      // Initial refresh after a short delay
      setTimeout(() => loadPayrolls(true), 1000);

    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to start payroll");
    } finally {
      setRunning(false);
    }
  };

  const stopPolling = () => {
    setPolling(false);
  };

  const getMonthName = (month: number) => monthNames[month - 1] || "Unknown";

  // Calculate dashboard statistics
  const totalPayroll = records.reduce((sum, record) => 
    sum + (record.total_amount || 0), 0
  );

  const totalEmployees = records.reduce((sum, record) => 
    sum + (record.employee_count || 0), 0
  );

  const processedRecords = records.filter(r => 
    ["processed", "paid"].includes(r.status)
  ).length;

  const isAnyRunning = records.some(r => r.status === "running");

  // Auto-stop polling when no more running payrolls
  useEffect(() => {
    if (polling && !isAnyRunning) {
      setTimeout(stopPolling, 2000);
    }
  }, [isAnyRunning, polling]);

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor employee payroll
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" disabled={running || polling}>
              <Plus className="mr-2 h-5 w-5" />
              Run New Payroll
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Run Payroll for a Period</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              <div>
                <Label>Month</Label>
                <Select
                  value={form.month.toString()}
                  onValueChange={(value) =>
                    setForm({ ...form, month: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((name, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  min="2020"
                  max="2030"
                  value={form.year}
                  onChange={(e) =>
                    setForm({ 
                      ...form, 
                      year: parseInt(e.target.value) || new Date().getFullYear() 
                    })
                  }
                />
              </div>

              <Button
                className="w-full"
                onClick={handleRunPayroll}
                disabled={running}
                size="lg"
              >
                {running ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Payroll...
                  </>
                ) : (
                  "Run Payroll Now"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* PROCESSING BANNER */}
      {(polling || isAnyRunning) && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/50">
          <CardContent className="py-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-400">
                Payroll is currently processing in the background...
              </p>
              <p className="text-sm text-blue-600/80">
                The table will refresh automatically. You can continue using the dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {formatCurrency(totalPayroll)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all processed payrolls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees Paid</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cumulative across periods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payroll Runs</CardTitle>
            <Calendar className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{records.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total payroll records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {records.length > 0 
                ? Math.round((processedRecords / records.length) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PAYROLL HISTORY */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payroll History ({records.length})</CardTitle>
            {polling && (
              <Badge variant="secondary" className="animate-pulse">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Live Updating
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    Loading payroll history...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No payroll records found yet.<br />
                    Click "Run New Payroll" to process your first payroll.
                  </TableCell>
                </TableRow>
              ) : (
                records
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((record) => (
                    <TableRow
                      key={record.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/payroll/${record.id}`)}
                    >
                      <TableCell className="font-medium">
                        {getMonthName(record.month)} {record.year}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {record.employee_count || "—"}
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {formatCurrency(record.total_amount || 0)}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            record.status === "paid" ? "default" :
                            record.status === "processed" ? "secondary" :
                            record.status === "running" ? "outline" :
                            record.status === "failed" ? "destructive" : "outline"
                          }
                          className={record.status === "running" ? "animate-pulse" : ""}
                        >
                          {record.status === "running" ? (
                            <>Processing...</>
                          ) : (
                            record.status?.charAt(0).toUpperCase() + record.status?.slice(1) || "Unknown"
                          )}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {new Date(record.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/payroll/${record.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}