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
    <details className="relative">
      <summary
        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-cream-200 bg-white/75 text-thread-700 transition hover:border-thread-700/30 hover:bg-white"
        aria-label={messages.common.language}
        title={messages.common.language}
      >
        <span className="sr-only">{messages.common.language}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="12" cy="12" r="8.25" />
          <path d="M3.75 12h16.5" />
          <path d="M12 3.75c2.1 2.24 3.25 5.24 3.25 8.25S14.1 18.01 12 20.25C9.9 18.01 8.75 15.01 8.75 12S9.9 5.99 12 3.75z" />
        </svg>
      </summary>
      <div className="absolute right-0 top-12 z-20 min-w-32 rounded-[1.25rem] border border-cream-200 bg-white/95 p-2 shadow-soft">
        <div className="grid gap-1">
          {locales.map((option) => {
            const isActive = option === locale;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setLocale(option)}
                className={`rounded-full px-4 py-2 text-left text-sm transition ${
                  isActive
                    ? "bg-oat-100 font-medium text-thread-900"
                    : "text-thread-700 hover:bg-cream-50"
                }`}
              >
                {labels[option]}
              </button>
            );
          })}
        </div>
      </div>
    </details>
  );
}
