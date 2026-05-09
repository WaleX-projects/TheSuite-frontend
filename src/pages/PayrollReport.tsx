import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PayrollRecord = {
  id: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "paid" | "pending" | "processing";
  month: string;
};

const mockData: PayrollRecord[] = [
  {
    id: "1",
    employeeName: "John Doe",
    department: "Engineering",
    basicSalary: 500000,
    allowances: 120000,
    deductions: 50000,
    netSalary: 570000,
    status: "paid",
    month: "April 2026",
  },
  {
    id: "2",
    employeeName: "Jane Smith",
    department: "HR",
    basicSalary: 350000,
    allowances: 80000,
    deductions: 30000,
    netSalary: 400000,
    status: "pending",
    month: "April 2026",
  },
];

export default function PayrollReportPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return mockData.filter((r) => {
      const matchesSearch =
        r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        r.department.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, r) => {
        acc.totalBasic += r.basicSalary;
        acc.totalAllowances += r.allowances;
        acc.totalDeductions += r.deductions;
        acc.totalNet += r.netSalary;
        return acc;
      },
      {
        totalBasic: 0,
        totalAllowances: 0,
        totalDeductions: 0,
        totalNet: 0,
      }
    );
  }, [filtered]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Report</CardTitle>
        </CardHeader>

        <CardContent className="flex gap-4">
          <Input
            placeholder="Search employee or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
          </select>

          <Button>Export CSV</Button>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p>Total Basic</p>
            <b>{totals.totalBasic.toLocaleString()}</b>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p>Total Allowances</p>
            <b>{totals.totalAllowances.toLocaleString()}</b>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p>Total Deductions</p>
            <b>{totals.totalDeductions.toLocaleString()}</b>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p>Net Payroll</p>
            <b>{totals.totalNet.toLocaleString()}</b>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th>Employee</th>
                <th>Department</th>
                <th>Basic</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Month</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b">
                  <td>{r.employeeName}</td>
                  <td>{r.department}</td>
                  <td>{r.basicSalary.toLocaleString()}</td>
                  <td>{r.allowances.toLocaleString()}</td>
                  <td>{r.deductions.toLocaleString()}</td>
                  <td><b>{r.netSalary.toLocaleString()}</b></td>
                  <td>{r.status}</td>
                  <td>{r.month}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}