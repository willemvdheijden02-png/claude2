// Multi-currency helpers. Default EUR maar agency kan ook USD/GBP kiezen.

export const CURRENCIES = {
  EUR: { symbol: "€", code: "EUR", locale: "nl-NL" as const },
  USD: { symbol: "$", code: "USD", locale: "en-US" as const },
  GBP: { symbol: "£", code: "GBP", locale: "en-GB" as const },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatMoney(
  cents: number,
  currency: CurrencyCode = "EUR",
  options: { decimals?: number } = {}
): string {
  const cfg = CURRENCIES[currency];
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.code,
    minimumFractionDigits: options.decimals ?? 2,
    maximumFractionDigits: options.decimals ?? 2,
  }).format(cents / 100);
}

export function formatNumber(value: number, locale: "nl-NL" | "en-US" | "en-GB" = "nl-NL"): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function isValidCurrencyCode(code: string): code is CurrencyCode {
  return code in CURRENCIES;
}
