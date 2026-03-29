
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { employeesApi, departmentApi, positionApi } from "@/lib/employeesApi";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { Plus, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

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

  const [dialogOpen, setDialogOpen] = useState(false);

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
    bank_account_number: ""
  });

  const debounceRef = useRef<any>(null);

  // ================= LOAD EMPLOYEES =================
  const loadEmployees = async () => {
    try {
      const { data } = await employeesApi.list({
        search,
        department,
        position,
        page,
        page_size: pageSize
      });

      setEmployees(data.results || []);
      setCount(data.count || 0);
    } catch {
      toast.error("Failed to load employees");
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
      position: ""
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
        account_number
      });

      setAccountName(data.account_name);

      setForm((prev) => ({
        ...prev,
        bank_account_name: data.account_name
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
    const selected = banks.find((b) => b.code === code);

    setForm((prev) => ({
      ...prev,
      bank_code: code,
      bank_name: selected?.name || ""
    }));
  };

  // ================= CREATE =================
  const handleCreate = async () => {
    try {
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
        bank_account_number: ""
      });

      loadEmployees();
    } catch {
      toast.error("Failed to create employee");
    }
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

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-bold">Employees</h1>
          <p className="text-sm text-gray-500">Manage your workforce</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>
          </DialogTrigger>
         <DialogContent className="max-w-lg">
  <DialogHeader>
    <DialogTitle>Add Employee</DialogTitle>
  </DialogHeader>

  <div className="space-y-6">

    {/* 🔹 PERSONAL INFO */}
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

    {/* 🔹 JOB INFO */}
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
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>Position</Label>
       {/* POSITION */}
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="border p-2 rounded w-full"
                disabled={!form.department || loadingPositions}
              >
                <option value="">
                  {loadingPositions ? "Loading..." : "Select Position"}
                </option>

                {positions.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
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

    {/* 🔹 BANK INFO */}
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
          {banks.map((b) => (
            <option key={b.code} value={b.code}>{b.name}</option>
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

    {/* 🔹 ACTION */}
    <Button className="w-full" onClick={handleCreate}>
      Create Employee
    </Button>

  </div>
</DialogContent>

          
        </Dialog>
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
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
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
        
          <option value="">{loadingPositions ? "..Loading position" :  'Select Position' }</option>
          {filterPositions.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
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
              </TableRow>
            </TableHeader>

            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.first_name} {e.last_name}</TableCell>
                  <TableCell>{e.email}</TableCell>
                  <TableCell>{e.position_detail}</TableCell>
                  <TableCell><Badge>{e.status}</Badge></TableCell>
                  <TableCell>
                    <Link to={`/employees/${e.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAGINATION */}
      <div className="flex justify-between">
        <p>Page {page} of {totalPages}</p>

        <div className="flex gap-2">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          <Button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>

    </div>
  );
}