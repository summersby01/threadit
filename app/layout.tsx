import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/i18n-provider";
import { SiteHeader } from "@/components/site-header";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Threadit",
  description: "뜨개 패턴을 차분하게 정리하는 앱입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        suppressHydrationWarning
        className={`${sans.variable} ${serif.variable} font-sans`}
      >
        <I18nProvider>
          <div className="min-h-screen bg-soft-grid bg-[size:24px_24px]">
            <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-12 pt-5 sm:px-6 lg:px-8">
              <SiteHeader />
              <main className="flex-1 pt-8 sm:pt-10">{children}</main>
            </div>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
