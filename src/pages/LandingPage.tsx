import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, Clock, CalendarOff, DollarSign, Bot, Bell, Briefcase,
  Check, Minus, TrendingUp, ArrowRight,
} from "lucide-react";

/* Put the 5 images in /public/screens/ → dashboard.png, attendance.png, leave.png, payroll.png, employee.png */
const tabs = [
  { id: "dashboard", label: "Dashboard", src: "/screens/dashboard.png", title: "Everything at a glance", desc: "Headcount, attendance, active leaves and payroll in one live view." },
  { id: "attendance", label: "Attendance", src: "/screens/attendance.png", title: "Real-time attendance", desc: "See who is present, late or absent today, filter by date and export to CSV." },
  { id: "leave", label: "Leave", src: "/screens/leave.png", title: "Leave without the back-and-forth", desc: "Requests, approvals, balances and policies handled in one place." },
  { id: "payroll", label: "Payroll", src: "/screens/payroll.png", title: "Run payroll in minutes", desc: "Allowances, deductions and custom pay per employee, with full history." },
  { id: "employee", label: "Employees", src: "/screens/employee.png", title: "Complete employee profiles", desc: "Personal, bank and employment details with attendance, leave and payslips." },
];

const features = [
  { icon: Users, title: "Team Management", desc: "Profiles, departments, bank details and employment history in one secure place.", color: "text-blue-600", bg: "bg-blue-100" },
  { icon: Clock, title: "Attendance Tracking", desc: "Clock in and out, late and absent tracking, holidays and CSV export.", color: "text-green-600", bg: "bg-green-100" },
  { icon: CalendarOff, title: "Leave Management", desc: "Apply, approve and track balances with custom leave policies.", color: "text-orange-600", bg: "bg-orange-100" },
  { icon: DollarSign, title: "Salary & Payroll", desc: "Run payroll with pay items, deductions and per-employee pay.", color: "text-emerald-600", bg: "bg-emerald-100" },
  { icon: Bot, title: "AI Helper", desc: "Ask in plain English and get instant answers from your HR data.", color: "text-purple-600", bg: "bg-purple-100" },
  { icon: Bell, title: "Alerts", desc: "Pending approvals, late arrivals and payroll deadlines, never missed.", color: "text-red-600", bg: "bg-red-100" },
];

const plans = [
  { slug: "starter", name: "Starter", tagline: "For small teams getting organised.", base: "₦15,000", per: "₦500", max: 25, popular: false,
    features: [["Employee records", true], ["Attendance tracking", true], ["Leave management", false], ["Payroll & payslips", false]] },
  { slug: "growth", name: "Growth", tagline: "For teams that need leave tracking.", base: "₦40,000", per: "₦800", max: 100, popular: true,
    features: [["Employee records", true], ["Attendance tracking", true], ["Leave management", true], ["Payroll & payslips", false]] },
  { slug: "business", name: "Business", tagline: "The complete HR suite with payroll.", base: "₦100,000", per: "₦1,200", max: 500, popular: false,
    features: [["Employee records", true], ["Attendance tracking", true], ["Leave management", true], ["Payroll & payslips", true]] },
] as const;

const kpis = [
  { label: "Total Employees", value: "128", icon: Users, color: "text-blue-600", bg: "bg-blue-100", trend: "+12 this month" },
  { label: "Present Today", value: "117", icon: Clock, color: "text-green-600", bg: "bg-green-100", trend: "91% attendance rate" },
  { label: "Active Leaves", value: "9", icon: CalendarOff, color: "text-orange-600", bg: "bg-orange-100", trend: "Today" },
  { label: "Total Payroll", value: "₦14.2M", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100", trend: "This month" },
];

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5 text-xl font-bold">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <Briefcase className="h-5 w-5 text-primary-foreground" />
      </span>
      The Suit
    </a>
  );
}

function Frame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/15">
      <img src={src} alt={alt} className="block w-full" loading="lazy" />
    </div>
  );
}

