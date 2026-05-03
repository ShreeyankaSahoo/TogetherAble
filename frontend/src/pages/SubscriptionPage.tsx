import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Basic profile creation",
      "Browse profiles nearby",
      "5 likes per day",
      "Community forum access",
      "Standard filters",
    ],
    cta: "Get Started",
    variant: "outline" as const,
  },
  {
    name: "Premium",
    price: "$2",
    period: "/month",
    popular: true,
    features: [
      "Unlimited likes & matches",
      "AI Compatibility Index",
      "Advanced filters",
      "Priority in search results",
      "Voice & video chat",
      "Create group forums",
      "Read receipts",
    ],
    cta: "Go Premium",
    variant: "hero" as const,
  },
  {
    name: "Premium+",
    price: "$10",
    period: "/month",
    features: [
      "Everything in Premium",
      "Dedicated support advisor",
      "Profile boost weekly",
      "Exclusive forums",
      "Incognito mode",
      "Accessibility coaching",
      "Priority support",
    ],
    cta: "Go Premium+",
    variant: "premium" as const,
  },
];

const SubscriptionPage = () => (
  <div className="min-h-screen py-10">
    <div className="container max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold">Choose Your <span className="text-gradient-primary">Plan</span></h1>
        <p className="mt-2 text-muted-foreground">Unlock premium features for a better matching experience.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-card rounded-2xl shadow-card p-6 flex flex-col relative ${
              plan.popular ? "ring-2 ring-primary" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> Most Popular
              </div>
            )}
            <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
            <div className="mt-3">
              <span className="text-3xl font-heading font-extrabold">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>
            <ul className="mt-6 space-y-3 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button variant={plan.variant} className="mt-6 w-full" size="lg">
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SubscriptionPage;
