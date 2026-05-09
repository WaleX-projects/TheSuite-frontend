import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { departmentApi } from "@/lib/employeesApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Eye, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
  total_positions?: number; // Updated to match what you're using in the table
}

export default function OrganizationPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Department states
  const [deptName, setDeptName] = useState("");
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isDeletingDept, setIsDeletingDept] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.list();
      console.log("response_data", res.data.results || res.data || []);
      setDepartments(res.data.results || res.data || []);
    } catch (error) {
      toast.error("Failed to fetch departments");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDepartments();
      setLoading(false);
    };
    init();
  }, []);

  // ==================== DEPARTMENTS CRUD ====================

  const openCreateDepartmentModal = () => {
    setEditingDept(null);
    setDeptName("");
    setIsDeptModalOpen(true);
  };

  const openEditDepartmentModal = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setIsDeptModalOpen(true);
  };

  const handleSaveDepartment = async () => {
    const trimmedName = deptName.trim();

    if (!trimmedName) {
      return toast.error("Department name cannot be empty");
    }

    try {
      if (editingDept) {
        // Update
        if (editingDept.name === trimmedName) {
          return toast.error("Please enter a different name to update");
        }

        await departmentApi.update(editingDept.id, { name: trimmedName });
        toast.success("Department updated successfully");
      } else {
        // Create
        await departmentApi.create({ name: trimmedName });
        toast.success("Department created successfully");
      }

      setIsDeptModalOpen(false);
      setDeptName("");
      setEditingDept(null);
      fetchDepartments();
    } catch (error) {
      console.error(error);
      toast.error(
        editingDept ? "Failed to update department" : "Failed to create department"
      );
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!confirm(`Delete department "${name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeletingDept(id);
    try {
      await departmentApi.delete(id);
      toast.success("Department deleted successfully");
      fetchDepartments();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete department");
    } finally {
      setIsDeletingDept(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Organization</h1>

      {/* ==================== DEPARTMENTS SECTION ==================== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Departments ({departments.length})</CardTitle>
          <Button onClick={openCreateDepartmentModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">
              Loading departments...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department Name</TableHead>
                  <TableHead>No. of Positions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.total_positions || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDepartmentModal(dept)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      <Link to={`/${dept.name}/position/${dept.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Manage Positions
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                        disabled={isDeletingDept === dept.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {departments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No departments found. Add one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ==================== DEPARTMENT MODAL (Create + Edit) ==================== */}
      <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDept ? "Edit Department" : "Create New Department"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter department name"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeptModalOpen(false);
                setDeptName("");
                setEditingDept(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDepartment}>
              {editingDept ? "Update Department" : "Create Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}