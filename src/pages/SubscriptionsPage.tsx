import { useEffect, useState } from "react";
import { subscriptionsApi } from "@/lib/subscriptionsApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ company: "", plan: "", status: "active" });

  const load = async () => {
    try {
      const { data } = await subscriptionsApi.list();
      setSubs(Array.isArray(data) ? data : data.results || []);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await subscriptionsApi.create({ company: Number(form.company), plan: form.plan, status: form.status });
      toast.success("Subscription created");
      setDialogOpen(false);
      load();
    } catch { toast.error("Failed to create"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this subscription?")) return;
    try {
      await subscriptionsApi.delete(id);
      toast.success("Deleted");
      load();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Subscriptions</h1><p className="page-subtitle">Manage company subscriptions</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Subscription</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Subscription</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1"><Label>Company ID</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div className="space-y-1"><Label>Plan</Label><Input value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} /></div>
              <div className="space-y-1"><Label>Status</Label><Input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} /></div>
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
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.company_name || s.company}</TableCell>
                  <TableCell>{s.plan}</TableCell>
                  <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {subs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{loading ? "Loading..." : "No subscriptions"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
