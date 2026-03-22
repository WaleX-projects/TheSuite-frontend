import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/lib/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", password: "", confirm_password: "",
    company_name: "", company_address: "", industry: "", country: "", timezone: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        email: form.email, password: form.password,
        first_name: form.first_name, last_name: form.last_name, phone: form.phone,
        company_data: {
          name: form.company_name, address: form.company_address,
          industry: form.industry || undefined, country: form.country, timezone: form.timezone,
        },
      });
      toast.success("Registration successful! Check your email to verify.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Briefcase className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Step {step} of 2 — {step === 1 ? "Personal Info" : "Company Info"}</CardDescription>
          <div className="flex gap-2 justify-center">
            <div className={`h-1.5 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1.5 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={form.first_name} onChange={set("first_name")} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={form.last_name} onChange={set("last_name")} required />
                  </div>
                </div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={set("email")} required /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={set("phone")} required /></div>
                <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={set("password")} required /></div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={form.confirm_password} onChange={set("confirm_password")} required /></div>
                <Button type="button" className="w-full" onClick={() => setStep(2)}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2"><Label>Company Name</Label><Input value={form.company_name} onChange={set("company_name")} required /></div>
                <div className="space-y-2"><Label>Address</Label><Input value={form.company_address} onChange={set("company_address")} required /></div>
                <div className="space-y-2"><Label>Industry (optional)</Label><Input value={form.industry} onChange={set("industry")} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={set("country")} required /></div>
                  <div className="space-y-2"><Label>Timezone</Label><Input value={form.timezone} onChange={set("timezone")} placeholder="UTC" required /></div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Creating..." : "Register"}
                  </Button>
                </div>
              </>
            )}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
