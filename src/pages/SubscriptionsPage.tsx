import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Users, FileText, Calendar, Check } from "lucide-react";
import { toast } from "sonner";

import { subscriptionsApi } from "@/lib/subscriptionsApi";

interface Plan {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  price_per_employee: number;
  max_employees: number;
  description: string;
  is_popular: boolean;
  features: {
    attendance: boolean;
    leave: boolean;
    payroll: boolean;
  };
}

export default function SubscriptionsPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  // Fetch Plans
  const fetchPlans = async () => {
    try {
      const res = await subscriptionsApi.listPlans();
      setPlans(res.data.results || res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load subscription plans");
    }
  };

  // Optional: Fetch current subscription
  const fetchCurrentSubscription = async () => {
    try {
      const res = await subscriptionsApi.get();
      setCurrentSubscription(res.data);
    } catch (error) {
      // User might not have subscription yet - that's fine
      console.log("No active subscription found");
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const getPrice = (plan: Plan) => {
    const base = isYearly ? plan.base_price * 12 : plan.base_price;
    return `₦${base.toLocaleString()}`;
  };

  const getInterval = () => (isYearly ? "year" : "month");

  const handleSubscribe = async (plan: Plan) => {
    setLoading(plan.slug);

    try {
      await subscriptionsApi.upgrade({
        plan_id: plan.id,
        interval: getInterval(),
      });

      toast.success(`Successfully upgraded to ${plan.name}!`);
      // Refresh current subscription
      fetchCurrentSubscription();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Subscription failed");
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (planId: number) => currentSubscription?.plan === planId;

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Choose the perfect plan for your HR, Payroll & Attendance needs.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={!isYearly ? "font-medium" : "text-muted-foreground"}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={isYearly ? "font-medium" : "text-muted-foreground"}>
              Yearly <Badge variant="secondary">Save up to 10%</Badge>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const popular = plan.is_popular;
            const current = isCurrentPlan(plan.id);

            return (
              <Card
                key={plan.id}
                className={`relative transition-all ${
                  popular ? "border-primary shadow-xl scale-[1.02]" : ""
                } ${current ? "ring-2 ring-green-500" : ""}`}
              >
                {popular && (
                  <div className="absolute -top-3 right-6 bg-primary text-white text-xs px-4 py-1 rounded-full font-medium">
                    Most Popular
                  </div>
                )}

                {current && (
                  <div className="absolute -top-3 left-6 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                    Current Plan
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">
                    {plan.description}
                  </p>

                  <div className="mt-6">
                    <div className="text-4xl font-bold">
                      {getPrice(plan)}
                      <span className="text-base font-normal text-muted-foreground">
                        /{getInterval()}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Employee Limit */}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Up to {plan.max_employees} employees</span>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {Object.entries(plan.features).map(([key, enabled]) => {
                      if (!enabled) return null;
                      return (
                        <div key={key} className="flex items-center gap-3 text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="capitalize">{key}</span>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading === plan.slug || current}
                    className="w-full"
                    variant={popular ? "default" : "outline"}
                    size="lg"
                  >
                    {current
                      ? "Current Plan"
                      : loading === plan.slug
                      ? "Processing..."
                      : "Get Started"}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Cancel anytime • No hidden fees
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}