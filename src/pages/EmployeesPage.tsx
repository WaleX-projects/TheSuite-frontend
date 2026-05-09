import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { employeesApi, departmentApi, positionApi } from "@/lib/employeesApi";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { Plus, Search, Eye, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [filterPositions, setFilterPositions] = useState([]);
  const [banks, setBanks] = useState([]);
  const [accountName, setAccountName] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [count, setCount] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [creationLoading, setCreationLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    hire_date: "",
    department: "",
    position: "",
    bank_name: "",
    bank_account_name: "",
    bank_code: "",
    bank_account_number: "",
  });

  const debounceRef = useRef<any>(null);

  // ================= BULK STATES =================
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ================= LOAD DATA =================
  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const { data } = await employeesApi.list({
        search,
        department: departmentFilter,
        position: positionFilter,
        page,
        page_size: pageSize,
      });

      setEmployees(data.results || []);
      setCount(data.count || 0);
    } catch (err) {
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const { data } = await departmentApi.list();
      setDepartments(data.results || data);
    } catch {
      toast.error("Failed to load departments");
    }
  };

  const loadBanks = async () => {
    try {
      const { data } = await axios.get("https://api.paystack.co/bank");
      setBanks(data.data);
    } catch {
      toast.error("Failed to load banks");
    }
  };

  // ================= FORM HANDLERS =================
  const handleDepartmentChange = async (deptId: string) => {
    setForm((prev) => ({
      ...prev,
      department: deptId,
      position: "", // Reset position when department changes
    }));

    if (!deptId) {
      setPositions([]);
      return;
    }

    try {
      setLoadingPositions(true);
      const { data } = await positionApi.get(deptId);
      setPositions(data.results || data);
    } catch {
      toast.error("Failed to load positions");
    } finally {
      setLoadingPositions(false);
    }
  };

  const handleFilterDepartmentChange = async (deptId: string) => {
    setDepartmentFilter(deptId);
    setPositionFilter("");
    setPage(1);

    if (!deptId) {
      setFilterPositions([]);
      return;
    }

    try {
      const { data } = await positionApi.get(deptId);
      setFilterPositions(data.results || data);
    } catch {
      toast.error("Failed to load positions");
    }
  };

  const fetchAccountName = async (bank_code: string, account_number: string) => {
    if (!bank_code || account_number.length !== 10) return;

    try {
      const { data } = await employeesApi.resolveAccount({
        bank_code,
        account_number,
      });
      setAccountName(data.account_name);
      setForm((prev) => ({ ...prev, bank_account_name: data.account_name }));
    } catch {
      setAccountName("");
    }
  };

  const handleBankAccountChange = (value: string) => {
    setForm((prev) => {
      const updated = { ...prev, bank_account_number: value };

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        if (updated.bank_code && value.length === 10) {
          fetchAccountName(updated.bank_code, value);
        }
      }, 500);

      return updated;
    });
  };

  const handleBankChange = (code: string) => {
    const selected = banks.find((b: any) => b.code === code);
    setForm((prev) => ({
      ...prev,
      bank_code: code,
      bank_name: selected?.name || "",
    }));
  };

  // ================= CREATE EMPLOYEE =================
  const handleCreate = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.department || !form.position) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setCreationLoading(true);

      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        hire_date: form.hire_date || null,
        department: form.department,
        position: form.position,
        bank_name: form.bank_name || null,
        bank_account_name: form.bank_account_name || null,
        bank_account_number: form.bank_account_number || null,
        bank_code: form.bank_code || null,
      };

      await employeesApi.create(payload);
      
      toast.success("Employee created successfully");
      setDialogOpen(false);
      resetForm();
      loadEmployees();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to create employee";
      toast.error(errorMsg);
      console.error(err.response?.data);
    } finally {
      setCreationLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      hire_date: "",
      department: "",
      position: "",
      bank_name: "",
      bank_account_name: "",
      bank_code: "",
      bank_account_number: "",
    });
    setAccountName("");
    setPositions([]);
  };

  // ================= BULK UPLOAD (unchanged logic) =================
  const handleBulkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (your existing bulk logic - kept as is)
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setBulkPreview([]);

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => setBulkPreview(result.data as any[]),
      });
    } else if (["xlsx", "xls"].includes(ext || "")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const wb = XLSX.read(event.target?.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        setBulkPreview(data as any[]);
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error("Only CSV or Excel files are allowed");
    }
  };

  const downloadTemplate = () => {
    // Your existing template function - kept unchanged
    const template = [ /* ... your existing template ... */ ];
    const ws = XLSX.utils.json_to_sheet(template);
    ws["!cols"] = [ /* your column widths */ ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Template");
    XLSX.writeFile(wb, "employee_upload_template.xlsx");
  };

  const handleBulkSubmit = async () => {
    if (!bulkFile) return toast.error("Please select a file");

    setBulkSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);

      await employeesApi.bulkCreate(formData);
      toast.success(`Successfully onboarded ${bulkPreview.length} employees!`);
      setBulkDialogOpen(false);
      resetBulkDialog();
      loadEmployees();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Bulk upload failed");
    } finally {
      setBulkSubmitting(false);
    }
  };

  const resetBulkDialog = () => {
    setBulkFile(null);
    setBulkPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ================= EFFECTS =================
  useEffect(() => {
    loadEmployees();
  }, [search, departmentFilter, positionFilter, page]);

  useEffect(() => {
    loadDepartments();
    loadBanks();
  }, []);

  const totalPages = Math.ceil(count / pageSize);

  const handleRegistration = (id: string) => {
    window.open(
      `https://walex-projects.github.io/Face_Scan/registration.html?token=${id}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-gray-500">Manage your workforce</p>
        </div>

        <div className="flex gap-3">
          {/* Bulk Onboard */}
          <Dialog open={bulkDialogOpen} onOpenChange={(open) => { setBulkDialogOpen(open); if (!open) resetBulkDialog(); }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> Bulk Onboard
              </Button>
            </DialogTrigger>
            {/* ... Your existing Bulk Dialog Content (unchanged) ... */}
            {/* Paste your full bulk dialog here if needed */}
          </Dialog>

          {/* Add Single Employee */}
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-2">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="font-medium">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name <span className="text-red-500">*</span></Label>
                      <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Last Name <span className="text-red-500">*</span></Label>
                      <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <Label>Email <span className="text-red-500">*</span></Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>

                {/* Job Info */}
                <div className="space-y-4">
                  <h3 className="font-medium">Job Information</h3>
                  <div>
                    <Label>Department <span className="text-red-500">*</span></Label>
                    <select
                      value={form.department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full border rounded-md p-2"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Position <span className="text-red-500">*</span></Label>
                    <select
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      className="w-full border rounded-md p-2"
                      disabled={!form.department || loadingPositions}
                      required
                    >
                      <option value="">{loadingPositions ? "Loading..." : "Select Position"}</option>
                      {positions.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Hire Date</Label>
                    <Input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
                  </div>
                </div>

                {/* Bank Info */}
                <div className="space-y-4">
                  <h3 className="font-medium">Bank Information</h3>
                  <div>
                    <Label>Bank</Label>
                    <select value={form.bank_code} onChange={(e) => handleBankChange(e.target.value)} className="w-full border rounded-md p-2">
                      <option value="">Select Bank</option>
                      {banks.map((b: any) => (
                        <option key={b.code} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Account Number (10 digits)</Label>
                    <Input
                      placeholder="0123456789"
                      value={form.bank_account_number}
                      onChange={(e) => handleBankAccountChange(e.target.value)}
                      maxLength={10}
                    />
                  </div>

                  {accountName && (
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                      <strong>Verified Account Name:</strong> {accountName}
                    </div>
                  )}
                </div>

                <Button onClick={handleCreate} className="w-full" disabled={creationLoading} size="lg">
                  {creationLoading ? "Creating Employee..." : "Create Employee"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select value={departmentFilter} onChange={(e) => handleFilterDepartmentChange(e.target.value)} className="border rounded-md px-3 py-2">
          <option value="">All Departments</option>
          {departments.map((d: any) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select value={positionFilter} onChange={(e) => { setPositionFilter(e.target.value); setPage(1); }} className="border rounded-md px-3 py-2" disabled={!departmentFilter}>
          <option value="">All Positions</option>
          {filterPositions.map((p: any) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingEmployees ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">Loading employees...</TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No employees found</TableCell>
                </TableRow>
              ) : (
                employees.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.first_name} {e.last_name}</TableCell>
                    <TableCell>{e.email}</TableCell>
                    <TableCell>{e.position_detail || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={e.status === "active" ? "default" : "secondary"}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/employees/${e.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      {!e.face_verified && (
                        <Button variant="outline" size="sm" onClick={() => handleRegistration(e.id)}>
                          Verify Face
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}