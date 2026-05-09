import { useEffect, useState } from "react";
import { notificationsApi } from "@/lib/notificationsApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, Check, Plus, RefreshCw, Search, Filter 
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  message: string;
  type: "info" | "success" | "warning" | "alert" | "error";
  read: boolean;
  created_at: string;
  employee_name?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [form, setForm] = useState({
    employee: "",
    employeeName: "",
    message: "",
    type: "info" as Notification["type"],
  });

  const loadNotifications = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const { data } = await notificationsApi.list();
      const notifs = Array.isArray(data) ? data : data.results || [];
      setNotifications(notifs);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = notifications
    .filter((n) => {
      const matchesSearch = n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (n.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = 
        filter === "all" || 
        (filter === "unread" && !n.read) || 
        (filter === "read" && n.read);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSend = async () => {
    if (!form.employee || !form.message.trim()) {
      return toast.error("Employee ID and message are required");
    }

    try {
      await notificationsApi.create({
        employee: Number(form.employee),
        message: form.message.trim(),
        type: form.type,
      });

      toast.success("Notification sent successfully");
      setDialogOpen(false);
      setForm({ employee: "", employeeName: "", message: "", type: "info" });
      loadNotifications();
    } catch {
      toast.error("Failed to send notification");
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead?.(); // Optional if your API supports it
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success": return "bg-emerald-100 text-emerald-700";
      case "warning": return "bg-amber-100 text-amber-700";
      case "alert":
      case "error": return "bg-red-100 text-red-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with important alerts and messages</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => loadNotifications(true)} 
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Send New Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input
                    type="number"
                    placeholder="Enter Employee ID"
                    value={form.employee}
                    onChange={(e) => setForm({ ...form, employee: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Notification["type"] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Write your notification message..."
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <Button onClick={handleSend} className="w-full">
                  Send Notification
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only ({unreadCount})</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>

            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                Mark All as Read
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Notifications
            <Badge variant="secondary">{filteredNotifications.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-340px)] pr-4">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading notifications...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No notifications found
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <Card key={n.id} className={`transition-all hover:shadow-md ${n.read ? "opacity-75" : "border-primary/30"}`}>
                    <CardContent className="p-5 flex gap-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${getTypeColor(n.type)}`}>
                        <Bell className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-relaxed">
                            {n.message}
                          </p>
                          {!n.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(n.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
<Badge
  variant="outline"
  className={getTypeColor(n?.type ?? "default")}
>
  {(n?.type ?? "unknown").toUpperCase()}
</Badge>
                          {n.employee_name && <span>• {n.employee_name}</span>}
                          <span>• {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}