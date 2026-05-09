import { useEffect, useState } from "react";
import { 
    employeeSalaryOverridesApi,
    salaryComponentsApi 
 } from  "@/lib/payrollApi";
import { employeesApi } from "@/lib/employeesApi";

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
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EmployeeOverride {
  id: string;
  employee: string;
  employee_detail: { id: string; first_name: string; last_name: string; };
  component: string;
  component_detail: { id: string; name: string; component_type: string; is_percentage: boolean; };
  value: number;
}

export default function EmployeeSalaryOverridesPage() {
  const [overrides, setOverrides] = useState<EmployeeOverride[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<EmployeeOverride | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    employee: "",
    component: "",
    value: 0,
  });

  // Load Data
  const loadOverrides = async () => {
    try {
      const { data } = await employeeSalaryOverridesApi.list();
      console.log("data", data)
      setOverrides(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
        console.log("err data", err)
      toast.error("Failed to load salary overrides");
    }
  };

  const loadEmployees = async () => {
    try {
      const { data } = await employeesApi.list({ page_size: 100 });
      setEmployees(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      toast.error("Failed to load employees");
    }
  };

  const loadComponents = async () => {
    try {
      const { data } = await salaryComponentsApi.list();
      setComponents(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      toast.error("Failed to load salary components");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadOverrides(), loadEmployees(), loadComponents()]);
      setLoading(false);
    };
    init();
  }, []);

  // Form Handlers
  const resetForm = () => {
    setForm({ employee: "", component: "", value: 0 });
    setEditingOverride(null);
  };

  const openEdit = (override: EmployeeOverride) => {
    setEditingOverride(override);
    setForm({
      employee: override.employee,
      component: override.component,
      value: override.value,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee || !form.component || form.value === 0) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      if (editingOverride) {
        await employeeSalaryOverridesApi.update(editingOverride.id, form);
        toast.success("Override updated successfully");
      } else {
        await employeeSalaryOverridesApi.create(form);
        toast.success("Override created successfully");
      }
      setDialogOpen(false);
      resetForm();
      loadOverrides();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this salary override?")) return;
    try {
      await employeeSalaryOverridesApi.delete(id);
      toast.success("Override deleted");
      loadOverrides();
    } catch (err) {
      toast.error("Failed to delete override");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Salary Overrides</h1>
          <p className="text-muted-foreground">Custom allowances, deductions, or bonuses for specific employees</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Override
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingOverride ? "Edit Salary Override" : "Add New Salary Override"}
              </DialogTitle>
              <DialogDescription>
                Apply custom pay component to an individual employee
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={form.employee} onValueChange={(v) => setForm({ ...form, employee: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Salary Component</Label>
                <Select value={form.component} onValueChange={(v) => setForm({ ...form, component: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Component" />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((comp: any) => (
                      <SelectItem key={comp.id} value={comp.id}>
                        {comp.name} ({comp.component_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  placeholder="Amount or Percentage"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter amount if fixed, or percentage if the component is percentage-based
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingOverride ? "Update Override" : "Create Override"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employee Overrides</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">Loading overrides...</TableCell>
                </TableRow>
              ) : overrides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No custom overrides found. Add one using the button above.
                  </TableCell>
                </TableRow>
              ) : (
                overrides.map((ov) => (
                  <TableRow key={ov.id}>
                    <TableCell className="font-medium">
                      {ov.employee_detail?.full_name}
                    </TableCell>
                    <TableCell>{ov.component_detail?.name}</TableCell>
                    <TableCell>
                      <Badge variant={ov.component_detail?.component_type === "allowance" ? "default" : "destructive"}>
                        {ov.component_detail?.component_type?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {ov.component_detail?.is_percentage ? `\( {ov.value}%` : `₦ \){ov.value.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(ov)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(ov.id)}
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