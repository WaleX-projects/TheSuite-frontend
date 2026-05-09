import { useEffect, useState, useCallback } from "react";
import { leaveApi } from "@/lib/leaveApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Switch } from "@/components/ui/switch";

import {
  ShieldCheck,
  Loader2,
  Save,
  Settings,
} from "lucide-react";

import { toast } from "sonner";

type LeavePolicy = {
  id?: string;
  company: string;
  weekends_count_as_leave: boolean;
  allow_half_day: boolean;
  max_consecutive_days: number;
  require_attachment_for_sick_leave: boolean;
  created_at?: string;
};

export default function LeavePolicyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [policy, setPolicy] = useState<LeavePolicy>({
    company: "",
    weekends_count_as_leave: false,
    allow_half_day: true,
    max_consecutive_days: 30,
    require_attachment_for_sick_leave: false,
  });

  const fetchPolicy = useCallback(async () => {
    setLoading(true);

    try {
      const res = await leaveApi.getPolicy();

      const data =
        res.data?.results?.[0] ||
        res.data ||
        {};

      setPolicy({
        id: data.id,
        company: data.company || "",
        weekends_count_as_leave:
          data.weekends_count_as_leave ?? false,
        allow_half_day:
          data.allow_half_day ?? true,
        max_consecutive_days:
          data.max_consecutive_days ?? 30,
        require_attachment_for_sick_leave:
          data.require_attachment_for_sick_leave ?? false,
        created_at: data.created_at,
      });
    } catch (error) {
      toast.error("Failed to load leave policy");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  const handleSave = async () => {
    setSaving(true);

    try {
      if (policy.id) {
        await leaveApi.updatePolicy(
          policy.id,
          policy
        );
      } else {
        await leaveApi.createPolicy(policy);
      }

      toast.success(
        "Leave policy saved successfully"
      );

      fetchPolicy();
    } catch (error) {
      toast.error(
        "Failed to save leave policy"
      );
    } finally {
      setSaving(false);
    }
  };

  const updateField = (
    key: keyof LeavePolicy,
    value: any
  ) => {
    setPolicy((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Settings className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            Leave Policies
          </h1>

          <p className="text-sm text-muted-foreground">
            Configure company leave rules
            and restrictions
          </p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-20 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Policy Settings
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Weekends */}
              <div className="flex items-center justify-between gap-6 border-b pb-4">
                <div>
                  <Label>
                    Count Weekends as Leave
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    Saturdays and Sundays
                    reduce leave balance
                  </p>
                </div>

                <Switch
                  checked={
                    policy.weekends_count_as_leave
                  }
                  onCheckedChange={(val) =>
                    updateField(
                      "weekends_count_as_leave",
                      val
                    )
                  }
                />
              </div>

              {/* Half Day */}
              <div className="flex items-center justify-between gap-6 border-b pb-4">
                <div>
                  <Label>
                    Allow Half-Day Leave
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    Employees can request
                    half-day leave
                  </p>
                </div>

                <Switch
                  checked={policy.allow_half_day}
                  onCheckedChange={(val) =>
                    updateField(
                      "allow_half_day",
                      val
                    )
                  }
                />
              </div>

              {/* Max Days */}
              <div className="space-y-2 border-b pb-4">
                <Label>
                  Maximum Consesecutive
                  Leave Days
                </Label>

                <Input
                  type="number"
                  min={1}
                  value={
                    policy.max_consecutive_days
                  }
                  onChange={(e) =>
                    updateField(
                      "max_consecutive_days",
                      Number(
                        e.target.value
                      )
                    )
                  }
                />

                <p className="text-sm text-muted-foreground">
                  Limit number of days in a
                  single request
                </p>
              </div>

              {/* Sick Leave Attachment */}
              <div className="flex items-center justify-between gap-6">
                <div>
                  <Label>
                    Require Sick Leave
                    Attachment
                  </Label>

                  <p className="text-sm text-muted-foreground">
                    Medical report required
                    for sick leave requests
                  </p>
                </div>

                <Switch
                  checked={
                    policy.require_attachment_for_sick_leave
                  }
                  onCheckedChange={(val) =>
                    updateField(
                      "require_attachment_for_sick_leave",
                      val
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>
                Current Policy Summary
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Weekends Count as Leave
                </p>
                <p className="font-semibold mt-1">
                  {policy.weekends_count_as_leave
                    ? "Yes"
                    : "No"}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Half-Day Leave
                </p>
                <p className="font-semibold mt-1">
                  {policy.allow_half_day
                    ? "Allowed"
                    : "Disabled"}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Max Consecutive Days
                </p>
                <p className="font-semibold mt-1">
                  {
                    policy.max_consecutive_days
                  }{" "}
                  days
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">
                  Sick Leave Attachment
                </p>
                <p className="font-semibold mt-1">
                  {policy.require_attachment_for_sick_leave
                    ? "Required"
                    : "Not Required"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-[180px]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Policy
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}