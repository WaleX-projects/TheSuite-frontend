import { useEffect, useState } from "react";
import { payrollApi } from "@/lib/payrollApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function PayrollPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: "", amount: "", date: "" });

  const load = async () => {
    try {
      const { data } = await payrollApi.list();
      setRecords(Array.isArray(data) ? data : data.results || []);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await payrollApi.create({ employee_id: Number(form.employee_id), amount: Number(form.amount), date: form.date });
      toast.success("Payroll record created");
      setDialogOpen(false);
      load();
    } catch { toast.error("Failed to create"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Payroll</h1><p className="page-subtitle">Manage payroll records</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Record</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Payroll Record</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1"><Label>Employee ID</Label><Input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} /></div>
              <div className="space-y-1"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div className="space-y-1"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <Button className="w-full" onClick={handleCreate}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.employee_name || r.employee}</TableCell>
                  <TableCell>{r.date || r.period}</TableCell>
                  <TableCell className="font-semibold">${parseFloat(r.net_pay || r.amount || 0).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={r.status === "paid" ? "default" : "secondary"}>{r.status || "—"}</Badge></TableCell>
                </TableRow>
              ))}
              {records.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{loading ? "Loading..." : "No records"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
