export interface SubscriptionPlan {
  slug: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  ctaLabel: string;
  featured?: boolean;
}
