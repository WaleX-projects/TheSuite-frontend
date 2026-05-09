import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Settings, Clock, DollarSign, Calendar, MapPin, Server, Save, LocateFixed 
} from "lucide-react";
import { settingsApi } from "@/lib/settingsApi";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Main Settings State
  const [settings, setSettings] = useState({
    // Company
    companyName: "HR Suite Connect",
    timezone: "Africa/Lagos",
    dateFormat: "DD/MM/YYYY",
    currency: "NGN",

    // Attendance
    workHoursPerDay: 8,
    allowLateArrival: true,
    lateArrivalGraceMinutes: 15,
    requireFaceVerification: false,
    geoFencingEnabled: false,

    // Payroll
    payrollDay: 25,
    taxRate: 7.5,
    allowManualPayslip: true,

    // Leave
    defaultAnnualLeaveDays: 21,
    defaultSickLeaveDays: 10,
    carryForwardEnabled: true,
    maxCarryForwardDays: 10,
    leaveApprovalRequired: true,

    // System
    emailNotificationsEnabled: true,
    allowSelfRegistration: false,
    maintenanceMode: false,
    sessionTimeoutMinutes: 60,
  });

  const [workLocation, setWorkLocation] = useState({
    latitude: "6.524379",
    longitude: "3.379206",
    radius: 100,
  });

  // Fetch All Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [company, attendance, payroll, leave, system, location] = await Promise.all([
          settingsApi.getCompany(),
          settingsApi.getAttendance(),
          settingsApi.getPayroll(),
          settingsApi.getLeave(),
          settingsApi.getSystem(),
          settingsApi.getWorkLocation(),
        ]);

        setSettings({
          companyName: company.data.company_name || "HR Suite Connect",
          timezone: company.data.timezone || "Africa/Lagos",
          dateFormat: company.data.date_format || "DD/MM/YYYY",
          currency: company.data.currency || "NGN",

          workHoursPerDay: attendance.data.work_hours_per_day || 8,
          allowLateArrival: attendance.data.allow_late_arrival ?? true,
          lateArrivalGraceMinutes: attendance.data.late_arrival_grace_minutes || 15,
          requireFaceVerification: attendance.data.require_face_verification ?? false,
          geoFencingEnabled: attendance.data.geo_fencing_enabled ?? false,

          payrollDay: payroll.data.payroll_day || 25,
          taxRate: Number(payroll.data.tax_rate) || 7.5,
          allowManualPayslip: payroll.data.allow_manual_payslip ?? true,

          defaultAnnualLeaveDays: leave.data.default_annual_leave_days || 21,
          defaultSickLeaveDays: leave.data.default_sick_leave_days || 10,
          carryForwardEnabled: leave.data.carry_forward_enabled ?? true,
          maxCarryForwardDays: leave.data.max_carry_forward_days || 10,
          leaveApprovalRequired: leave.data.leave_approval_required ?? true,

          emailNotificationsEnabled: system.data.email_notifications_enabled ?? true,
          allowSelfRegistration: system.data.allow_self_registration ?? false,
          maintenanceMode: system.data.maintenance_mode ?? false,
          sessionTimeoutMinutes: system.data.session_timeout_minutes || 60,
        });

        if (location.data?.latitude && location.data?.longitude) {
          setWorkLocation({
            latitude: location.data.latitude.toString(),
            longitude: location.data.longitude.toString(),
            radius: location.data.radius_meters || 100,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = (newValues: Partial<typeof settings>) => {
    setSettings((prev) => ({ ...prev, ...newValues }));
  };

  const updateWorkLocation = (newValues: Partial<typeof workLocation>) => {
    setWorkLocation((prev) => ({ ...prev, ...newValues }));
  };

  // Save Handlers
  const saveCompany = async () => {
    setSavingSection("company");
    try {
      await settingsApi.updateCompany({
        company_name: settings.companyName,
        timezone: settings.timezone,
        date_format: settings.dateFormat,
        currency: settings.currency,
      });
      toast.success("Company settings saved");
    } catch {
      toast.error("Failed to save company settings");
    } finally {
      setSavingSection(null);
    }
  };

  const saveAttendance = async () => {
    setSavingSection("attendance");
    try {
      await settingsApi.updateAttendance({
        work_hours_per_day: settings.workHoursPerDay,
        allow_late_arrival: settings.allowLateArrival,
        late_arrival_grace_minutes: settings.lateArrivalGraceMinutes,
        require_face_verification: settings.requireFaceVerification,
        geo_fencing_enabled: settings.geoFencingEnabled,
      });
      toast.success("Attendance settings saved");
    } catch {
      toast.error("Failed to save attendance settings");
    } finally {
      setSavingSection(null);
    }
  };

  const savePayroll = async () => {
    setSavingSection("payroll");
    try {
      await settingsApi.updatePayroll({
        payroll_day: settings.payrollDay,
        tax_rate: settings.taxRate,
        allow_manual_payslip: settings.allowManualPayslip,
      });
      toast.success("Payroll settings saved");
    } catch {
      toast.error("Failed to save payroll settings");
    } finally {
      setSavingSection(null);
    }
  };

  const saveLeave = async () => {
    setSavingSection("leave");
    try {
      await settingsApi.updateLeave({
        default_annual_leave_days: settings.defaultAnnualLeaveDays,
        default_sick_leave_days: settings.defaultSickLeaveDays,
        carry_forward_enabled: settings.carryForwardEnabled,
        max_carry_forward_days: settings.maxCarryForwardDays,
        leave_approval_required: settings.leaveApprovalRequired,
      });
      toast.success("Leave settings saved");
    } catch {
      toast.error("Failed to save leave settings");
    } finally {
      setSavingSection(null);
    }
  };

  const saveSystem = async () => {
    setSavingSection("system");
    try {
      await settingsApi.updateSystem({
        email_notifications_enabled: settings.emailNotificationsEnabled,
        allow_self_registration: settings.allowSelfRegistration,
        maintenance_mode: settings.maintenanceMode,
        session_timeout_minutes: settings.sessionTimeoutMinutes,
      });
      toast.success("System settings saved");
    } catch {
      toast.error("Failed to save system settings");
    } finally {
      setSavingSection(null);
    }
  };

  const saveWorkLocation = async () => {
    if (!workLocation.latitude || !workLocation.longitude) {
      return toast.error("Please provide both latitude and longitude");
    }

    setSavingSection("location");
    try {
      await settingsApi.updateWorkLocation({
        work_latitude: parseFloat(workLocation.latitude),
        work_longitude: parseFloat(workLocation.longitude),
        work_radius_meters: workLocation.radius,
      });
      toast.success("Work location saved successfully");
    } catch {
      toast.error("Failed to save work location");
    } finally {
      setSavingSection(null);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setWorkLocation({
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
          radius: workLocation.radius,
        });
        toast.success("Current location captured successfully!");
        setGettingLocation(false);
      },
      (error) => {
        toast.error("Unable to get location. Please allow location access.");
        console.error(error);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-[400px]">Loading system settings...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Settings className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">System Configuration</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage your organization's global settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="leave" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Leave
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* ==================== COMPANY ==================== */}
        <TabsContent value="company">
          <Card>
            <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={settings.companyName} 
                    onChange={(e) => updateSettings({ companyName: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(v) => updateSettings({ timezone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(v) => updateSettings({ dateFormat: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={settings.currency} onValueChange={(v) => updateSettings({ currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">₦ Nigerian Naira (NGN)</SelectItem>
                      <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={saveCompany} disabled={savingSection === "company"} className="flex items-center gap-2">
                <Save className="h-4 w-4" /> {savingSection === "company" ? "Saving..." : "Save Company Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ATTENDANCE ==================== */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader><CardTitle>Attendance Settings</CardTitle></CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Work Hours Per Day</Label>
                  <Input 
                    type="number" 
                    value={settings.workHoursPerDay} 
                    onChange={(e) => updateSettings({ workHoursPerDay: parseInt(e.target.value) || 8 })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Late Arrival Grace Minutes</Label>
                  <Input 
                    type="number" 
                    value={settings.lateArrivalGraceMinutes} 
                    onChange={(e) => updateSettings({ lateArrivalGraceMinutes: parseInt(e.target.value) || 15 })} 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Late Arrival</Label>
                    <p className="text-sm text-muted-foreground">Enable grace period for late arrivals</p>
                  </div>
                  <Switch 
                    checked={settings.allowLateArrival} 
                    onCheckedChange={(c) => updateSettings({ allowLateArrival: c })} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Face Verification</Label>
                    <p className="text-sm text-muted-foreground">Employees must verify identity with face scan</p>
                  </div>
                  <Switch 
                    checked={settings.requireFaceVerification} 
                    onCheckedChange={(c) => updateSettings({ requireFaceVerification: c })} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Geo-Fencing</Label>
                    <p className="text-sm text-muted-foreground">Restrict clock-in to office location</p>
                  </div>
                  <Switch 
                    checked={settings.geoFencingEnabled} 
                    onCheckedChange={(c) => updateSettings({ geoFencingEnabled: c })} 
                  />
                </div>
              </div>

              <Button onClick={saveAttendance} disabled={savingSection === "attendance"} className="flex items-center gap-2">
                <Save className="h-4 w-4" /> {savingSection === "attendance" ? "Saving..." : "Save Attendance Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== PAYROLL ==================== */}
        <TabsContent value="payroll">
          <Card>
            <CardHeader><CardTitle>Payroll Settings</CardTitle></CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Payroll Day of Month</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="31" 
                    value={settings.payrollDay} 
                    onChange={(e) => updateSettings({ payrollDay: parseInt(e.target.value) || 25 })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    value={settings.taxRate} 
                    onChange={(e) => updateSettings({ taxRate: parseFloat(e.target.value) || 7.5 })} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Manual Payslip Generation</Label>
                  <p className="text-sm text-muted-foreground">HR can generate payslips manually</p>
                </div>
                <Switch 
                  checked={settings.allowManualPayslip} 
                  onCheckedChange={(c) => updateSettings({ allowManualPayslip: c })} 
                />
              </div>

              <Button onClick={savePayroll} disabled={savingSection === "payroll"} className="flex items-center gap-2">
                <Save className="h-4 w-4" /> {savingSection === "payroll" ? "Saving..." : "Save Payroll Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== LEAVE ==================== */}
        <TabsContent value="leave">
          <Card>
            <CardHeader><CardTitle>Leave Policy Settings</CardTitle></CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Annual Leave Days</Label>
                  <Input 
                    type="number" 
                    value={settings.defaultAnnualLeaveDays} 
                    onChange={(e) => updateSettings({ defaultAnnualLeaveDays: parseInt(e.target.value) || 21 })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Sick Leave Days</Label>
                  <Input 
                    type="number" 
                    value={settings.defaultSickLeaveDays} 
                    onChange={(e) => updateSettings({ defaultSickLeaveDays: parseInt(e.target.value) || 10 })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Carry Forward Days</Label>
                  <Input 
                    type="number" 
                    value={settings.maxCarryForwardDays} 
                    onChange={(e) => updateSettings({ maxCarryForwardDays: parseInt(e.target.value) || 10 })} 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Leave Carry Forward</Label>
                  </div>
                  <Switch 
                    checked={settings.carryForwardEnabled} 
                    onCheckedChange={(c) => updateSettings({ carryForwardEnabled: c })} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Approval for All Leaves</Label>
                  </div>
                  <Switch 
                    checked={settings.leaveApprovalRequired} 
                    onCheckedChange={(c) => updateSettings({ leaveApprovalRequired: c })} 
                  />
                </div>
              </div>

              <Button onClick={saveLeave} disabled={savingSection === "leave"} className="flex items-center gap-2">
                <Save className="h-4 w-4" /> {savingSection === "leave" ? "Saving..." : "Save Leave Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== WORK LOCATION ==================== */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Work Location &amp; Geo-Fencing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input 
                    id="latitude"
                    value={workLocation.latitude} 
                    onChange={(e) => updateWorkLocation({ latitude: e.target.value })} 
                    placeholder="6.524379"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input 
                    id="longitude"
                    value={workLocation.longitude} 
                    onChange={(e) => updateWorkLocation({ longitude: e.target.value })} 
                    placeholder="3.379206"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius">Radius (meters)</Label>
                  <Input 
                    id="radius"
                    type="number" 
                    value={workLocation.radius} 
                    onChange={(e) => updateWorkLocation({ radius: parseInt(e.target.value) || 100 })} 
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={getCurrentLocation} 
                  disabled={gettingLocation}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <LocateFixed className="h-4 w-4" />
                  {gettingLocation ? "Getting Location..." : "Use Current Location"}
                </Button>

                <Button 
                  onClick={saveWorkLocation} 
                  disabled={savingSection === "location" || !workLocation.latitude || !workLocation.longitude}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> 
                  {savingSection === "location" ? "Saving..." : "Save Work Location"}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                Tip: Click <strong>"Use Current Location"</strong> while at the office to automatically fill coordinates.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== SYSTEM ==================== */}
        <TabsContent value="system">
          <Card>
            <CardHeader><CardTitle>System Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send system and approval emails</p>
                  </div>
                  <Switch 
                    checked={settings.emailNotificationsEnabled} 
                    onCheckedChange={(c) => updateSettings({ emailNotificationsEnabled: c })} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Employee Self-Registration</Label>
                  </div>
                  <Switch 
                    checked={settings.allowSelfRegistration} 
                    onCheckedChange={(c) => updateSettings({ allowSelfRegistration: c })} 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable access for all users</p>
                  </div>
                  <Switch 
                    checked={settings.maintenanceMode} 
                    onCheckedChange={(c) => updateSettings({ maintenanceMode: c })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input 
                  type="number" 
                  value={settings.sessionTimeoutMinutes} 
                  onChange={(e) => updateSettings({ sessionTimeoutMinutes: parseInt(e.target.value) || 60 })} 
                />
              </div>

              <Button onClick={saveSystem} disabled={savingSection === "system"} className="flex items-center gap-2">
                <Save className="h-4 w-4" /> {savingSection === "system" ? "Saving..." : "Save System Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}