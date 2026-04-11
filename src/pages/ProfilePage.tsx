import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/authApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Edit3,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth(); // Make sure your AuthContext has refreshUser

  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
  });

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!form.first_name || !form.last_name) {
      toast.error("First name and last name are required");
      return;
    }

    setLoading(true);

    try {
      await authApi.updateProfile(form);
      toast.success("Profile updated successfully!");
      setEditOpen(false);
      await refreshUser(); // Refresh user data from context
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const initials = `\( {user?.first_name?.[0] || ""} \){user?.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>

            <div className="space-y-5 pt-4">
              <div className="grid grid-cols-2 gap-4">
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
                <Label>Email Address</Label>
                <Input value={user?.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234 801 234 5678"
                />
              </div>

              <div>
                <Label>Bio / About</Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell us a little about yourself..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleUpdateProfile}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* AVATAR CARD */}
        <Card className="md:col-span-2">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center">
            <Avatar className="h-28 w-28 mb-6">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-2xl font-semibold">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-muted-foreground mt-1">{user?.email}</p>

            <div className="mt-6 flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              <span className="capitalize font-medium">
                {user?.role === "company_admin" ? "Company Admin" : user?.role || "Staff"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* DETAILS */}
        <div className="md:col-span-3 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-xs text-muted-foreground">First Name</Label>
                  <p className="font-medium mt-1">{user?.first_name || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Name</Label>
                  <p className="font-medium mt-1">{user?.last_name || "—"}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Email Address</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {user?.email}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Phone Number</Label>
                <p className="font-medium mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {user?.phone || "Not provided"}
                </p>
              </div>

              {user?.bio && (
                <div>
                  <Label className="text-xs text-muted-foreground">Bio</Label>
                  <p className="mt-1 text-sm leading-relaxed">{user.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Information */}
          {user?.company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Company Name</Label>
                  <p className="font-medium mt-1">{user.company.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Industry</Label>
                  <p className="font-medium mt-1">{user.company.industry || "—"}</p>
                </div>
                {user.company.address && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Address</Label>
                    <p className="font-medium mt-1">{user.company.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}