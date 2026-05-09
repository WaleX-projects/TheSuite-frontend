"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, Users, TrendingUp, Briefcase } from "lucide-react";

// Assume you have these API clients (create similar to attendanceApi / employeesApi)
import { salaryApi } from "@/lib/employeesApi";        // You'll need to create this
// import { employeesApi } from "@/lib/employeesApi";

export default function SalaryPage() {
  const [positionSalaries, setPositionSalaries] = useState<any[]>([]);
  const [employeeOverrides, setEmployeeOverrides] = useState<any[]>([]);
  const [companyStructures, setCompanyStructures] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "positions" | "overrides" | "payslips">("overview");

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all required data in parallel
      const [posRes, overrideRes, structRes, payslipRes] = await Promise.all([
        salaryApi.getPositionSalaries?.() || Promise.resolve({ data: [] }),
        salaryApi.getEmployeeOverrides?.() || Promise.resolve({ data: [] }),
        salaryApi.getCompanyStructures?.() || Promise.resolve({ data: [] }),
        salaryApi.getPayslips?.() || Promise.resolve({ data: { results: [] } }),
      ]);

      setPositionSalaries(posRes.data || []);
      setEmployeeOverrides(overrideRes.data || []);
      setCompanyStructures(structRes.data || []);
      setPayslips(payslipRes.data.results || payslipRes.data || []);
    } catch (err) {
      toast.error("Failed to load salary data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // KPI Calculations
  const totalBasicSalary = positionSalaries.reduce((sum, p) => sum + (parseFloat(p.basic_salary) || 0), 0);
  const totalOverrides = employeeOverrides.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
  const totalPayslips = payslips.length;
  const totalNetPay = payslips.reduce((sum, p) => sum + (parseFloat(p.net_salary) || 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salary Management</h1>
          <p className="text-muted-foreground">Manage position salaries, overrides, structures and payslips</p>
        </div>
        <Button onClick={loadData}>Refresh Data</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>

          <CardContent className="p-4">
            
            <p className="text-2xl font-bold capitalize mt-1">Employee name</p>
            <p className="text-sm text-muted-foreground mt-1">employee name</p>
          </CardContent>
        </Card>

        {/* Financial Breakdown */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Payroll Breakdown</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span>Total Basic</span><span>Employee Name</span></div>
              <div className="flex justify-between text-green-600"><span>Allowances</span><span>+₦</span></div>
              <div className="flex justify-between text-red-600"><span>Deductions</span><span>-₦</span></div>
              <hr />
              <div className="flex justify-between font-bold text-lg"><span>Net Payroll</span><span>₦</span></div>
            </div>
          </CardContent>
        </Card>
      
        
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {(["overview", "positions", "overrides", "payslips"] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" && "Overview"}
            {tab === "positions" && "Position Salaries"}
            {tab === "overrides" && "Employee Overrides"}
            {tab === "payslips" && "Payslips"}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Salary Structures</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Default Value</TableHead>
                    <TableHead>Mandatory</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyStructures.slice(0, 5).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.component_detail?.name || "—"}</TableCell>
                      <TableCell>₦{parseFloat(item.default_value || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_mandatory ? "default" : "secondary"}>
                          {item.is_mandatory ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payslips</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Net Salary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.slice(0, 5).map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.employee_detail?.full_name || "—"}</TableCell>
                      <TableCell>{p.payroll_month}/{p.payroll_year}</TableCell>
                      <TableCell className="font-medium">
                        ₦{parseFloat(p.net_salary || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Position Salaries Tab */}
      {activeTab === "positions" && (
        <Card>
          <CardHeader>
            <CardTitle>Position Salary Structures</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Components</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positionSalaries.map((pos: any) => (
                  <TableRow key={pos.id}>
                    <TableCell className="font-medium">{pos.position_detail?.title}</TableCell>
                    <TableCell>₦{parseFloat(pos.basic_salary || 0).toLocaleString()}</TableCell>
                    <TableCell>{pos.company_detail?.name}</TableCell>
                    <TableCell>
                      {pos.components?.length || 0} components
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Employee Overrides Tab */}
      {activeTab === "overrides" && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Salary Overrides</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeOverrides.map((ov: any) => (
                  <TableRow key={ov.id}>
                    <TableCell>{ov.employee_detail?.full_name}</TableCell>
                    <TableCell>{ov.component_detail?.name}</TableCell>
                    <TableCell className="font-medium">
                      ₦{parseFloat(ov.value || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payslips Tab */}
      {activeTab === "payslips" && (
        <Card>
          <CardHeader>
            <CardTitle>All Payslips</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Basic</TableHead>
                  <TableHead>Allowance</TableHead>
                  <TableHead>Deduction</TableHead>
                  <TableHead>Net Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.employee_detail?.full_name}</TableCell>
                    <TableCell>{p.payroll_month} / {p.payroll_year}</TableCell>
                    <TableCell>₦{parseFloat(p.basic_salary || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">
                      ₦{parseFloat(p.total_allowance || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-red-600">
                      ₦{parseFloat(p.total_deduction || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₦{parseFloat(p.net_salary || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}