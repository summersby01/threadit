"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/i18n-provider";

export function SiteHeader() {
  const { messages } = useI18n();
  const pathname = usePathname();

  return (
    <header className="relative py-3">
      <div className="flex flex-col gap-4 border-b border-thread-700/20 pb-5">
        <div className="flex items-start justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-thread-700/20 bg-cream-50">
              <svg
                aria-hidden="true"
                viewBox="0 0 32 32"
                className="h-8 w-8"
                fill="none"
              >
                <path
                  d="M7 11.2C9.15 9.45 12.25 8.5 16.05 8.5C19.55 8.5 22.45 9.23 25.15 10.55"
                  stroke="#A6756A"
                  strokeWidth="2.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.65 8.7C16.2 12.45 16.15 16.35 16.45 20.25C16.63 22.52 16.15 24.43 15.02 26.12"
                  stroke="#73534C"
                  strokeWidth="2.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.25 8.55C15.2 9.55 16.18 10.2 17.62 10.75"
                  stroke="#A69CA4"
                  strokeWidth="2.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="font-serif text-3xl font-semibold leading-none tracking-tight text-thread-900 sm:text-[2.2rem]">
                {messages.common.appName}
              </p>
              <p className="text-[12px] uppercase tracking-[0.3em] text-thread-700">
                {messages.common.appSubtitle}
              </p>
            </div>
          </Link>

          <div className="relative shrink-0">
            <LanguageSwitcher />
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-full border px-4 py-2 text-sm transition ${
              pathname === "/"
                ? "border-thread-500 bg-oat-100/50 text-thread-900"
                : "border-cream-200 bg-cream-50 text-thread-700 hover:bg-oat-100/30"
            }`}
          >
            {messages.nav.home}
          </Link>
          <Link
            href="/library"
            className={`rounded-full border px-4 py-2 text-sm transition ${
              pathname?.startsWith("/library")
                ? "border-thread-500 bg-oat-100/50 text-thread-900"
                : "border-cream-200 bg-cream-50 text-thread-700 hover:bg-oat-100/30"
            }`}
          >
            {messages.nav.library}
          </Link>
          <Link
            href="/create"
            className={`rounded-full border px-4 py-2 text-sm transition ${
              pathname === "/create"
                ? "border-thread-500 bg-oat-100/50 text-thread-900"
                : "border-cream-200 bg-cream-50 text-thread-700 hover:bg-oat-100/30"
            }`}
          >
            {messages.nav.create}
          </Link>
        </nav>
      </div>
    </header>
  );
}
