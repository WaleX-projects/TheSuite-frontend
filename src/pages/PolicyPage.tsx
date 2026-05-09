import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  DollarSign, 
  Building2, 
  Users, 
  Calendar, 
  ShieldCheck 
} from "lucide-react";
import { toast } from "sonner";

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState<"payroll" | "company" | "attendance" | "system">("payroll");

  // Payroll Configuration State
  const [payrollConfig, setPayrollConfig] = useState({
    salaryDay: 25,
    currency: "NGN",
    taxEnabled: true,
    pensionEnabled: true,
    nhfEnabled: true,
    overtimeRate: 1.5,
    weekendRate: 2.0,
    allowNegativeLeave: false,
    autoGeneratePayslip: true,
  });

  // Company Configuration State
  const [companyConfig, setCompanyConfig] = useState({
    companyName: "TechNova Solutions Ltd",
    companyEmail: "hr@technova.com",
    phone: "+234 803 123 4567",
    address: "123 Adeola Odeku Street, Victoria Island, Lagos",
    website: "https://technova.com",
    registrationNumber: "RC-1234567",
    taxId: "TIN-98765432",
  });

  const handlePayrollSave = () => {
    // TODO: Call API to save payroll config
    toast.success("Payroll configuration saved successfully");
  };

  const handleCompanySave = () => {
    // TODO: Call API to save company config
    toast.success("Company settings updated successfully");
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Manage company-wide settings, payroll rules, and system preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* ==================== PAYROLL CONFIGURATION ==================== */}
        <TabsContent value="payroll" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Salary Payment Day</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={payrollConfig.salaryDay}
                    onChange={(e) => setPayrollConfig({ ...payrollConfig, salaryDay: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Day of the month salaries are paid</p>
                </div>

                <div>
                  <Label>Currency</Label>
                  <Input value={payrollConfig.currency} disabled />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">Deductions &amp; Contributions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Tax (PAYE)</p>
                      <p className="text-sm text-muted-foreground">Automatically calculate Pay As You Earn tax</p>
                    </div>
                    <Switch
                      checked={payrollConfig.taxEnabled}
                      onCheckedChange={(checked) => setPayrollConfig({ ...payrollConfig, taxEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pension Contribution</p>
                      <p className="text-sm text-muted-foreground">Enable mandatory pension deductions</p>
                    </div>
                    <Switch
                      checked={payrollConfig.pensionEnabled}
                      onCheckedChange={(checked) => setPayrollConfig({ ...payrollConfig, pensionEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">NHF Contribution</p>
                      <p className="text-sm text-muted-foreground">National Housing Fund</p>
                    </div>
                    <Switch
                      checked={payrollConfig.nhfEnabled}
                      onCheckedChange={(checked) => setPayrollConfig({ ...payrollConfig, nhfEnabled: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Overtime Rate (Multiplier)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={payrollConfig.overtimeRate}
                    onChange={(e) => setPayrollConfig({ ...payrollConfig, overtimeRate: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Weekend/Holiday Rate (Multiplier)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={payrollConfig.weekendRate}
                    onChange={(e) => setPayrollConfig({ ...payrollConfig, weekendRate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePayrollSave} size="lg">
                  Save Payroll Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== COMPANY SETTINGS ==================== */}
        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={companyConfig.companyName}
                    onChange={(e) => setCompanyConfig({ ...companyConfig, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Company Email</Label>
                  <Input
                    type="email"
                    value={companyConfig.companyEmail}
                    onChange={(e) => setCompanyConfig({ ...companyConfig, companyEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Company Address</Label>
                <Input
                  value={companyConfig.address}
                  onChange={(e) => setCompanyConfig({ ...companyConfig, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={companyConfig.phone}
                    onChange={(e) => setCompanyConfig({ ...companyConfig, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={companyConfig.website}
                    onChange={(e) => setCompanyConfig({ ...companyConfig, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Registration Number (RC)</Label>
                  <Input value={companyConfig.registrationNumber} />
                </div>
                <div>
                  <Label>Tax Identification Number (TIN)</Label>
                  <Input value={companyConfig.taxId} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCompanySave} size="lg">
                  Update Company Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ATTENDANCE CONFIG ==================== */}
        <TabsContent value="attendance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance &amp; Leave Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">Configure working hours, leave policies, and attendance rules.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Biometric Attendance</p>
                    <p className="text-sm text-muted-foreground">Use fingerprint/face recognition for clock-in/out</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Clock-in from Mobile App</p>
                    <p className="text-sm text-muted-foreground">Employees can mark attendance via mobile</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div>
                  <Label>Standard Working Hours per Day</Label>
                  <Input type="number" defaultValue={8} className="w-32" />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button size="lg">Save Attendance Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== SYSTEM SETTINGS ==================== */}
        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System &amp; Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Send payroll, leave, and system alerts via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication (2FA)</p>
                    <p className="text-sm text-muted-foreground">Enforce 2FA for all admin accounts</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Backup Database</p>
                    <p className="text-sm text-muted-foreground">Daily automated backups</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="pt-4">
                <Button variant="destructive">Reset All Settings to Default</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}