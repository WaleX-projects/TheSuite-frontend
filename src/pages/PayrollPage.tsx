import { useEffect, useState } from "react";
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
import { Plus, Eye } from "lucide-react";
import { toast } from "sonner";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function PayrollPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [running, setRunning] = useState(false);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // ================= LOAD PAYROLL RECORDS =================
  const loadPayrolls = async () => {
    setLoading(true);
    try {
      const { data } = await payrollApi.list();
      setRecords(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      toast.error("Failed to load payroll records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrolls();
  }, []);

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

      toast.success("Payroll processed successfully!");
      setDialogOpen(false);
      loadPayrolls(); // Refresh the list
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to run payroll");
    } finally {
      setRunning(false);
    }
  };

  // Helper to get month name
  const getMonthName = (month: number) => {
    return monthNames[month - 1] || "Unknown";
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payroll Management</h1>
          <p className="text-sm text-gray-500">
            Run and manage monthly employee payroll
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
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
                    setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })
                  }
                />
              </div>

              <Button
                className="w-full"
                onClick={handleRunPayroll}
                disabled={running}
                size="lg"
              >
                {running ? "Processing Payroll..." : "Run Payroll Now"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* PAYROLL TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll History ({records.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {records.map((record) => (
                <TableRow
                  key={record.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/payroll/${record.id}`)}
                >
                  <TableCell className="font-medium">
                    {getMonthName(record.month)} {record.year}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        record.status === "paid"
                          ? "default"
                          : record.status === "processed"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {record.status?.charAt(0).toUpperCase() + record.status?.slice(1) || "Unknown"}
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
                        e.stopPropagation(); // Prevent row click
                        navigate(`/payroll/${record.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {records.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    No payroll records found. Click "Run New Payroll" to get started.
                  </TableCell>
                </TableRow>
              )}

              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    Loading payroll history...
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