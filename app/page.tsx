"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { PageCard } from "@/components/page-card";
import { usePatternRowsStore } from "@/stores/use-pattern-rows-store";

export default function HomePage() {
  const { messages } = useI18n();
  const projects = usePatternRowsStore((state) => state.projects);
  const selectProject = usePatternRowsStore((state) => state.selectProject);

  return (
    <section className="space-y-8 sm:space-y-10">
      <PageCard>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{messages.home.eyebrow}</p>
            <h1 className="max-w-3xl font-serif text-4xl leading-tight text-thread-900 sm:text-5xl">
              {messages.home.title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-thread-700">
              {messages.home.description}
            </p>
          </div>
          <Link
            href="/create"
            className="pill-button-accent h-12 self-start px-5 hover:bg-sand-100 sm:self-auto"
          >
            {messages.home.createProject}
          </Link>
        </div>
      </PageCard>

      {projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => {
            const totalSteps = project.rows.reduce(
              (sum, row) => sum + row.parsedSteps.length,
              0,
            );
            const safeCurrentRow =
              project.rows.length > 0
                ? Math.min(Math.max(project.currentRow, 0), project.rows.length - 1)
                : 0;
            const activeRow = project.rows[safeCurrentRow];
            const activeRowStepCount = activeRow?.parsedSteps.length ?? 0;
            const completedBeforeRow = project.rows
              .slice(0, safeCurrentRow)
              .reduce((sum, row) => sum + row.parsedSteps.length, 0);
            const completedSteps = project.isProjectComplete
              ? totalSteps
              : completedBeforeRow + project.currentStep;
            const progressPercent =
              totalSteps > 0
                ? Math.min(100, Math.max(0, Math.round((completedSteps / totalSteps) * 100)))
                : 0;
            const craftLabel =
              project.craftType === "crochet"
                ? messages.create.crochet
                : messages.create.knitting;
            const lineLabel =
              project.workMode === "round"
                ? messages.home.currentRoundLabel
                : messages.home.currentRowLabel;
            const lineValue =
              project.workMode === "round"
                ? messages.create.roundLabel.replace(
                    "{number}",
                    String(safeCurrentRow + 1).padStart(2, "0"),
                  )
                : messages.create.rowLabel.replace(
                    "{number}",
                    String(safeCurrentRow + 1).padStart(2, "0"),
                  );

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                onClick={() => selectProject(project.id)}
                className="group block rounded-[1.75rem] border border-cream-200 bg-surface px-5 py-5 transition hover:border-thread-700/20 hover:bg-white"
              >
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <span className="inline-flex rounded-full border border-cream-200 bg-white/70 px-3 py-1 text-xs text-thread-700">
                        {craftLabel}
                      </span>
                      <h2 className="font-serif text-[2rem] leading-none text-thread-900">
                        {project.name}
                      </h2>
                    </div>
                    <span className="text-sm text-thread-700">
                      {progressPercent}%
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-cream-200 bg-white/60 px-4 py-4">
                      <p className="eyebrow">{lineLabel}</p>
                      <p className="mt-3 text-sm font-medium text-thread-900">
                        {lineValue}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-cream-200 bg-white/60 px-4 py-4">
                      <p className="eyebrow">{messages.home.progressLabel}</p>
                      <p className="mt-3 text-sm font-medium text-thread-900">
                        {completedSteps} / {totalSteps}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="h-2 rounded-full bg-cream-200/80">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: "#D8B7AE",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-thread-700">
                      <span>
                        {messages.home.activeLineSteps}: {activeRowStepCount}
                      </span>
                      <span className="transition group-hover:text-thread-900">
                        {messages.home.continueProject}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <PageCard>
          <div className="rounded-[1.75rem] border border-cream-200 bg-white/60 px-5 py-8 text-center">
            <p className="font-serif text-3xl text-thread-900">
              {messages.home.emptyProjectsTitle}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-thread-700">
              {messages.home.emptyProjectsDescription}
            </p>
            <div className="mt-6">
              <Link
                href="/create"
                className="pill-button-accent h-12 px-5 hover:bg-sand-100"
              >
                {messages.home.createProject}
              </Link>
            </div>
          </div>
        </PageCard>
      )}
    </section>
  );
}
