import { useEffect, useState } from "react";
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
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { positionApi } from "@/lib/employeesApi";

/* =========================
   TYPES (MATCH BACKEND)
========================= */

interface SalaryComponent {
  id?: string;
  component?: {
    id: string;
    name: string;
  };
  value: number;
}

interface Position {
  id: string;
  title: string;
  department?: string;

  basic_salary_display: number; // ✅ from backend
  components: SalaryComponent[];

  is_single_role?: boolean;

  total_employees?: number;
  total_salary_cost?: number;
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
    components: [{ name: "", value: "" }] as { name: string; value: string }[],
  });

  /* =========================
     FETCH
  ========================= */

  const fetchPositions = async () => {
    if (!departmentId) {
      toast.error("Department ID is missing");
      return;
    }

    try {
      setLoading(true);
      const { data } = await positionApi.get(departmentId);

      console.log("🔥 BACKEND:", data);

      setPositions(data.results || data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, [departmentId]);

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
    setEditingPosition(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (position: Position) => {
    console.log("✏️ EDIT:", position);

    setEditingPosition(position);

    setForm({
      title: position.title || "",
      basic_salary: String(position.basic_salary_display || ""),
      is_single_role: Boolean(position.is_single_role),

      components:
        position.components_display && position.components_display.length > 0
          ? position.components_display.map((comp) => ({
              name: comp.component?.name || "",
              value: String(comp.value || ""),
            }))
          : [{ name: "", value: "" }],
    });

    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleComponentChange = (
    index: number,
    field: "name" | "value",
    value: string
  ) => {
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
    if (!form.title.trim() || !form.basic_salary || !departmentId) {
      return toast.error("Title and Basic Salary are required");
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

      console.log("📤 PAYLOAD:", payload);

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
    } catch (error) {
      console.error(error);
      toast.error(
        editingPosition
          ? "Failed to update position"
          : "Failed to create position"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete position "${title}"?`)) return;

    try {
      await positionApi.delete(id);
      toast.success("Position deleted successfully");
      fetchPositions();
    } catch (error) {
      toast.error("Failed to delete position");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 150);
  };

  /* =========================
     UI (UNCHANGED)
  ========================= */

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {dept_name || "Department"} Positions
          </h1>
          <p className="text-muted-foreground">
            Manage positions and salary structures
          </p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Positions ({positions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading positions...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Role Type</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Total Salary Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {positions.map((pos) => {
                  const isSingle = Boolean(pos.is_single_role);
                  const occupied = (pos.total_employees ?? 0) > 0;
                  const basicSalary = pos.basic_salary_display || 0;

                  return (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">
                        {pos.title}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isSingle
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {isSingle ? "Single Role" : "Multiple Role"}
                        </span>
                      </TableCell>

                      <TableCell>
                        {isSingle ? (
                          <span
                            className={
                              occupied
                                ? "text-green-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {occupied ? "Occupied" : "Vacant"}
                          </span>
                        ) : (
                          <span className="font-medium">
                            {pos.total_employees ?? 0} Employees
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        ₦{Number(basicSalary).toLocaleString()}
                      </TableCell>

                      <TableCell>
                        ₦{Number(pos.total_salary_cost ?? 0).toLocaleString()}
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
                          onClick={() =>
                            handleDelete(pos.id, pos.title)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {positions.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No positions found in this department
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL (UNCHANGED) */}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPosition
                ? "Edit Position"
                : "Create New Position"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Basic Salary (₦)</Label>
              <Input
                name="basic_salary"
                type="number"
                value={form.basic_salary}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_single_role"
                checked={form.is_single_role}
                onChange={handleChange}
              />
              <Label>Single Role</Label>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Salary Components</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addComponent}
                >
                  + Add Component
                </Button>
              </div>

              {form.components.map((comp, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    placeholder="Name"
                    value={comp.name}
                    onChange={(e) =>
                      handleComponentChange(
                        index,
                        "name",
                        e.target.value
                      )
                    }
                  />

                  <Input
                    type="number"
                    placeholder="Amount"
                    value={comp.value}
                    onChange={(e) =>
                      handleComponentChange(
                        index,
                        "value",
                        e.target.value
                      )
                    }
                  />

                  {form.components.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeComponent(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
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