import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { payrollApi } from "@/lib/payrollApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Download, RefreshCw, AlertTriangle } from "lucide-react";
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


export default function PayrollDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding new payslip
  const [newPayslip, setNewPayslip] = useState({
    employee_id: "",
    basic_salary: "",
    total_allowance: "",
    total_deduction: "",
  });

  const loadPayroll = async () => {
    try {
      setLoading(true);
      const { data } = await payrollApi.get(id!);
      setPayroll(data);
      console.log("data from payroll", data)
    } catch (err) {
      toast.error("Failed to load payroll details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPayroll();
    setRefreshing(false);
    toast.success("Payroll refreshed");
  };



  const handleMarkPaid = async () => {
  try {
    await payrollApi.markPaid(id!);
    toast.success("Payroll marked as paid");
    loadPayroll();
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
      link.download = `payroll-\( {payroll?.month}- \){payroll?.year}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Payroll exported successfully");
    } catch {
      toast.error("Failed to export payroll");
    }
  };

  // Add new payslip
  const handleAddPayslip = async () => {
    if (!newPayslip.employee_id || !newPayslip.basic_salary) {
      toast.error("Employee ID and Basic Salary are required");
      return;
    }

    try {
      await payrollApi.addPayslip(id!, {
        ...newPayslip,
        basic_salary: Number(newPayslip.basic_salary),
        total_allowance: Number(newPayslip.total_allowance || 0),
        total_deduction: Number(newPayslip.total_deduction || 0),
      });

      toast.success("New payslip added successfully");
      setIsAddModalOpen(false);
      setNewPayslip({ employee_id: "", basic_salary: "", total_allowance: "", total_deduction: "" });
      loadPayroll(); // Refresh the list
    } catch (err) {
      toast.error("Failed to add payslip");
    }
  };

  const toggleRow = (rowId: string) => {
    setOpenRows((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  // Calculations
  const payslips = payroll?.payslips || [];
  const totalEmployees = payslips.length;
  const totalBasic = payslips.reduce((sum: number, p: any) => sum + Number(p.basic_salary || 0), 0);
  const totalAllowance = payslips.reduce((sum: number, p: any) => sum + Number(p.total_allowance || 0), 0);
  const totalDeduction = payslips.reduce((sum: number, p: any) => sum + Number(p.total_deduction || 0), 0);
  const totalNet = payslips.reduce((sum: number, p: any) => sum + Number(p.net_salary || 0), 0);

  const createdAt = payroll?.created_at ? new Date(payroll.created_at) : null;
  const now = new Date();
  const diffDays = createdAt 
    ? Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
  const isOverdue = payroll?.status !== "paid" && diffDays > 7;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "draft": return "bg-gray-100 text-gray-700 border-gray-300";
      case "processed": return "bg-blue-100 text-blue-700 border-blue-300";
      case "paid": return "bg-green-100 text-green-700 border-green-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) return <div className="p-8 text-center">Loading payroll...</div>;
  if (!payroll) return <div className="p-8 text-center">Payroll not found</div>;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Payroll {payroll.month} / {payroll.year}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={`px-4 py-1 text-sm ${getStatusColor(payroll.status)}`}>
              {payroll.status?.toUpperCase() || "DRAFT"}
            </Badge>
            <span className="text-muted-foreground">{totalEmployees} employees</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {/*
          <Button onClick={handleProcess} disabled={payroll.status !== "draft"}>
            Process Payroll
          </Button>*/}
      
          
          <AlertDialog>
  <AlertDialogTrigger asChild>
      <Button 
            variant="secondary" 
            
            disabled={payroll.status !== "draft"}
          >
            Mark as Paid
          </Button>
          
  </AlertDialogTrigger>

  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        Mark payroll as paid?
      </AlertDialogTitle>

      <AlertDialogDescription>
        This action confirms that employees have been paid.
        This cannot be easily undone.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>
        Cancel
      </AlertDialogCancel>

      <AlertDialogAction
        onClick={handleMarkPaid}
      >
        Confirm Payment
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overdue Warning */}
      {isOverdue && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-700">Payroll is Overdue</p>
              <p className="text-sm text-red-600">
                This payroll is {diffDays} days old and still not paid.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Add New Payslip Button 
      <div className="flex justify-end">
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Payslip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Manual Payslip</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Employee ID</Label>
                <Input
                  placeholder="Enter employee ID"
                  value={newPayslip.employee_id}
                  onChange={(e) => setNewPayslip({ ...newPayslip, employee_id: e.target.value })}
                />
              </div>
              <div>
                <Label>Basic Salary (₦)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newPayslip.basic_salary}
                  onChange={(e) => setNewPayslip({ ...newPayslip, basic_salary: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Allowances (₦)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newPayslip.total_allowance}
                    onChange={(e) => setNewPayslip({ ...newPayslip, total_allowance: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Deductions (₦)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newPayslip.total_deduction}
                    onChange={(e) => setNewPayslip({ ...newPayslip, total_deduction: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleAddPayslip} className="w-full">
                Add to Payroll
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
        */}
      {/* Payslips Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payslips ({totalEmployees})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Allowance</TableHead>
                <TableHead>Deduction</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No payslips in this payroll yet
                  </TableCell>
                </TableRow>
              ) : (
                payslips.map((p: any) => (
                  <>
                    <TableRow 
                      key={p.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(p.id)}
                    >
                      <TableCell className="font-medium">{p.employee_detail.full_name}</TableCell>
                      <TableCell>₦{Number(p.basic_salary || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">
                        +₦{Number(p.total_allowance || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-red-600">
                        -₦{Number(p.total_deduction || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-bold">
                        ₦{Number(p.net_salary || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {openRows[p.id] ? "▼" : "▶"}
                      </TableCell>
                    </TableRow>

                    {openRows[p.id] && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30 p-6">
                          <div className="text-sm space-y-3">
                            <p className="font-semibold">Detailed Breakdown</p>
                            {p.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.name} ({item.component_type})</span>
                                <span>₦{Number(item.amount || 0).toLocaleString()}</span>
                              </div>
                            ))}
                            {(!p.items || p.items.length === 0) && (
                              <p className="text-muted-foreground">No breakdown available</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}