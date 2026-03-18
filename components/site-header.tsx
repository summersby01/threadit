import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create" },
  { href: "/tracker", label: "Tracker" },
];

export function SiteHeader() {
  return (
    <header className="soft-panel sticky top-4 z-10 px-5 py-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-thread-700 text-lg text-white">
            T
          </div>
          <div>
            <p className="font-serif text-3xl leading-none text-thread-900">
              Threadit
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-thread-700/60">
              Knitting Pattern Tracker
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-thread-700/10 bg-cream-50 px-4 py-2 text-sm font-medium text-thread-900 hover:border-thread-700/30"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
