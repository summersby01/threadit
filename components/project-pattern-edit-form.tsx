"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { PageCard } from "@/components/page-card";
import { usePatternRowsStore } from "@/stores/use-pattern-rows-store";

export function ProjectPatternEditForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { format, messages } = useI18n();
  const project = usePatternRowsStore((state) =>
    state.projects.find((item) => item.id === projectId),
  );
  const selectProject = usePatternRowsStore((state) => state.selectProject);
  const updateProjectFutureRows = usePatternRowsStore(
    (state) => state.updateProjectFutureRows,
  );
  const [futureRowDrafts, setFutureRowDrafts] = useState<Record<number, string>>({});
  const rows = Array.isArray(project?.rows) ? project.rows : [];

  useEffect(() => {
    selectProject(projectId);
  }, [projectId, selectProject]);

  useEffect(() => {
    if (!project) {
      return;
    }

    setFutureRowDrafts(Object.fromEntries(rows.map((row) => [row.id, row.text])));
  }, [project, rows]);

  if (!project) {
    return (
      <section className="space-y-7 sm:space-y-8">
        <PageCard>
          <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-5">
            <p className="font-medium text-thread-900">
              {messages.tracker.projectNotFoundTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-thread-700">
              {messages.tracker.projectNotFoundDescription}
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="pill-button mt-4 hover:border-thread-700/30 hover:bg-white"
            >
              {messages.tracker.backToProjects}
            </button>
          </div>
        </PageCard>
      </section>
    );
  }

  const { name, craftType, structureType, currentRow, isProjectComplete } = project;
  const usesRounds = structureType === "round";
  const usesKnittingRows = craftType === "knitting" && structureType === "row";
  const castOnRow = usesKnittingRows ? rows[0] ?? null : null;
  const safeCurrentRow =
    rows.length > 0 ? Math.min(Math.max(currentRow, 0), rows.length - 1) : 0;
  const rowLabelTemplate = usesRounds
    ? messages.tracker.roundLabel
    : messages.tracker.rowLabel;

  function getVisibleKnittingRowNumber(rowIndex: number) {
    return Math.max(rowIndex, 1);
  }

  function getLineTitle(rowIndex: number) {
    return format(rowLabelTemplate, {
      number: String(
        usesKnittingRows ? getVisibleKnittingRowNumber(rowIndex) : rowIndex + 1,
      ).padStart(2, "0"),
    });
  }

  function isRowLocked(rowIndex: number) {
    return isProjectComplete || rowIndex <= safeCurrentRow;
  }

  const hasEditableFutureRows = rows.some((_, rowIndex) => !isRowLocked(rowIndex));
  const hasPendingFutureRowChanges = rows.some(
    (row, rowIndex) =>
      !isRowLocked(rowIndex) &&
      (futureRowDrafts[row.id] ?? row.text) !== row.text,
  );

  function handleSaveFutureRows() {
    const updates = rows
      .filter((_, rowIndex) => !isRowLocked(rowIndex))
      .map((row) => ({
        id: row.id,
        text: futureRowDrafts[row.id] ?? row.text,
      }));

    updateProjectFutureRows(projectId, updates);
    router.push(`/projects/${projectId}`);
  }

  return (
    <section className="space-y-7 sm:space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="eyebrow">{messages.tracker.patternEditTitle}</p>
          <h1 className="font-serif text-4xl leading-tight text-thread-900">
            {name || "-"}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-thread-700">
            {messages.tracker.patternEditDescription}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/projects/${projectId}`)}
          className="pill-button h-11 px-4 hover:border-thread-700/30 hover:bg-white"
        >
          {messages.tracker.backToTracker}
        </button>
      </div>

      <PageCard>
        <div className="space-y-5">
          {castOnRow ? (
            <div className="rounded-[1.25rem] border border-cream-200 bg-cream-50/70 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">{messages.tracker.castOnLabel}</p>
                <span className="rounded-full border border-cream-200 bg-white/80 px-3 py-1 text-xs text-thread-700">
                  {messages.tracker.lockedBadge}
                </span>
              </div>
              <p className="mt-3 text-sm text-thread-700">{castOnRow.text || "-"}</p>
            </div>
          ) : null}

          <div className="space-y-3">
            {rows.map((row, rowIndex) => {
              if (usesKnittingRows && rowIndex === 0) {
                return null;
              }

              const locked = isRowLocked(rowIndex);

              return (
                <div
                  key={`edit-${row.id}`}
                  className={`rounded-[1.25rem] border px-4 py-4 ${
                    locked
                      ? "border-cream-200 bg-cream-50/70"
                      : "border-cream-200 bg-white/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="eyebrow">{getLineTitle(rowIndex)}</p>
                    <span className="rounded-full border border-cream-200 bg-white/80 px-3 py-1 text-xs text-thread-700">
                      {locked
                        ? messages.tracker.lockedBadge
                        : messages.tracker.editableBadge}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={futureRowDrafts[row.id] ?? row.text}
                    onChange={(event) =>
                      setFutureRowDrafts((current) => ({
                        ...current,
                        [row.id]: event.target.value,
                      }))
                    }
                    readOnly={locked}
                    className={`mt-3 h-12 w-full border-0 border-b bg-transparent px-0 text-sm outline-none transition ${
                      locked
                        ? "border-cream-200 text-thread-700"
                        : "border-cream-200 text-thread-900 focus:border-sand-100"
                    }`}
                  />

                  {locked ? (
                    <p className="mt-2 text-xs text-thread-700">
                      {messages.tracker.lockedRowDescription}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveFutureRows}
              disabled={!hasEditableFutureRows || !hasPendingFutureRowChanges}
              className="pill-button-accent h-11 px-4 hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {messages.tracker.saveFutureRows}
            </button>
            {!hasEditableFutureRows ? (
              <p className="text-sm text-thread-700">
                {messages.tracker.noEditableFutureRows}
              </p>
            ) : null}
          </div>
        </div>
      </PageCard>
    </section>
  );
}
