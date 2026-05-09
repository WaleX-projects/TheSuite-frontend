import { useEffect, useState } from "react";
import { salaryComponentsApi } from "@/lib/payrollApi"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SalaryComponent {
  id: string;
  name: string;
  component_type: "allowance" | "deduction" | "other";
  is_percentage: boolean;
  is_active: boolean;
}

export default function SalaryComponentsPage() {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    component_type: "allowance" as "allowance" | "deduction" | "other",
    is_percentage: false,
    is_active: true,
  });

  // ================= LOAD DATA =================
  const loadComponents = async () => {
    try {
      setLoading(true);
      const { data } = await salaryComponentsApi.list();
      setComponents(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      toast.error("Failed to load salary components");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComponents();
  }, []);

  // ================= FORM HANDLERS =================
  const resetForm = () => {
    setForm({
      name: "",
      component_type: "allowance",
      is_percentage: false,
      is_active: true,
    });
    setEditingComponent(null);
  };

  const openEdit = (component: SalaryComponent) => {
    setEditingComponent(component);
    setForm({
      name: component.name,
      component_type: component.component_type,
      is_percentage: component.is_percentage,
      is_active: component.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingComponent) {
        await salaryComponentsApi.update(editingComponent.id, form);
        toast.success("Salary component updated successfully");
      } else {
        await salaryComponentsApi.create(form);
        toast.success("Salary component created successfully");
      }
      setDialogOpen(false);
      resetForm();
      loadComponents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this salary component?")) return;

    try {
      await salaryComponentsApi.delete(id);
      toast.success("Salary component deleted");
      loadComponents();
    } catch (err) {
      toast.error("Failed to delete salary component");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await salaryComponentsApi.update(id, { is_active: !currentStatus });
      toast.success(`Component ${!currentStatus ? "activated" : "deactivated"}`);
      loadComponents();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary Components</h1>
          <p className="text-muted-foreground">Manage allowances, deductions, and other pay elements</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Component
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingComponent ? "Edit Salary Component" : "Create New Salary Component"}
              </DialogTitle>
              <DialogDescription>
                Define how this component affects employee payroll
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Component Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Housing Allowance, Tax, Pension"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Component Type</Label>
                <Select
                  value={form.component_type}
                  onValueChange={(value: any) => setForm({ ...form, component_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allowance">Allowance (Addition)</SelectItem>
                    <SelectItem value="deduction">Deduction (Subtraction)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Percentage Based</Label>
                  <p className="text-sm text-muted-foreground">Calculate as % of basic salary</p>
                </div>
                <Switch
                  checked={form.is_percentage}
                  onCheckedChange={(checked) => setForm({ ...form, is_percentage: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">Enable in payroll calculations</p>
                </div>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingComponent ? "Update Component" : "Create Component"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Salary Components</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Calculation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">Loading...</TableCell>
                </TableRow>
              ) : components.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No salary components found. Create your first one above.
                  </TableCell>
                </TableRow>
              ) : (
                components.map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell className="font-medium">{comp.name}</TableCell>
                    <TableCell>
                      <Badge variant={comp.component_type === "allowance" ? "default" : "secondary"}>
                        {comp.component_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {comp.is_percentage ? (
                        <span className="text-amber-600 font-medium">Percentage (%)</span>
                      ) : (
                        <span className="text-blue-600 font-medium">Fixed Amount</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={comp.is_active ? "default" : "outline"}>
                        {comp.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(comp)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(comp.id, comp.is_active)}
                        >
                          <Switch className="scale-75" checked={comp.is_active} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(comp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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