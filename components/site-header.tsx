"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/i18n-provider";

export function SiteHeader() {
  const { messages } = useI18n();

  return (
    <header className="relative py-2">
      <div className="flex items-start justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-200 bg-oat-100">
            <svg
              aria-hidden="true"
              viewBox="0 0 32 32"
              className="h-7 w-7"
              fill="none"
            >
              <path
                d="M7 11.2C9.15 9.45 12.25 8.5 16.05 8.5C19.55 8.5 22.45 9.23 25.15 10.55"
                stroke="#6D5A4E"
                strokeWidth="2.15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.65 8.7C16.2 12.45 16.15 16.35 16.45 20.25C16.63 22.52 16.15 24.43 15.02 26.12"
                stroke="#6D5A4E"
                strokeWidth="2.15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.25 8.55C15.2 9.55 16.18 10.2 17.62 10.75"
                stroke="#6D5A4E"
                strokeWidth="2.15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.2 11.1C6.2 11.68 5.42 12.48 4.9 13.45"
                stroke="#BFAE9F"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="font-serif text-2xl font-semibold leading-none tracking-tight text-thread-900 sm:text-3xl">
              {messages.common.appName}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-thread-700">
              {messages.common.appSubtitle}
            </p>
          </div>
        </Link>

        <div className="relative shrink-0">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
