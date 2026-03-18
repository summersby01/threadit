"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/i18n-provider";

export function SiteHeader() {
  const { messages } = useI18n();

  return (
    <header className="soft-panel sticky top-4 z-10 px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-200 bg-oat-100 text-sm font-medium text-thread-900">
            TH
          </div>
          <div>
            <p className="font-serif text-3xl leading-none text-thread-900">
              {messages.common.appName}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-thread-700">
              {messages.common.appSubtitle}
            </p>
          </div>
        </Link>

        <div className="sm:self-start">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
