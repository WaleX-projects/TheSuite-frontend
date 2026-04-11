import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Users, FileText, Calendar, BarChart3, Shield, Award } from "lucide-react";
import { toast } from "sonner";
//import { usePaystackPayment } from "react-paystack"; // npm install react-paystack

// ================= PLAN DATA (You can also fetch from backend) =================
const basePlans = [
  {
    id: 1,
    name: "Starter",
    slug: "starter",
    monthlyPrice: 10000,
    yearlyPrice: 108000, // 10% discount example
    description: "Perfect for small teams getting started",
    employeeLimit: 5,
    features: [
      { icon: Users, text: "Up to 5 employees" },
      { icon: FileText, text: "Basic payroll processing" },
      { icon: Calendar, text: "Simple attendance tracking" },
      { icon: FileText, text: "Generate payslips" },
    ],
    popular: false,
    cta: "Get Started",
  },
  {
    id: 2,
    name: "Growth",
    slug: "growth",
    monthlyPrice: 25000,
    yearlyPrice: 270000, // \~10% discount
    description: "Best for growing companies",
    employeeLimit: 25,
    features: [
      { icon: Users, text: "Up to 25 employees" },
      { icon: FileText, text: "Tax & pension calculations" },
      { icon: Calendar, text: "Advanced attendance + geofencing" },
      { icon: FileText, text: "PDF payslips & bulk export" },
      { icon: BarChart3, text: "Basic reports & analytics" },
      { icon: Calendar, text: "Leave management" },
    ],
    popular: true,
    cta: "Most Popular",
  },
  {
    id: 3,
    name: "Business",
    slug: "business",
    monthlyPrice: 60000,
    yearlyPrice: 648000,
    description: "For established businesses",
    employeeLimit: 100,
    features: [
      { icon: Users, text: "Up to 100 employees" },
      { icon: FileText, text: "Advanced payroll with compliance" },
      { icon: Calendar, text: "Full attendance suite" },
      { icon: BarChart3, text: "Advanced reports & audit logs" },
      { icon: Shield, text: "Role-based permissions" },
      { icon: Award, text: "Priority support & integrations" },
    ],
    popular: false,
    cta: "Go Business",
  },
];

interface Plan {
  id: number;
  name: string;
  slug: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  employeeLimit: number;
  features: Array<{ icon: any; text: string }>;
  popular: boolean;
  cta: string;
}

export default function SubscriptionsPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>(basePlans);

  // Optional: Fetch plans from your Django backend
  // useEffect(() => { fetch('/api/subscriptions/plans/').then... }, []);

  const getPrice = (plan: Plan) => {
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    return `₦${price.toLocaleString()}`;
  };

  const getInterval = () => (isYearly ? "year" : "month");

  // Paystack config (replace with your actual public key)
  const paystackPublicKey = '';
  // process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxx";

  const handleSubscribe = async (plan: Plan) => {
    setLoading(plan.slug);

    try {
      // 1. Call your Django backend to initialize subscription
      const response = await fetch("/api/subscriptions/initialize/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_slug: plan.slug,
          interval: getInterval(),
          // You can pass company_id if needed
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to initialize payment");

      // 2. If backend returns authorization URL or reference, open Paystack
      const config = {
        reference: data.reference || new Date().getTime().toString(),
        email: "user@example.com", // Replace with logged-in user email
        amount: isYearly ? plan.yearlyPrice * 100 : plan.monthlyPrice * 100, // Paystack uses kobo
        publicKey: paystackPublicKey,
        metadata: {
          plan_slug: plan.slug,
          interval: getInterval(),
          subscription_id: data.subscription_id, // from backend
        },
        onSuccess: (reference: any) => {
          toast.success(`Payment successful! Subscribed to ${plan.name}`);
          // Optionally call backend to verify payment
          // verifyPayment(reference);
        },
        onClose: () => toast.info("Payment cancelled"),
      };

      //const initializePayment = usePaystackPayment(config);
    //  initializePayment();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Choose the plan that fits your HR, Payroll & Attendance needs. Scale as your team grows.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm font-medium flex items-center gap-1 ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
              <Badge variant="secondary" className="text-xs">Save up to 10%</Badge>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-2xl ${
                plan.popular ? "border-primary scale-[1.02] shadow-xl" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-medium px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>

                <div className="mt-6">
                  <span className="text-4xl font-bold">{getPrice(plan)}</span>
                  <span className="text-muted-foreground"> /{getInterval()}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <feature.icon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.slug}
                  size="lg"
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {loading === plan.slug ? "Processing..." : plan.cta}
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-4">
                  No hidden fees • Cancel anytime
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Secure payments powered by Paystack • 14-day free trial on all plans • Cancel anytime</p>
          <p className="mt-2">Questions? Contact our support team</p>
        </div>
      </div>
    </div>
  );
}