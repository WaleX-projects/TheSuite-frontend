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
  Settings, Clock, DollarSign, MapPin, Save 
} from "lucide-react";
import { settingsApi } from "@/lib/settingsApi";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [settings, setSettings] = useState({
    companyName: "HR Suite Connect",
    timezone: "Africa/Lagos",
    dateFormat: "DD/MM/YYYY",
    currency: "NGN",

    workHoursPerDay: 8,
    allowLateArrival: true,
    lateArrivalGraceMinutes: 15,
    requireFaceVerification: true,
    geoFencingEnabled: false,

    payrollDay: 25,
    taxRate: 7.5,
    allowManualPayslip: true,
  });

  const [workLocation, setWorkLocation] = useState({
    latitude: "",
    longitude: "",
    radius: 100,
  });

  // Fetch Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [general, attendance, payroll, location] = await Promise.all([
          settingsApi.getGeneral(),
          settingsApi.getAttendance(),
          settingsApi.getPayroll(),
          settingsApi.getWorkLocation(),
        ]);

        setSettings({
          companyName: general.data.company_name || "HR Suite Connect",
          timezone: general.data.timezone || "Africa/Lagos",
          dateFormat: general.data.date_format || "DD/MM/YYYY",
          currency: general.data.currency || "NGN",

          workHoursPerDay: attendance.data.work_hours_per_day || 8,
          allowLateArrival: attendance.data.allow_late_arrival ?? true,
          lateArrivalGraceMinutes: attendance.data.late_arrival_grace_minutes || 15,
          requireFaceVerification: attendance.data.require_face_verification ?? true,
          geoFencingEnabled: attendance.data.geo_fencing_enabled ?? false,

          payrollDay: payroll.data.payroll_day || 25,
          taxRate: Number(payroll.data.tax_rate) || 7.5,
          allowManualPayslip: payroll.data.allow_manual_payslip ?? true,
        });

        if (location.data?.work_latitude && location.data?.work_longitude) {
          setWorkLocation({
            latitude: location.data.work_latitude.toString(),
            longitude: location.data.work_longitude.toString(),
            radius: location.data.work_radius_meters || 100,
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

  // Save Handlers
  const saveGeneral = async () => {
    setSavingSection("general");
    try {
      await settingsApi.updateGeneral({
        company_name: settings.companyName,
        timezone: settings.timezone,
        date_format: settings.dateFormat,
        currency: settings.currency,
      });
      toast.success("General settings saved successfully");
    } catch {
      toast.error("Failed to save general settings");
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
      toast.success("Attendance settings saved successfully");
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
      toast.success("Payroll settings saved successfully");
    } catch {
      toast.error("Failed to save payroll settings");
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
          ...workLocation,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        toast.success("Current location captured successfully!");
        setGettingLocation(false);
      },
      () => {
        toast.error("Unable to get your location. Please allow access.");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        Loading system settings...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
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

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Work Location
          </TabsTrigger>
        </TabsList>

        {/* ==================== GENERAL ==================== */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Company & General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => updateSettings({ companyName: e.target.value })}
                    placeholder="Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(v) => updateSettings({ timezone: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(v) => updateSettings({ dateFormat: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={settings.currency} onValueChange={(v) => updateSettings({ currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">₦ Nigerian Naira (NGN)</SelectItem>
                      <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={saveGeneral} 
                disabled={savingSection === "general"}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {savingSection === "general" ? "Saving..." : "Save General Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== ATTENDANCE ==================== */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Attendance Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Standard Work Hours per Day</Label>
                  <Input
                    type="number"
                    value={settings.workHoursPerDay}
                    onChange={(e) => updateSettings({ workHoursPerDay: parseInt(e.target.value) || 8 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Late Arrival Grace Period (minutes)</Label>
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
                    <Label>Allow Late Arrivals</Label>
                    <p className="text-sm text-muted-foreground">Employees will be marked late instead of absent after grace period</p>
                  </div>
                  <Switch
                    checked={settings.allowLateArrival}
                    onCheckedChange={(checked) => updateSettings({ allowLateArrival: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Face Verification for Clock In</Label>
                  </div>
                  <Switch
                    checked={settings.requireFaceVerification}
                    onCheckedChange={(checked) => updateSettings({ requireFaceVerification: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Geo-Fencing</Label>
                    <p className="text-sm text-muted-foreground">Restrict clock-in to office location only</p>
                  </div>
                  <Switch
                    checked={settings.geoFencingEnabled}
                    onCheckedChange={(checked) => updateSettings({ geoFencingEnabled: checked })}
                  />
                </div>
              </div>

              <Button 
                onClick={saveAttendance} 
                disabled={savingSection === "attendance"}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {savingSection === "attendance" ? "Saving..." : "Save Attendance Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== PAYROLL ==================== */}
        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Payroll Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Payroll Day of Month</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={settings.payrollDay}
                    onChange={(e) => updateSettings({ payrollDay: parseInt(e.target.value) || 25 })}
                  />
                  <p className="text-xs text-muted-foreground">Day of the month when salary is processed</p>
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
                </div>
                <Switch
                  checked={settings.allowManualPayslip}
                  onCheckedChange={(checked) => updateSettings({ allowManualPayslip: checked })}
                />
              </div>

              <Button 
                onClick={savePayroll} 
                disabled={savingSection === "payroll"}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {savingSection === "payroll" ? "Saving..." : "Save Payroll Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== WORK LOCATION ==================== */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Work Location (Geo-fencing)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <p className="text-muted-foreground">
                Set your office location. This will be used to verify employees are within the allowed radius during face-based attendance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={workLocation.latitude}
                    onChange={(e) => setWorkLocation({ ...workLocation, latitude: e.target.value })}
                    placeholder="6.524379"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={workLocation.longitude}
                    onChange={(e) => setWorkLocation({ ...workLocation, longitude: e.target.value })}
                    placeholder="3.379206"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allowed Radius (meters)</Label>
                <Input
                  type="number"
                  min={50}
                  max={1000}
                  value={workLocation.radius}
                  onChange={(e) => setWorkLocation({ ...workLocation, radius: parseInt(e.target.value) || 100 })}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="flex-1"
                >
                  {gettingLocation ? "Getting Location..." : "📍 Get My Current Location"}
                </Button>

                <Button 
                  onClick={saveWorkLocation}
                  disabled={savingSection === "location" || !workLocation.latitude || !workLocation.longitude}
                  className="flex-1 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {savingSection === "location" ? "Saving..." : "Save Work Location"}
                </Button>
              </div>

              {workLocation.latitude && workLocation.longitude && (
                <div className="p-4 bg-muted rounded-xl text-sm">
                  <p className="font-medium mb-1">Current Saved Location:</p>
                  <p>Latitude: {workLocation.latitude}</p>
                  <p>Longitude: {workLocation.longitude}</p>
                  <p>Radius: {workLocation.radius} meters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}