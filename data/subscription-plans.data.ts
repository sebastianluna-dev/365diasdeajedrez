import type { SubscriptionPlan } from "@/interfaces/subscription-plan.interface";

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    slug: "semanal",
    name: "Plan Semanal",
    price: 599,
    previousPrice: 799,
    discountPercent: 25,
    currency: "MXN",
    period: "mes",
    description: "Una clase por semana para entrenar con constancia, corregir errores y avanzar con un plan claro.",
    features: [
      "4 clases al mes (1 por semana)",
      "Sesiones personalizadas de 75 minutos",
      "Plan de estudio semanal",
      "Análisis de tus partidas de torneo",
      "Seguimiento de progreso y metas",
      "Dudas por mensaje entre sesiones",
    ],
    ctaLabel: "Empieza el Plan Semanal",
  },
  {
    slug: "intensivo",
    name: "Plan Intensivo",
    price: 849,
    previousPrice: 1199,
    discountPercent: 29,
    currency: "MXN",
    period: "mes",
    description:
      "Dos clases por semana para avanzar al doble de ritmo, con seguimiento cercano y preparación de torneo.",
    features: [
      "8 clases al mes (2 por semana)",
      "Sesiones personalizadas de 75 minutos",
      "Plan de estudio semanal",
      "Análisis de tus partidas de torneo",
      "Seguimiento de progreso y metas",
      "Dudas por mensaje entre sesiones",
    ],
    ctaLabel: "Empieza el Plan Intensivo",
    featured: true,
  },
];
