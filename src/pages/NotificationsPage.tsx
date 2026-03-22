import { useEffect, useState } from "react";
import { notificationsApi } from "@/lib/notificationsApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Check, Plus } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ employee: "", message: "", type: "info" });

  const load = async () => {
    try {
      const { data } = await notificationsApi.list();
      setNotifications(Array.isArray(data) ? data : data.results || []);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSend = async () => {
    try {
      await notificationsApi.create({ employee: Number(form.employee), message: form.message, type: form.type });
      toast.success("Notification sent");
      setDialogOpen(false);
      load();
    } catch { toast.error("Failed to send"); }
  };

  const markRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      load();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="page-header">Notifications</h1><p className="page-subtitle">System notifications</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Send Notification</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1"><Label>Employee ID</Label><Input value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} /></div>
              <div className="space-y-1"><Label>Type</Label><Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="info, warning, alert" /></div>
              <div className="space-y-1"><Label>Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
              <Button className="w-full" onClick={handleSend}>Send</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className={`transition-all ${n.read ? "opacity-60" : ""}`}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${n.read ? "bg-muted" : "bg-primary/10"}`}>
                  <Bell className={`h-5 w-5 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.type} • {n.created_at || "—"}</p>
                </div>
              </div>
              {!n.read && (
                <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">{loading ? "Loading..." : "No notifications"}</CardContent></Card>
        )}
      </div>
    </div>
  );
}
