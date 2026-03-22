import { useEffect, useState } from "react";
import { leaveApi } from "@/lib/leaveApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

const statusVariant = (s: string): "default" | "secondary" | "destructive" => {
  switch (s?.toLowerCase()) {
    case "approved": return "default";
    case "rejected": return "destructive";
    default: return "secondary";
  }
};

export default function LeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: "", start_date: "", end_date: "", reason: "" });

  const load = async () => {
    try {
      const { data } = await leaveApi.list();
      setLeaves(Array.isArray(data) ? data : data.results || []);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApply = async () => {
    try {
      await leaveApi.create({ ...form, employee_id: Number(form.employee_id) });
      toast.success("Leave applied");
      setDialogOpen(false);
      load();
    } catch { toast.error("Failed to apply"); }
  };

  const handleStatus = async (id: number, status: string) => {
    try {
      await leaveApi.update(id, status);
      toast.success(`Leave ${status}`);
      load();
    } catch { toast.error("Failed to update"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Leave Management</h1><p className="page-subtitle">Manage leave requests</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Apply Leave</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1"><Label>Employee ID</Label><Input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                <div className="space-y-1"><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Reason</Label><Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
              <Button className="w-full" onClick={handleApply}>Submit Request</Button>
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
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.employee_name || l.employee}</TableCell>
                  <TableCell>{l.start_date}</TableCell>
                  <TableCell>{l.end_date}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{l.reason}</TableCell>
                  <TableCell><Badge variant={statusVariant(l.status)}>{l.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    {l.status === "pending" && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleStatus(l.id, "approved")}><Check className="h-4 w-4 text-success" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleStatus(l.id, "rejected")}><X className="h-4 w-4 text-destructive" /></Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {leaves.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{loading ? "Loading..." : "No leave requests"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
