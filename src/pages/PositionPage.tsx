import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { positionApi } from "@/lib/employeesApi";

/* =========================
   TYPES
========================= */

interface SalaryComponent {
  id?: string;
  value: string | number;
  component_detail?: {
    id: string;
    name: string;
    component_type: 'allowance' | 'deduction';
  };
}

interface Position {
  id: string;
  title: string;
  department?: string;
  basic_salary_display: string | number;
  components_display?: SalaryComponent[];
  is_single_role?: boolean;
  total_employees?: number;
}

/* =========================
   COMPONENT
========================= */

export default function PositionPage() {
  const { id: departmentId, dept_name } = useParams<{ id: string; dept_name: string }>();

  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const [form, setForm] = useState({
    title: "",
    basic_salary: "",
    is_single_role: false,
    components: [{ name: "", value: "" }] as Array<{ name: string; value: string }>,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* =========================
     FETCH
  ========================= */

  const fetchPositions = useCallback(async () => {
    if (!departmentId) return;

    try {
      setLoading(true);
      const { data } = await positionApi.get(departmentId);
      const results = data.results || data || [];
      setPositions(Array.isArray(results) ? results : []);
    } catch (error: any) {
      console.error("Failed to fetch positions:", error);
      toast.error(error?.response?.data?.message || "Failed to load positions");
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  /* =========================
     FORM HELPERS
  ========================= */

  const resetForm = () => {
    setForm({
      title: "",
      basic_salary: "",
      is_single_role: false,
      components: [{ name: "", value: "" }],
    });
    setFormErrors({});
    setEditingPosition(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (position: Position) => {
    setEditingPosition(position);

    setForm({
      title: position.title || "",
      basic_salary: String(position.basic_salary_display || ""),
      is_single_role: Boolean(position.is_single_role),
      components: position.components_display && position.components_display.length > 0
        ? position.components_display.map((comp) => ({
            name: comp.component_detail?.name || "",
            value: String(comp.value || ""),
          }))
        : [{ name: "", value: "" }],
    });

    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.title.trim()) errors.title = "Position title is required";
    if (!form.basic_salary || Number(form.basic_salary) <= 0) {
      errors.basic_salary = "Valid basic salary is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleComponentChange = (index: number, field: "name" | "value", value: string) => {
    setForm((prev) => {
      const updated = [...prev.components];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, components: updated };
    });
  };

  const addComponent = () => {
    setForm((prev) => ({
      ...prev,
      components: [...prev.components, { name: "", value: "" }],
    }));
  };

  const removeComponent = (index: number) => {
    if (form.components.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!departmentId) {
      toast.error("Department ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),
        basic_salary: Number(form.basic_salary),
        is_single_role: form.is_single_role,
        department: departmentId,
        components: form.components
          .filter((c) => c.name.trim() && c.value.trim())
          .map((c) => ({
            name: c.name.trim(),
            value: Number(c.value),
          })),
      };

      if (editingPosition) {
        await positionApi.update(editingPosition.id, payload);
        toast.success("Position updated successfully");
      } else {
        await positionApi.create(payload);
        toast.success("Position created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchPositions();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          (editingPosition ? "Failed to update position" : "Failed to create position")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete position "${title}"? This action cannot be undone.`)) return;

    try {
      await positionApi.delete(id);
      toast.success("Position deleted successfully");
      fetchPositions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete position");
    }
  };

  /* =========================
     HELPERS
  ========================= */

  const formatCurrency = (amount: number | string): string => {
    return `₦${Number(amount).toLocaleString()}`;
  };

  const calculateTotalSalary = (position: Position) => {
    const basicSalary = Number(position.basic_salary_display) || 0;

    const componentsNet = (position.components_display || []).reduce((acc, comp) => {
      const val = Number(comp.value) || 0;
      const type = comp.component_detail?.component_type;
      return type === 'allowance' ? acc + val : acc - val;
    }, 0);

    return basicSalary + componentsNet;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {dept_name || "Department"} Positions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage roles and salary structures
          </p>
        </div>

        <Button onClick={openCreateModal} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add New Position
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            All Positions
            <Badge variant="secondary">{positions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading positions...</p>
            </div>
          ) : positions.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No positions yet</h3>
              <p className="text-muted-foreground mb-6">
                Create the first position for this department
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Position
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position Title</TableHead>
                  <TableHead>Role Type</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead className="text-right">Basic Salary</TableHead>
                  <TableHead className="text-right">Total Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {positions.map((pos) => {
                  const isSingle = Boolean(pos.is_single_role);
                  const totalSalary = calculateTotalSalary(pos);
                  const occupied = (pos.total_employees ?? 0) > 0;

                  return (
                    <TableRow key={pos.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{pos.title}</TableCell>

                      <TableCell>
                        <Badge variant={isSingle ? "default" : "secondary"}>
                          {isSingle ? "Single Role" : "Multiple Roles"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {isSingle ? (
                          <Badge variant={occupied ? "default" : "destructive"}>
                            {occupied ? "Occupied" : "Vacant"}
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {pos.total_employees ?? 0} Employees
                            </span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-medium">
                        {formatCurrency(pos.basic_salary_display)}
                      </TableCell>

                      <TableCell className="text-right font-semibold text-emerald-600">
                        {formatCurrency(totalSalary)}
                      </TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(pos)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(pos.id, pos.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPosition ? "Edit Position" : "Create New Position"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Position Title</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                className={formErrors.title ? "border-red-500" : ""}
              />
              {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="basic_salary">Basic Salary (₦)</Label>
              <Input
                id="basic_salary"
                name="basic_salary"
                type="number"
                value={form.basic_salary}
                onChange={handleChange}
                placeholder="500000"
                className={formErrors.basic_salary ? "border-red-500" : ""}
              />
              {formErrors.basic_salary && (
                <p className="text-sm text-red-500">{formErrors.basic_salary}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_single_role" className="cursor-pointer">
                Single Role (Only one employee can hold this)
              </Label>
              <Switch
                id="is_single_role"
                checked={form.is_single_role}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, is_single_role: checked }))
                }
              />
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label>Salary Components</Label>
                <Button type="button" variant="outline" size="sm" onClick={addComponent}>
                  + Add Component
                </Button>
              </div>

              <div className="space-y-3">
                {form.components.map((comp, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Component name (e.g. Housing Allowance)"
                        value={comp.name}
                        onChange={(e) => handleComponentChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="w-40">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={comp.value}
                        onChange={(e) => handleComponentChange(index, "value", e.target.value)}
                      />
                    </div>
                    {form.components.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComponent(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Only components with name and value will be saved.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editingPosition
                ? "Update Position"
                : "Create Position"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}