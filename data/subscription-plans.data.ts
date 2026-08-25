import type { SubscriptionPlan } from "@/interfaces/subscription-plan.interface";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    slug: "semanal",
    name: "Plan 365",
    price: 599,
    previousPrice: 799,
    discountPercent: 25,
    currency: "MXN",
    period: "mes",
    description: "Una clase por semana para entrenar con constancia, corregir errores y avanzar con un plan claro.",
    features: [
      "4 clases al mes de 60 minutos",
      "Plan de estudio semanal",
      "Análisis de tus partidas de torneo",
      "Seguimiento de progreso y metas",
      "Dudas por mensaje entre sesiones",
    ],
    ctaLabel: "Empieza el Plan 365",
  },
  {
    slug: "intensivo",
    name: "Plan 365+",
    price: 849,
    previousPrice: 1199,
    discountPercent: 29,
    currency: "MXN",
    period: "mes",
    description:
      "Dos clases por semana para avanzar al doble de ritmo, con seguimiento cercano y preparación de torneo.",
    features: [
      "4 clases al mes de 2 horas",
      "Plan de estudio semanal",
      "Análisis de tus partidas de torneo",
      "Seguimiento de progreso y metas",
      "Dudas por mensaje entre sesiones",
    ],
    ctaLabel: "Empieza el Plan 365+",
    featured: true,
  },
];
