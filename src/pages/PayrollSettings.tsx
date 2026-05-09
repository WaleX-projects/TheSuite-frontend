import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type PayrollSettings = {
  payFrequency: "monthly" | "weekly" | "biweekly";
  taxRate: number;
  pensionRate: number;
  overtimeRate: number;
  currency: string;

  allowNegativePayroll: boolean;
  autoApprovePayroll: boolean;
  includeWeekendInAttendance: boolean;

  latePenaltyPerHour: number;
};

export default function PayrollSettingsPage() {
  const [settings, setSettings] = useState<PayrollSettings>({
    payFrequency: "monthly",
    taxRate: 10,
    pensionRate: 5,
    overtimeRate: 1.5,
    currency: "NGN",

    allowNegativePayroll: false,
    autoApprovePayroll: false,
    includeWeekendInAttendance: false,

    latePenaltyPerHour: 1000,
  });

  const update = (key: keyof PayrollSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="p-6 grid gap-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Payroll Settings</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pay Frequency</Label>
            <select
              className="w-full border rounded p-2"
              value={settings.payFrequency}
              onChange={(e) => update("payFrequency", e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Input
              value={settings.currency}
              onChange={(e) => update("currency", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Rates & Calculations</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              value={settings.taxRate}
              onChange={(e) => update("taxRate", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Pension Rate (%)</Label>
            <Input
              type="number"
              value={settings.pensionRate}
              onChange={(e) => update("pensionRate", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Overtime Multiplier</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.overtimeRate}
              onChange={(e) => update("overtimeRate", Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Late Penalty Per Hour</Label>
            <Input
              type="number"
              value={settings.latePenaltyPerHour}
              onChange={(e) =>
                update("latePenaltyPerHour", Number(e.target.value))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Rules</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Auto Approve Payroll</Label>
            <Switch
              checked={settings.autoApprovePayroll}
              onCheckedChange={(v) => update("autoApprovePayroll", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Allow Negative Payroll</Label>
            <Switch
              checked={settings.allowNegativePayroll}
              onCheckedChange={(v) => update("allowNegativePayroll", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Include Weekend in Attendance</Label>
            <Switch
              checked={settings.includeWeekendInAttendance}
              onCheckedChange={(v) =>
                update("includeWeekendInAttendance", v)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        onClick={() => console.log(settings)}
        className="w-full"
      >
        Save Payroll Settings
      </Button>
    </div>
  );
}