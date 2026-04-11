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
  const [loadingPositions, setLoadingPositions] = useState(false);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [count, setCount] = useState(0);
const [loadingEmployees, setLoadingEmployees] =useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [creationLoading, setCreationLoading] = useState(false);

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

  const isFormValid =
    form.first_name &&
    form.last_name &&
    form.email &&
    form.department &&
    form.position;

  const debounceRef = useRef<any>(null);

  // ================= BULK STATES =================
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ================= LOAD EMPLOYEES =================
  const loadEmployees = async () => {
    try {
        setLoadingEmployees(true);
      const { data } = await employeesApi.list({
        search,
        department,
        position,
        page,
        page_size: pageSize,
      });

      setEmployees(data.results || []);
      setCount(data.count || 0);
      setLoadingEmployees(false);
    } catch {
      toast.error("Failed to load employees");
      setLoadingEmployees(false)
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD BASE DATA =================
  const loadDepartments = async () => {
    const { data } = await departmentApi.list();
    setDepartments(data.results || data);
  };

  const loadBanks = async () => {
    try {
      const { data } = await axios.get("https://api.paystack.co/bank");
      setBanks(data.data);
    } catch {
      toast.error("Failed to load banks");
    }
  };

  // ================= DEPENDENT POSITION =================
  const handleDepartmentChange = async (deptId: string) => {
    setForm((prev) => ({
      ...prev,
      department: deptId,
      position: "",
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

  // ================= FILTER DEPENDENT =================
  const handleFilterDepartmentChange = async (deptId: string) => {
    setDepartment(deptId);
    setPosition("");
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

  // ================= ACCOUNT RESOLVE =================
  const fetchAccountName = async (bank_code: string, account_number: string) => {
    if (!bank_code || account_number.length < 10) return;

    try {
      const { data } = await employeesApi.resolveAccount({
        bank_code,
        account_number,
      });

      setAccountName(data.account_name);

      setForm((prev) => ({
        ...prev,
        bank_account_name: data.account_name,
      }));
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

  // ================= CREATE SINGLE =================
  const handleCreate = async () => {
    try {
      setCreationLoading(true);
      await employeesApi.create(form);
      toast.success("Employee created");

      setDialogOpen(false);
      setAccountName("");

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

      loadEmployees();
    } catch {
      toast.error("Failed to create employee");
    } finally {
      setCreationLoading(false);
    }
  };

  // ================= BULK ONBOARDING =================
  const handleBulkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    setBulkPreview([]);

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setBulkPreview(result.data as any[]);
        },
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
      toast.error("Only CSV or Excel (.xlsx, .xls) files are allowed");
    }
  };const downloadTemplate = () => {
  const template = [
    {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@company.com",
      phone: "08012345678",
      hire_date: "2025-04-01",           // Must be YYYY-MM-DD format
      department: "Engineering",         // ← Changed from department_name
      position: "Software Engineer",     // ← Changed from position_title
      status: "active",

      // Bank Details (all optional)
      bank_name: "Guaranty Trust Bank",
      bank_account_name: "John Doe",
      bank_account_number: "0123456789",
      bank_code: "058",                  // Bank code (e.g., GTBank = 058)
      bank_account_type: "savings",      // "savings" or "current"
      currency: "NGN",                   // NGN, USD, or EUR
    },
    {
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@company.com",
      phone: "08098765432",
      hire_date: "2025-03-15",
      department: "Marketing",
      position: "Marketing Manager",
      status: "active",

      bank_name: "Access Bank",
      bank_account_name: "Jane Smith",
      bank_account_number: "0987654321",
      bank_code: "044",
      bank_account_type: "current",
      currency: "NGN",
    }
  ];

  const ws = XLSX.utils.json_to_sheet(template);

  // Optional: Make columns wider and add some formatting
  const colWidths = [
    { wch: 15 }, // first_name
    { wch: 15 }, // last_name
    { wch: 30 }, // email
    { wch: 15 }, // phone
    { wch: 12 }, // hire_date
    { wch: 20 }, // department
    { wch: 25 }, // position
    { wch: 10 }, // status
    { wch: 25 }, // bank_name
    { wch: 25 }, // bank_account_name
    { wch: 18 }, // bank_account_number
    { wch: 10 }, // bank_code
    { wch: 12 }, // bank_account_type
    { wch: 8 },  // currency
  ];

  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");

  XLSX.writeFile(wb, "employee_bulk_template.xlsx");
};

  const handleBulkSubmit = async () => {
    if (!bulkFile) {
      toast.error("Please select a file first");
      return;
    }

    setBulkSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", bulkFile);

      await employeesApi.bulkCreate(formData);

      toast.success(`Successfully uploaded ${bulkPreview.length} employee records!`);
      setBulkDialogOpen(false);
      setBulkFile(null);
      setBulkPreview([]);

      loadEmployees();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to process bulk onboarding");
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
  }, [search, department, position, page]);

  useEffect(() => {
    loadDepartments();
    loadBanks();
  }, []);

  const totalPages = Math.ceil(count / pageSize);

  const handleRegistration = (id: any) => {
    window.open(
      `https://walex-projects.github.io/Face_Scan/registration.html?token=${id}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Employees</h1>
          <p className="text-sm text-gray-500">Manage your workforce</p>
        </div>

        <div className="flex gap-3">
          {/* Bulk Onboard */}
          <Dialog
            open={bulkDialogOpen}
            onOpenChange={(open) => {
              setBulkDialogOpen(open);
              if (!open) resetBulkDialog();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Bulk Onboard
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Employee Onboarding</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="flex justify-end">
                  <Button variant="ghost" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 font-medium">Upload CSV or Excel file</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supported: .csv, .xlsx, .xls
                  </p>

                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleBulkFileSelect}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-6"
                  >
                    Select File
                  </Button>

                  {bulkFile && (
                    <p className="mt-4 text-sm text-green-600 font-medium">
                      Selected: {bulkFile.name} — {bulkPreview.length} records
                    </p>
                  )}
                </div>

                {bulkPreview.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">
                      Preview ({bulkPreview.length} employees)
                    </h3>
                    <div className="border rounded-lg overflow-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>First Name</TableHead>
                            <TableHead>Last Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Hire Date</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Position</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkPreview.slice(0, 15).map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.first_name || row.First_Name || "-"}</TableCell>
                              <TableCell>{row.last_name || row.Last_Name || "-"}</TableCell>
                              <TableCell>{row.email || row.Email || "-"}</TableCell>
                              <TableCell>{row.phone || row.Phone || "-"}</TableCell>
                              <TableCell>{row.hire_date || row.Hire_Date || "-"}</TableCell>
                              <TableCell>{row.department || row.Department || "-"}</TableCell>
                              <TableCell>{row.position|| row.Position || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {bulkPreview.length > 15 && (
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Showing first 15 rows • Total: {bulkPreview.length}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleBulkSubmit}
                  disabled={bulkSubmitting || !bulkFile}
                  className="w-full"
                  size="lg"
                >
                  {bulkSubmitting
                    ? "Processing Bulk Onboarding..."
                    : `Onboard ${bulkPreview.length || ""} Employees`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Single Add Employee */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Employee</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* PERSONAL INFO */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500">Personal Info</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* JOB INFO */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500">Job Info</h3>
                  <div>
                    <Label>Department</Label>
                    <select
                      value={form.department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Position</Label>
                    <select
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      className="border p-2 rounded w-full"
                      disabled={!form.department || loadingPositions}
                    >
                      <option value="">
                        {loadingPositions ? "Loading..." : "Select Position"}
                      </option>
                      {positions.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Hire Date</Label>
                    <Input
                      type="date"
                      value={form.hire_date}
                      onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* BANK INFO */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500">Bank Details</h3>
                  <div>
                    <Label>Bank</Label>
                    <select
                      value={form.bank_code}
                      onChange={(e) => handleBankChange(e.target.value)}
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select Bank</option>
                      {banks.map((b: any) => (
                        <option key={b.code} value={b.code}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Account Number</Label>
                    <Input
                      placeholder="Enter 10-digit account number"
                      value={form.bank_account_number}
                      onChange={(e) => handleBankAccountChange(e.target.value)}
                    />
                  </div>

                  {accountName && (
                    <div className="bg-gray-50 border rounded p-2 text-sm">
                      <strong>Account Name:</strong> {accountName}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={handleCreate}
                  disabled={creationLoading || !isFormValid}
                >
                  {creationLoading ? "Onboarding Employee..." : "Create Employee"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-2 top-2 h-4 w-4" />
          <Input
            className="pl-8"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <select
          value={department}
          onChange={(e) => handleFilterDepartmentChange(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Departments</option>
          {departments.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={position}
          onChange={(e) => {
            setPage(1);
            setPosition(e.target.value);
          }}
          className="border p-2 rounded"
          disabled={!department}
        >
          <option value="">{loadingPositions ? "..Loading position" : "Select Position"}</option>
          {filterPositions.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
  {loadingEmployees ? (
    <TableRow>
      <TableCell colSpan={8} className="text-center py-12">
        Loading Employees records...
      </TableCell>
    </TableRow>
  ) : employees.length === 0 ? (
    <TableRow>
      <TableCell
        colSpan={8}
        className="text-center py-12 text-muted-foreground"
      >
        No records found for the selected filters.
      </TableCell>
    </TableRow>
  ) : (
    employees.map((e: any) => (
      <TableRow key={e.id}>
        <TableCell>
          {e.first_name} {e.last_name}
        </TableCell>
        <TableCell>{e.email}</TableCell>
        <TableCell>{e.position_detail}</TableCell>
        <TableCell>
          <Badge>{e.status}</Badge>
        </TableCell>
        <TableCell>
          <Link to={`/employees/${e.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </TableCell>
        <TableCell>
          {!e.face_verified && (
            <Button
              onClick={() => handleRegistration(e.id)}
              variant="outline"
              size="sm"
            >
              Verify Employee Face
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

      {/* PAGINATION */}
      <div className="flex justify-between">
        <p>
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <Button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <Button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}