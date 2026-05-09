import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Calendar,
  Award,
  Globe,
  Users 
} from "lucide-react";
import { toast } from "sonner";

import { holidayApi } from "@/lib/attendanceApi";

interface Holiday {
  id: string;
  name: string;
  date: string;
  day: string;
  type: "public" | "company" | "religious" | "optional" | "regional";
  isPaid: boolean;
  status: "active" | "upcoming" | "passed" | "cancelled";
  is_global?: boolean;
  is_recurring?: boolean;
  company_name?: string;
}

export default function HolidayPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  
  // Form State for Dialog
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    type: "public" as Holiday["type"],
    isPaid: true,
    is_global: true,
    is_recurring: false,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("2026");
  const [monthFilter, setMonthFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch Holidays
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await holidayApi.list();
      const data = res.data?.results || res.data || [];

      const processedData = data.map((holiday: any) => ({
        ...holiday,
        status: getHolidayStatus(holiday.date),
        day: new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' }),
      }));

      setHolidays(processedData);
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
      toast.error("Failed to fetch holidays");
    } finally {
      setLoading(false);
    }
  };

  const getHolidayStatus = (dateStr: string): Holiday["status"] => {
    const holidayDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    holidayDate.setHours(0, 0, 0, 0);

    if (holidayDate < today) return "passed";
    if (holidayDate.getTime() === today.getTime()) return "active";
    return "upcoming";
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Summary Calculations
  const totalHolidays = holidays.length;
  const upcomingHolidays = holidays.filter(h => h.status === "upcoming").length;
  const publicHolidays = holidays.filter(h => h.type === "public").length;
  const companyHolidays = holidays.filter(h => h.type === "company").length;
  const paidHolidays = holidays.filter(h => h.isPaid).length;

  // Filtered Holidays
  const filteredHolidays = useMemo(() => {
    return holidays.filter(holiday => {
      const matchesSearch = holiday.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = holiday.date.startsWith(yearFilter);
      const matchesMonth = monthFilter === "all" || holiday.date.slice(5, 7) === monthFilter;
      const matchesType = typeFilter === "all" || holiday.type === typeFilter;
      const matchesStatus = statusFilter === "all" || holiday.status === statusFilter;

      return matchesSearch && matchesYear && matchesMonth && matchesType && matchesStatus;
    });
  }, [holidays, searchTerm, yearFilter, monthFilter, typeFilter, statusFilter]);

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      public: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
      company: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      religious: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      optional: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      regional: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    };
    return (
      <Badge className={colors[type] || "bg-gray-100 text-gray-700"} variant="secondary">
        {type }
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "upcoming": return <Badge variant="secondary">Upcoming</Badge>;
      case "passed": return <Badge variant="outline">Passed</Badge>;
      case "cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Modal Handlers
  const openAddModal = () => {
    setEditingHoliday(null);
    setFormData({
      name: "",
      date: "",
      type: "public",
      isPaid: true,
      is_global: true,
      is_recurring: false,
    });
    setDialogOpen(true);
  };

  const openEditModal = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      isPaid: holiday.isPaid,
      is_global: holiday.is_global ?? true,
      is_recurring: holiday.is_recurring ?? false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.date) {
      toast.error("Name and Date are required");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        date: formData.date,
        type: formData.type,
        isPaid: formData.isPaid,
        is_global: formData.is_global,
        is_recurring: formData.is_recurring,
      };

      if (editingHoliday) {
        // Update existing holiday
        await holidayApi.partialUpdate(editingHoliday.id, payload);
        toast.success("Holiday updated successfully");
      } else {
        // Create new holiday
        await holidayApi.create(payload);
        toast.success("Holiday added successfully");
      }

      setDialogOpen(false);
      fetchHolidays(); // Refresh the list
    } catch (error) {
      console.error(error);
      toast.error(editingHoliday ? "Failed to update holiday" : "Failed to add holiday");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete holiday "${name}"?`)) return;

    try {
      await holidayApi.delete(id);
      setHolidays(prev => prev.filter(h => h.id !== id));
      toast.success("Holiday deleted successfully");
    } catch (error) {
      toast.error("Failed to delete holiday");
    }
  };

  const handleDisable = async (id: string) => {
    try {
      await holidayApi.partialUpdate(id, { status: "cancelled" });
      setHolidays(prev =>
        prev.map(h => h.id === id ? { ...h, status: "cancelled" } : h)
      );
      toast.info("Holiday cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel holiday");
    }
  };

  const handleDuplicate = async (holiday: Holiday) => {
    try {
      const newHoliday = {
        name: `${holiday.name} (Copy)`,
        date: holiday.date,
        type: holiday.type,
        isPaid: holiday.isPaid,
        is_global: holiday.is_global,
        is_recurring: holiday.is_recurring,
      };

      await holidayApi.create(newHoliday);
      toast.success("Holiday duplicated successfully");
      fetchHolidays();
    } catch (error) {
      toast.error("Failed to duplicate holiday");
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Holidays &amp; Leaves</h1>
          <p className="text-muted-foreground">Manage public, company, and special holidays</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-5 w-5" />
          Add New Holiday
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Holidays</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalHolidays}</div>
            <p className="text-xs text-muted-foreground mt-1">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Award className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{upcomingHolidays}</div>
            <p className="text-xs text-muted-foreground mt-1">Holidays ahead</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Public Holidays</CardTitle>
            <Globe className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{publicHolidays}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Company Holidays</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{companyHolidays}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Holidays</CardTitle>
            <Award className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paidHolidays}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Holidays</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Label>Search Holiday</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search holiday name..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Month</Label>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={(i + 1).toString().padStart(2, '0')}>
                      {new Date(2026, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="public">Public Holiday</SelectItem>
                  <SelectItem value="company">Company Holiday</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holidays Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holiday List ({filteredHolidays.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holiday Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    Loading holidays...
                  </TableCell>
                </TableRow>
              ) : filteredHolidays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No holidays found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredHolidays.map((holiday) => (
                  <TableRow key={holiday.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{holiday.name}</TableCell>
                    <TableCell>{formatDate(holiday.date)}</TableCell>
                    <TableCell>{holiday.day}</TableCell>
                    <TableCell>{getTypeBadge(holiday.type)}</TableCell>
                    <TableCell>
                      <Badge variant={holiday.isPaid ? "default" : "secondary"}>
                        {holiday.isPaid ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(holiday.status)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditModal(holiday)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDuplicate(holiday)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDisable(holiday.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        Disable
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(holiday.id, holiday.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Holiday Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Holiday Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. New Year Day"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: Holiday["type"]) => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public Holiday</SelectItem>
                  <SelectItem value="company">Company Holiday</SelectItem>
                  <SelectItem value="religious">Religious</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPaid"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isPaid" className="cursor-pointer">Paid Holiday</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_global"
                checked={formData.is_global}
                onChange={(e) => setFormData({ ...formData, is_global: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_global" className="cursor-pointer">Global Holiday</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_recurring"
                checked={formData.is_recurring}
                onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_recurring" className="cursor-pointer">Recurring Annually</Label>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingHoliday ? "Update Holiday" : "Add Holiday"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}