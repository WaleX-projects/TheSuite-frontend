import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { payrollApi } from "@/lib/payrollApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PayrollDetailPage() {
  const { id } = useParams();
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Track which rows are open
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  // =========================
  // LOAD PAYROLL
  // =========================
  const load = async () => {
    try {
      const { data } = await payrollApi.get(id!);
      setPayroll(data);
    } catch {
      toast.error("Failed to load payroll");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // =========================
  // ACTIONS
  // =========================
  const handleProcess = async () => {
    try {
      await payrollApi.process(id!);
      toast.success("Payroll processed");
      load();
    } catch {
      toast.error("Failed to process payroll");
    }
  };

  const handleMarkPaid = async () => {
    try {
      await payrollApi.markPaid(id!);
      toast.success("Payroll marked as paid");
      load();
    } catch {
      toast.error("Failed to mark as paid");
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await payrollApi.exportCsv(id!);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payroll-${id}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch {
      toast.error("Failed to export payroll");
    }
  };

  const toggleRow = (rowId: string) => {
    setOpenRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // =========================
  // SAFE DATA
  // =========================
  const payslips = payroll?.payslips || [];

  const totalNet = payslips.reduce((sum: number, p: any) => sum + Number(p.net_salary || 0), 0);
  const totalBasic = payslips.reduce((sum: number, p: any) => sum + Number(p.basic_salary || 0), 0);
  const totalAllowance = payslips.reduce((sum: number, p: any) => sum + Number(p.total_allowance || 0), 0);
  const totalDeduction = payslips.reduce((sum: number, p: any) => sum + Number(p.total_deduction || 0), 0);
  const totalEmployees = payslips.length;

  // =========================
  // OVERDUE LOGIC
  // =========================
  const WARNING_DAYS = 7;
  const createdAt = payroll?.created_at ? new Date(payroll.created_at) : null;
  const now = new Date();
  const diffDays = createdAt ? Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const isOverdue = payroll?.status !== "paid" && createdAt && diffDays > WARNING_DAYS;

  // =========================
  // STATUS COLORS
  // =========================
  const statusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-800";
      case "processed":
        return "bg-blue-200 text-blue-800";
      case "paid":
        return "bg-green-200 text-green-800";
      default:
        return "";
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!payroll) return <p className="p-4">No payroll found</p>;

  return (
    <div className="space-y-6">

      {/* ========================= HEADER ========================= */}
      <div>
        <h1 className="text-2xl font-bold">
          Payroll {payroll.month}/{payroll.year}
        </h1>

        <Badge className={`mt-2 ${statusColor(payroll.status)}`}>
          {payroll.status?.toUpperCase()}
        </Badge>

        {/* Overdue Warning */}
        {isOverdue && (
          <Card className="border-red-400 bg-red-50 mt-4">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-red-600">⚠ Payroll Overdue</p>
                <p className="text-sm text-red-600">{diffDays} days old and not paid</p>
              </div>
              <Badge className="bg-red-200 text-red-800">Action Required</Badge>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Button onClick={handleProcess} disabled={payroll.status !== "draft"}>
            Process Payroll
          </Button>
          <Button variant="secondary" onClick={handleMarkPaid} disabled={payroll.status !== "processed"}>
            Mark as Paid
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            Export Payroll
          </Button>
        </div>
      </div>

      {/* ========================= SUMMARY CARDS ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payroll Status */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Payroll Overview</p>
            <p className="text-2xl font-bold capitalize mt-1">{payroll.status}</p>
            <p className="text-sm text-muted-foreground mt-1">{totalEmployees} employees</p>
          </CardContent>
        </Card>

        {/* Financial Breakdown */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Payroll Breakdown</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span>Total Basic</span><span>₦{totalBasic.toLocaleString()}</span></div>
              <div className="flex justify-between text-green-600"><span>Allowances</span><span>+₦{totalAllowance.toLocaleString()}</span></div>
              <div className="flex justify-between text-red-600"><span>Deductions</span><span>-₦{totalDeduction.toLocaleString()}</span></div>
              <hr />
              <div className="flex justify-between font-bold text-lg"><span>Net Payroll</span><span>₦{totalNet.toLocaleString()}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================= PAYSLIPS TABLE ========================= */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>Allowance</TableHead>
                <TableHead>Deduction</TableHead>
                <TableHead>Net</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {payslips.map((p: any) => (
                <>
                  {/* Employee Row (clickable) */}
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleRow(p.id)}
                  >
                    <TableCell className="font-medium flex items-center gap-2">
                      {p.employee_name} {openRows[p.id] ? "🔽" : "▶"}
                    </TableCell>
                    <TableCell>{p.basic_salary}</TableCell>
                    <TableCell className="text-green-600">+{p.total_allowance}</TableCell>
                    <TableCell className="text-red-600">-{p.total_deduction}</TableCell>
                    <TableCell className="font-bold">{p.net_salary}</TableCell>
                  </TableRow>

                  {/* Conditional Breakdown Row */}
                  {openRows[p.id] && (
                    <TableRow key={`${p.id}-breakdown`}>
                      <TableCell colSpan={5} className="bg-muted/30">
                        <div className="text-sm space-y-2">
                          <p className="font-semibold">Breakdown</p>
                          {p.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between">
                              <span>{item.name} ({item.component_type})</span>
                              <span>₦{item.amount}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}