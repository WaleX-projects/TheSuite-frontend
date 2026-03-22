import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/authApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Building2, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Profile</h1>
        <p className="page-subtitle">Your account details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-muted-foreground text-xs">First Name</Label><p className="font-medium">{user?.first_name}</p></div>
              <div><Label className="text-muted-foreground text-xs">Last Name</Label><p className="font-medium">{user?.last_name}</p></div>
            </div>
            <div><Label className="text-muted-foreground text-xs">Email</Label><p className="font-medium flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{user?.email}</p></div>
            <div><Label className="text-muted-foreground text-xs">Role</Label><p className="font-medium flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" />{user?.role}</p></div>
          </CardContent>
        </Card>

        {user?.company && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" /> Company
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div><Label className="text-muted-foreground text-xs">Name</Label><p className="font-medium">{user.company.name}</p></div>
              <div><Label className="text-muted-foreground text-xs">Industry</Label><p className="font-medium">{user.company.industry || "—"}</p></div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