export default function LandingPage() {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((t) => t.id === active)!;
const { user, loading } = useAuth();
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="hidden gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#showcase" className="hover:text-primary">Product</a>
            <a href="#features" className="hover:text-primary">Features</a>
            <a href="#pricing" className="hover:text-primary">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm"><a href="/dashboard">Dashboard</a></Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm"><a href="/login">Log in</a></Button>
                <Button asChild size="sm"><a href="/signup">Get started</a></Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur md:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm"><a href="/login">Log in</a></Button>
            <Button asChild size="sm"><a href="/login">Get started</a></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-6 pb-16 pt-20 text-center">
        <div className="mx-auto max-w-6xl space-y-6">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            HR, attendance, leave and payroll in <span className="text-primary">one place</span>
          </h1>
          <p className="mx-auto max-w-xl text-xl text-muted-foreground">
            Manage your whole team from one dashboard and pay people accurately, on time.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><a href="/login">Start free trial <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
            <Button asChild size="lg" variant="outline"><a href="#showcase">See the product</a></Button>
          </div>
          <div className="mx-auto max-w-5xl pt-10">
            <Frame src="/screens/dashboard.png" alt="The Suit dashboard" />
          </div>
        </div>
      </header>

      {/* KPI strip (same card style as the dashboard) */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((s) => (
            <Card key={s.label} className="overflow-hidden border-0 shadow-sm transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                    <p className="text-4xl font-semibold tracking-tight">{s.value}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" /> {s.trend}
                    </p>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${s.bg}`}>
                    <s.icon className={`h-7 w-7 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Product showcase with real screenshots */}
      <section id="showcase" className="border-y bg-background px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">See it in action</h2>
            <p className="mt-3 text-lg text-muted-foreground">Real screens from the app, not mockups.</p>
          </div>
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {tabs.map((t) => (
              <Button key={t.id} size="sm" variant={t.id === active ? "default" : "outline"} onClick={() => setActive(t.id)}>
                {t.label}
              </Button>
            ))}
          </div>
          <div className="mx-auto max-w-5xl">
            <Frame src={current.src} alt={current.title} />
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold">{current.title}</h3>
              <p className="mt-1 text-muted-foreground">{current.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything your team needs</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="border-0 shadow-sm transition-all hover:shadow-md">
              <CardContent className="flex items-start gap-4 p-6">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${f.bg}`}>
                  <f.icon className={`h-7 w-7 ${f.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t bg-background px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing</h2>
            <p className="mt-3 text-lg text-muted-foreground">A base fee plus a small amount per employee. Billed monthly in naira.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.slug} className={`relative flex flex-col shadow-sm ${p.popular ? "border-2 border-primary shadow-xl shadow-primary/15" : ""}`}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground">
                    Most popular
                  </span>
                )}
                <CardContent className="flex flex-1 flex-col p-7">
                  <h3 className="text-xl font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.tagline}</p>
                  <p className="mt-4 text-4xl font-semibold tracking-tight">
                    {p.base}<span className="text-base font-medium text-muted-foreground">/mo</span>
                  </p>
                  <p className="text-sm text-muted-foreground">+ {p.per} per employee · up to {p.max}</p>
                  <ul className="my-6 flex-1 space-y-3 text-sm">
                    {p.features.map(([label, on]) => (
                      <li key={label} className={`flex items-center gap-2.5 ${on ? "" : "text-muted-foreground/60"}`}>
                        {on ? <Check className="h-4 w-4 text-green-600" /> : <Minus className="h-4 w-4" />}
                        {label}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant={p.popular ? "default" : "outline"} className="w-full">
                    <a href={`/signup?plan=${p.slug}`}>Choose {p.name}</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to simplify HR?</h2>
          <p className="mb-7 mt-3 text-lg opacity-90">Set up in minutes. No credit card required.</p>
          <Button asChild size="lg" variant="secondary"><a href="/signup">Start your free trial <ArrowRight className="ml-2 h-4 w-4" /></a></Button>
        </div>
      </section>

      <footer className="border-t bg-background px-6 py-10 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5">
          <Logo />
          <div className="flex gap-6">
            <a href="#features" className="hover:text-primary">Features</a>
            <a href="#pricing" className="hover:text-primary">Pricing</a>
            <a href="/login" className="hover:text-primary">Log in</a>
          </div>
          <span>© {new Date().getFullYear()} The Suit</span>
        </div>
      </footer>
    </div>
  );
}