import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Clock, DollarSign, Building2, Calendar, Settings, Bell, MapPin 
} from "lucide-react";

interface SettingsData {
  company_name: string;
  timezone: string;
  date_format: string;
  currency: string;
  work_hours_per_day: number;
  allow_late_arrival: boolean;
  late_arrival_grace_minutes: number;
  require_face_verification: boolean;
  geo_fencing_enabled: boolean;
  payroll_day: number;
  tax_rate: number;
  allow_manual_payslip: boolean;
  carry_forward_leave: boolean;
  max_carry_forward_days: number;
  leave_approval_required: boolean;
  email_notifications: boolean;
  slack_notifications: boolean;
  work_latitude?: number | null;
  work_longitude?: number | null;
  work_radius_meters?: number;
}

export default function SettingsPage() {
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

    carryForwardLeave: true,
    maxCarryForwardDays: 10,
    leaveApprovalRequired: true,

    emailNotifications: true,
    slackNotifications: false,
  });

  // Work Location State
  const [workLocation, setWorkLocation] = useState({
    latitude: "",
    longitude: "",
    radius: 100,
  });

  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/");
        if (!res.ok) throw new Error("Failed to fetch settings");
        
        const data: SettingsData = await res.json();

        setSettings({
          companyName: data.company_name || "HR Suite Connect",
          timezone: data.timezone || "Africa/Lagos",
          dateFormat: data.date_format || "DD/MM/YYYY",
          currency: data.currency || "NGN",

          workHoursPerDay: data.work_hours_per_day || 8,
          allowLateArrival: data.allow_late_arrival ?? true,
          lateArrivalGraceMinutes: data.late_arrival_grace_minutes || 15,
          requireFaceVerification: data.require_face_verification ?? true,
          geoFencingEnabled: data.geo_fencing_enabled ?? false,

          payrollDay: data.payroll_day || 25,
          taxRate: Number(data.tax_rate) || 7.5,
          allowManualPayslip: data.allow_manual_payslip ?? true,

          carryForwardLeave: data.carry_forward_leave ?? true,
          maxCarryForwardDays: data.max_carry_forward_days || 10,
          leaveApprovalRequired: data.leave_approval_required ?? true,

          emailNotifications: data.email_notifications ?? true,
          slackNotifications: data.slack_notifications ?? false,
        });

        // Load work location if available
        if (data.work_latitude && data.work_longitude) {
          setWorkLocation({
            latitude: data.work_latitude.toString(),
            longitude: data.work_longitude.toString(),
            radius: data.work_radius_meters || 100,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load system settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Get Current Location using Browser Geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser.");
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
      (error) => {
        console.error(error);
        toast.error("Unable to get location. Please allow location access.");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Save Work Location
  const saveWorkLocation = async () => {
    if (!workLocation.latitude || !workLocation.longitude) {
      return toast.error("Please provide both latitude and longitude");
    }

    setSavingSection("work-location");

    try {
      const payload = {
        work_latitude: parseFloat(workLocation.latitude),
        work_longitude: parseFloat(workLocation.longitude),
        work_radius_meters: workLocation.radius,
      };

      const res = await fetch("/api/settings/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save location");

      toast.success("Work location saved successfully! Ready for face attendance.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save work location");
    } finally {
      setSavingSection(null);
    }
  };

  const saveSettings = async (section: string) => {
    setSavingSection(section);

    try {
      const payload: Partial<SettingsData> = {
        company_name: settings.companyName,
        timezone: settings.timezone,
        date_format: settings.dateFormat,
        currency: settings.currency,
        work_hours_per_day: settings.workHoursPerDay,
        allow_late_arrival: settings.allowLateArrival,
        late_arrival_grace_minutes: settings.lateArrivalGraceMinutes,
        require_face_verification: settings.requireFaceVerification,
        geo_fencing_enabled: settings.geoFencingEnabled,
        payroll_day: settings.payrollDay,
        tax_rate: settings.taxRate,
        allow_manual_payslip: settings.allowManualPayslip,
        carry_forward_leave: settings.carryForwardLeave,
        max_carry_forward_days: settings.maxCarryForwardDays,
        leave_approval_required: settings.leaveApprovalRequired,
        email_notifications: settings.emailNotifications,
        slack_notifications: settings.slackNotifications,
      };

      const res = await fetch("/api/settings/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success(`${section} settings saved successfully`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to save ${section.toLowerCase()} settings`);
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        Loading system settings...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="h-9 w-9" /> System Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage global settings for Attendance, Payroll, Organization, Leave, and more.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="work-location">Work Location</TabsTrigger>
        </TabsList>

        {/* GENERAL SETTINGS */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Company & General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Company Name</Label>
                  <Input 
                    value={settings.companyName} 
                    onChange={(e) => updateSettings({ companyName: e.target.value })} 
                  />
                </div>
                <div>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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
                <div>
                  <Label>Currency</Label>
                  <Select value={settings.currency} onValueChange={(v) => updateSettings({ currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">₦ Naira (NGN)</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => saveSettings("General")} 
                disabled={savingSection === "General"}
              >
                {savingSection === "General" ? "Saving..." : "Save General Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ATTENDANCE SETTINGS - Keep your existing content */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Attendance Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Your existing attendance fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Standard Work Hours per Day</Label>
                  <Input 
                    type="number" 
                    value={settings.workHoursPerDay} 
                    onChange={(e) => updateSettings({ workHoursPerDay: parseInt(e.target.value) || 8 })} 
                  />
                </div>
                <div>
                  <Label>Late Arrival Grace Period (minutes)</Label>
                  <Input 
                    type="number" 
                    value={settings.lateArrivalGraceMinutes} 
                    onChange={(e) => updateSettings({ lateArrivalGraceMinutes: parseInt(e.target.value) || 15 })} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Late Arrivals</Label>
                  <p className="text-sm text-muted-foreground">Mark late instead of absent after grace period</p>
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
                </div>
                <Switch 
                  checked={settings.geoFencingEnabled} 
                  onCheckedChange={(checked) => updateSettings({ geoFencingEnabled: checked })} 
                />
              </div>

              <Button 
                onClick={() => saveSettings("Attendance")} 
                disabled={savingSection === "Attendance"}
              >
                {savingSection === "Attendance" ? "Saving..." : "Save Attendance Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYROLL, ORGANIZATION, LEAVE, NOTIFICATIONS tabs remain the same as your original code */}

        {/* WORK LOCATION TAB */}
        <TabsContent value="work-location">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> My Work Location (Geo-fencing)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Set your office or work location. This will be used during face attendance to verify you are within the allowed radius.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={workLocation.latitude}
                    onChange={(e) => setWorkLocation({ ...workLocation, latitude: e.target.value })}
                    placeholder="6.524379"
                  />
                </div>
                <div>
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

              <div>
                <Label>Allowed Radius (meters)</Label>
                <Input
                  type="number"
                  min={50}
                  max={500}
                  value={workLocation.radius}
                  onChange={(e) => setWorkLocation({ ...workLocation, radius: parseInt(e.target.value) || 100 })}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={getCurrentLocation} 
                  disabled={gettingLocation}
                  variant="outline"
                >
                  {gettingLocation ? "Getting Location..." : "📍 Get My Current Location"}
                </Button>

                <Button 
                  onClick={saveWorkLocation}
                  disabled={savingSection === "work-location" || !workLocation.latitude || !workLocation.longitude}
                >
                  {savingSection === "work-location" ? "Saving..." : "Save Work Location"}
                </Button>
              </div>

              {workLocation.latitude && workLocation.longitude && (
                <div className="p-4 bg-muted rounded-lg text-sm">
                  <p><strong>Saved Location:</strong></p>
                  <p>Lat: {workLocation.latitude} | Long: {workLocation.longitude}</p>
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