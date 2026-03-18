"use client";

import { useI18n } from "@/components/i18n-provider";
import { locales, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, messages, setLocale } = useI18n();

  const labels: Record<Locale, string> = {
    ko: messages.common.korean,
    en: messages.common.english,
  };

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{messages.common.language}</span>
      {locales.map((option) => {
        const isActive = option === locale;

        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition ${
              isActive
                ? "border border-transparent bg-oat-100 text-thread-900"
                : "border border-cream-200 bg-cream-50 text-thread-700"
            }`}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}
