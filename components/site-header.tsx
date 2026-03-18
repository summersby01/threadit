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
                d="M6 10.5C8.2 8.7 11.2 8 14.6 8C17.2 8 19.1 8.46 20.8 9.12C22.45 9.76 24.08 10.08 26 9.15"
                stroke="#6F6257"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.7 9.35C15.5 12.55 15.5 15.8 15.72 19.05C15.87 21.33 15.65 23.12 14.95 24.58C14.42 25.69 13.64 26.57 12.55 27.35"
                stroke="#6F6257"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.55 8.12C15.32 8.84 15.88 9.22 16.88 9.56"
                stroke="#6F6257"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
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
