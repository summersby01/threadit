"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { PageCard } from "@/components/page-card";
import { usePatternRowsStore } from "@/stores/use-pattern-rows-store";

export default function HomePage() {
  const { messages } = useI18n();
  const router = useRouter();
  const projects = usePatternRowsStore((state) => state.projects);
  const selectProject = usePatternRowsStore((state) => state.selectProject);
  const duplicateProject = usePatternRowsStore((state) => state.duplicateProject);

  const activeProjects = projects.filter((project) => !project.isProjectComplete);
  const completedProjects = projects.filter((project) => project.isProjectComplete);

  function openProject(id: string) {
    selectProject(id);
    router.push(`/projects/${id}`);
  }

  function handleDuplicateProject(id: string) {
    const nextId = duplicateProject(id);

    if (nextId) {
      router.push(`/projects/${nextId}`);
    }
  }

  function renderProjectCard(project: (typeof projects)[number], isCompleted: boolean) {
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
      project.structureType === "round"
        ? messages.home.currentRoundLabel
        : messages.home.currentRowLabel;
    const lineValue =
      project.structureType === "round"
        ? messages.create.roundLabel.replace(
            "{number}",
            String(safeCurrentRow + 1).padStart(2, "0"),
          )
        : messages.create.rowLabel.replace(
            "{number}",
            String(safeCurrentRow + 1).padStart(2, "0"),
          );

    return (
      <div
        key={project.id}
        className={`rounded-[1.75rem] border px-5 py-5 transition ${
          isCompleted
            ? "border-cream-200 bg-white/45"
            : "border-cream-200 bg-surface hover:border-thread-700/20 hover:bg-white"
        }`}
      >
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border border-cream-200 bg-white/70 px-3 py-1 text-xs text-thread-700">
                  {craftLabel}
                </span>
                {isCompleted ? (
                  <span className="inline-flex rounded-full border border-cream-200 bg-oat-100 px-3 py-1 text-xs text-thread-700">
                    {messages.home.completedBadge}
                  </span>
                ) : null}
              </div>
              <h2
                className={`font-serif text-[2rem] leading-none ${
                  isCompleted ? "text-thread-700" : "text-thread-900"
                }`}
              >
                {project.name}
              </h2>
            </div>
            <span className="text-sm text-thread-700">{progressPercent}%</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-cream-200 bg-white/60 px-4 py-4">
              <p className="eyebrow">{lineLabel}</p>
              <p className={`mt-3 text-sm font-medium ${isCompleted ? "text-thread-700" : "text-thread-900"}`}>
                {lineValue}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-cream-200 bg-white/60 px-4 py-4">
              <p className="eyebrow">{messages.home.progressLabel}</p>
              <p className={`mt-3 text-sm font-medium ${isCompleted ? "text-thread-700" : "text-thread-900"}`}>
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
                  backgroundColor: isCompleted ? "#B69B86" : "#D8B7AE",
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 text-sm text-thread-700">
              <span>
                {messages.home.activeLineSteps}: {activeRowStepCount}
              </span>
              {isCompleted ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openProject(project.id)}
                    className="pill-button h-10 px-4 hover:border-thread-700/30 hover:bg-white"
                  >
                    {messages.home.viewProject}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateProject(project.id)}
                    className="pill-button-accent h-10 px-4 hover:bg-sand-100"
                  >
                    {messages.home.duplicateProject}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openProject(project.id)}
                  className="text-thread-700 transition hover:text-thread-900"
                >
                  {messages.home.continueProject}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8 sm:space-y-10">
      <PageCard>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="eyebrow">{messages.home.eyebrow}</p>
            <h1 className="max-w-3xl font-serif text-2xl font-semibold leading-tight tracking-tight text-thread-900 sm:text-3xl">
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
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-serif text-3xl text-thread-900">
                {messages.home.activeSectionTitle}
              </h2>
            </div>
            {activeProjects.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {activeProjects.map((project) => renderProjectCard(project, false))}
              </div>
            ) : null}
          </div>

          {completedProjects.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="font-serif text-3xl text-thread-900">
                  {messages.home.completedSectionTitle}
                </h2>
                <p className="text-sm leading-6 text-thread-700">
                  {messages.home.completedProjectsDescription}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {completedProjects.map((project) => renderProjectCard(project, true))}
              </div>
            </div>
          ) : null}
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
