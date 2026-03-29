import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { employeesApi } from "@/lib/employeesApi";
import { attendanceApi } from "@/lib/attendanceApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, X , Briefcase, Phone, Mail, MapPin, Calendar, Building2, DollarSign, Download } from "lucide-react";
import { toast } from "sonner";
import { dateToWords } from "@/lib/utils";
//import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const statusColor = (s: string) => {
  switch (s?.toLowerCase()) {
    case "present": return "bg-success/10 text-success border-success/20";
    case "late": return "bg-warning/10 text-warning border-warning/20";
    case "absent": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "";
  }
};

const leaveStatusVariant = (s: string): "default" | "secondary" | "destructive" => {
  switch (s?.toLowerCase()) {
    case "approved": return "default";
    case "rejected": return "destructive";
    default: return "secondary";
  }
};

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const [attendance, setAttendance] = useState<any[]>([]);
const [payslip ,setPayslip] = useState<any[]>([]);
  
  
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await employeesApi.get(id);
        
        setEmployee(data);
      } catch { toast.error("Failed to load employee"); }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  if (!employee) return <div className="text-center py-16 text-muted-foreground">Employee not found</div>;

 const handleAttendance = async () => {
  try {
    const { data } = await attendanceApi.get(id);

    setAttendance(Array.isArray(data) ? data : data.results || []);
  } catch {
    toast.error("Failed to load attendance");
  }
};



 const handleEmployeepayslips = async () => {
  try {
    
    const { data } = await employeesApi.listEmployeepayslip(id);
    
    
setPayslip(Array.isArray(data) ? data : data.results || []);
  } catch {
    toast.error("Failed to load payslips");
  }
};


// handling deactivation of employees 
const handleDeactivate = async () => {
  try {
    await employeesApi.deactivate(id);
    toast.success("Employee deactivated");
    loadEmployees();
  } catch {
    toast.error("Failed to deactivate employee");
  }
};

  const leaves = employee.leave || employee.leaves || [];
  

  return (
    <div className="space-y-6">
    
      <div className="flex items-center justify-between">
      
            <h1 className="page-header">{employee.first_name} {employee.last_name}</h1>
                    {employee.status === "active" ? (
        <Button
            onClick={() => handleDeactivate(e.id)}
            className="bg-red-600 hover:bg-red-400"
        >
            <X className="mr-2 h-4 w-4" />
            Deactivate Employee
        </Button>
        ) : (
        <Button
            onClick={() => handleActivate(e.id)}
            className="bg-green-600 hover:bg-green-400"
        >
            Activate Employee
        </Button>
        )}
            
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger onClick={handleAttendance} value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave History</TabsTrigger>
          <TabsTrigger onClick={handleEmployeepayslips} value="payslip">Payslips</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Personal Information</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Full Name</span><p className="font-medium">{employee.first_name} {employee.last_name}</p></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /><span>{employee.email}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /><span>{employee.phone || "—"}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /><span>{employee.address || "—"}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span>{employee.date_of_birth || "—"}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Employment Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Company</span><p className="font-medium flex items-center gap-1"><Building2 className="h-3 w-3" />{employee.company_detail || employee.company || "—"}</p></div>
                <div><span className="text-muted-foreground">Department</span><p className="font-medium">{employee.department_detail || "—"}</p></div>
                <div><span className="text-muted-foreground">Position</span><p className="font-medium">{employee.position_detail || "—"}</p></div>
                <div><span className="text-muted-foreground">Hire Date</span><p className="font-medium">{employee.hire_date || "—"}</p></div>
                <div><span className="text-muted-foreground">Status</span>
                  <Badge variant={employee.active !== "active"? "default" : "secondary"}>{employee.status === "active" ? "Active" : "Inactive"}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Emergency Contact</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Name</span><p className="font-medium">{employee.emergency_contact_name || "—"}</p></div>
                <div><span className="text-muted-foreground">Phone</span><p className="font-medium">{employee.emergency_contact_phone || "—"}</p></div>
                <div><span className="text-muted-foreground">Relation</span><p className="font-medium">{employee.emergency_contact_relation || "—"}</p></div>
              </CardContent>
            </Card>
            
            <Card>
  <CardHeader>
    <CardTitle className="text-base flex items-center gap-2">
      <DollarSign className="h-4 w-4 text-primary" />
      Account Information
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-3 text-sm">
  
    <div>
      <span className="text-muted-foreground">Bank Name</span>
      <p className="font-medium">
        {employee.bank_name || "-"}
      </p>
    </div>

    <div>
      <span className="text-muted-foreground">Account Name</span>
      <p className="font-medium">
        {employee.bank_account_name || "-"}
      </p>
    </div>

    <div>
      <span className="text-muted-foreground">Account Number</span>
      <p className="font-medium tracking-widest">
        {employee.masked_account_number}
      </p>
    </div>

    <div>
      <span className="text-muted-foreground">Account Type</span>
      <p className="font-medium">
        {employee.bank_account_type || "-"}
      </p>
    </div>

    <div>
      <span className="text-muted-foreground">Currency</span>
      <p className="font-medium">
        {employee.currency || "-"}
      </p>
    </div>
  </CardContent>
</Card>

          </div>
        </TabsContent>

        {/* ATTENDANCE */}
        <TabsContent value="attendance">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((a: any, i: number) => (
                    <TableRow key={i} className={statusColor(a.status)}>
                      <TableCell> {dateToWords(new Date(a.date).toLocaleDateString())}</TableCell>
                      <TableCell>{a.clock_in_time || "—"}</TableCell>
                      
                      <TableCell><Badge variant="outline" className={statusColor(a.status)}>{a.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {attendance.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No attendance records</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LEAVE */}
        <TabsContent value="leave">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((l: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{l.leave_type || l.type || "—"}</TableCell>
                      <TableCell>{l.start_date}</TableCell>
                      <TableCell>{l.end_date}</TableCell>
                      <TableCell>{l.total_days || "—"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{l.reason || "—"}</TableCell>
                      <TableCell><Badge variant={leaveStatusVariant(l.status)}>{l.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {leaves.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No leave records</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYSLIP */}
        <TabsContent value="payslip">
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {[
              { label: "Total Earned (YTD)", value: `$${payslip.reduce((s: number, p: any) => s + parseFloat(p.net_salary || p.amount || 0), 0).toLocaleString()}` },
              { label: "Last Salary", value: payslip.length > 0 ? `$${parseFloat(payslip[payslip.length - 1].net_salary|| payslip[payslip.length - 1].amount || 0).toLocaleString()}` : "—" },
              { label: "Records", value: payslip.length },
            ].map((s) => (
              <Card key={s.label} className="stat-card">
                <CardContent className="p-0">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslip.map((p: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{p.payroll_month} /{p.payroll_year}</TableCell>
                      <TableCell>${parseFloat(p.basic_salary || p.amount || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">${parseFloat(p.total_allowance || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">${parseFloat(p.total_deduction || 0).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">${parseFloat(p.net_salary || p.amount || 0).toLocaleString()}</TableCell>
                      <TableCell><Badge variant={p.status === "paid" ? "default" : "secondary"}>{p.payroll_status|| "—"}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {payslip.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No Payslip records</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
