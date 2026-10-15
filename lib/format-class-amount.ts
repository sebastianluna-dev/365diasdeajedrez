import type { CurrencyCode } from "@/constants/platform/currency-codes.const";

// What a class payment cost, written the one way: «$1,400.00 MXN», and
// «$350.00» per class. The amount travels as the string Prisma gives for a
// Decimal; the per-class figure is computed in whole cents, never in floats,
// so «$1,400.00 / 4» is exactly «$350.00».

/** «$1,400.00 MXN»; without the code, «$1,400.00». */
export function formatClassAmount(
  amount: string,
  currency: CurrencyCode,
  options: { withCode?: boolean } = {},
): string {
  const { withCode = true } = options;
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
  return withCode ? `${formatted} ${currency}` : formatted;
}

/** The amount as whole cents, read from its decimal string. */
export function amountToCents(amount: string): number {
  const [whole = "0", fraction = ""] = amount.trim().split(".");
  const cents = (fraction + "00").slice(0, 2);
  const sign = whole.startsWith("-") ? -1 : 1;
  return sign * (Math.abs(Number.parseInt(whole, 10) || 0) * 100 + Number.parseInt(cents, 10));
}

/** What each class of a payment cost, «$350.00», to the cent and rounded down. */
export function perClassAmount(amount: string, classCount: number, currency: CurrencyCode): string {
  const cents = classCount > 0 ? Math.floor(amountToCents(amount) / classCount) : 0;
  return formatClassAmount(`${Math.floor(cents / 100)}.${(cents % 100).toString().padStart(2, "0")}`, currency, {
    withCode: false,
  });
}
