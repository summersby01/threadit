import en from "@/messages/en";
import ko from "@/messages/ko";
import type { Messages } from "@/messages/types";

export const locales = ["ko", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ko";

export const messages: Record<Locale, Messages> = {
  ko,
  en,
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function formatMessage(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}
