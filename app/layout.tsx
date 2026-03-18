import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
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
  description: "A knitting pattern tracker app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} font-sans`}>
        <div className="min-h-screen bg-soft-grid bg-[size:22px_22px]">
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <SiteHeader />
            <main className="flex-1 pt-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
