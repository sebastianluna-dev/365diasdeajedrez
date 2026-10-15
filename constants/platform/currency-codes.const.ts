// Stable codes of the `Currency` catalog: what a class payment is charged in.

export const CURRENCY = {
  MXN: "MXN",
  USD: "USD",
  EUR: "EUR",
} as const;

export type CurrencyCode = (typeof CURRENCY)[keyof typeof CURRENCY];
