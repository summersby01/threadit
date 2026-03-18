import Link from "next/link";
import { PageCard } from "@/components/page-card";

const projects = [
  {
    id: 1,
    name: "Winter Cable Sweater",
    currentRow: 48,
    totalRows: 120,
  },
  {
    id: 2,
    name: "Moss Stitch Scarf",
    currentRow: 72,
    totalRows: 90,
  },
  {
    id: 3,
    name: "Cloud Beret",
    currentRow: 18,
    totalRows: 64,
  },
  {
    id: 4,
    name: "Weekend Socks",
    currentRow: 34,
    totalRows: 80,
  },
];

export default function HomePage() {
  return (
    <section className="space-y-8">
      <PageCard className="bg-white/90">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-thread-700/70">
              Home
            </p>
            <div className="space-y-2">
              <h1 className="font-serif text-4xl text-thread-900 sm:text-5xl">
                Your knitting projects
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-thread-700">
                A calm overview of active patterns and row progress. Data is
                mocked for now so the page can focus on layout and visual
                structure only.
              </p>
            </div>
          </div>
          <Link
            href="/create"
            className="inline-flex h-12 items-center justify-center rounded-full bg-thread-700 px-5 text-sm font-medium text-white hover:bg-thread-900"
          >
            Create Project
          </Link>
        </div>
      </PageCard>

      <div className="grid gap-5 lg:grid-cols-2">
        {projects.map((project) => {
          const progress = Math.round(
            (project.currentRow / project.totalRows) * 100,
          );

          return (
            <PageCard key={project.id} className="bg-white">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.25em] text-thread-700/55">
                    Active project
                  </p>
                  <h2 className="font-serif text-2xl text-thread-900">
                    {project.name}
                  </h2>
                </div>

                <div className="flex items-end justify-between gap-4 rounded-3xl bg-cream-50 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-thread-700/55">
                      Current progress
                    </p>
                    <p className="mt-2 text-lg font-medium text-thread-900">
                      {project.currentRow} / {project.totalRows} rows
                    </p>
                  </div>
                  <p className="text-3xl font-semibold text-thread-700">
                    {progress}%
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="h-3 rounded-full bg-cream-200">
                    <div
                      className="h-3 rounded-full bg-thread-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-thread-700">
                    {progress < 100
                      ? "Steady progress on this pattern."
                      : "Pattern complete."}
                  </p>
                </div>
              </div>
            </PageCard>
          );
        })}
      </div>
    </section>
  );
}
