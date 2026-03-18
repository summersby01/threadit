"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { PageCard } from "@/components/page-card";
import { usePatternRowsStore } from "@/stores/use-pattern-rows-store";

export function ProjectTrackerView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { format, messages } = useI18n();
  const project = usePatternRowsStore((state) =>
    state.projects.find((item) => item.id === projectId),
  );
  const selectProject = usePatternRowsStore((state) => state.selectProject);
  const advanceProjectSteps = usePatternRowsStore(
    (state) => state.advanceProjectSteps,
  );
  const undoProjectStep = usePatternRowsStore((state) => state.undoProjectStep);
  const completeProjectLine = usePatternRowsStore(
    (state) => state.completeProjectLine,
  );

  useEffect(() => {
    selectProject(projectId);
  }, [projectId, selectProject]);

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

  const {
    name,
    craftType,
    workMode,
    rows,
    currentRow,
    currentStep,
    isProjectComplete,
  } = project;
  const safeCurrentRow =
    rows.length > 0 ? Math.min(Math.max(currentRow, 0), rows.length - 1) : 0;
  const activeRow = rows[safeCurrentRow];
  const activeSteps = activeRow?.parsedSteps ?? [];
  const safeCurrentStep =
    activeSteps.length > 0
      ? Math.min(Math.max(currentStep, 0), activeSteps.length)
      : 0;
  const visibleCurrentStep = Math.min(
    safeCurrentStep,
    Math.max(activeSteps.length - 1, 0),
  );
  const currentLineStep =
    activeSteps.length > 0
      ? Math.min(safeCurrentStep + (isProjectComplete ? 0 : 1), activeSteps.length)
      : 0;
  const isCrochet = craftType === "crochet";
  const usesRounds = workMode === "round";
  const modeLabel = isCrochet ? messages.create.crochet : messages.create.knitting;
  const currentRowLabel = usesRounds
    ? messages.tracker.currentRound
    : messages.tracker.currentRow;
  const rowLabelTemplate = usesRounds
    ? messages.tracker.roundLabel
    : messages.tracker.rowLabel;
  const stepListTitle = usesRounds
    ? messages.tracker.roundListTitle
    : messages.tracker.stepListTitle;
  const allRowsTitle = usesRounds
    ? messages.tracker.allRoundsTitle
    : messages.tracker.allRowsTitle;
  const completeLabel = usesRounds
    ? messages.tracker.completeRound
    : messages.tracker.completeRow;
  const emptyDescription = isCrochet
    ? messages.tracker.crochetEmptyDescription
    : messages.tracker.emptyDescription;
  const totalSteps = rows.reduce((sum, row) => sum + row.parsedSteps.length, 0);
  const totalRows = rows.length;
  const parsedRowCount = rows.filter((row) => row.parsedSteps.length > 0).length;
  const rowsWithErrors = rows.filter((row) => row.parseError);
  const completedBeforeRow = rows
    .slice(0, safeCurrentRow)
    .reduce((sum, row) => sum + row.parsedSteps.length, 0);
  const completedSteps = isProjectComplete
    ? totalSteps
    : activeSteps.length > 0
      ? completedBeforeRow + safeCurrentStep
      : completedBeforeRow;
  const overallProgressPercent =
    totalSteps > 0
      ? Math.min(100, Math.max(0, Math.round((completedSteps / totalSteps) * 100)))
      : 0;
  const currentLineProgressPercent =
    activeSteps.length > 0
      ? Math.min(
          100,
          Math.max(0, Math.round((safeCurrentStep / activeSteps.length) * 100)),
        )
      : 0;
  const hasParsedSteps = totalSteps > 0;

  return (
    <section className="space-y-7 sm:space-y-8">
      <div className="space-y-3">
        <p className="eyebrow">{messages.tracker.eyebrow}</p>
        <h1 className="font-serif text-4xl leading-tight text-thread-900">
          {messages.tracker.title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-thread-700">
          {messages.tracker.description}
        </p>
        <div className="inline-flex rounded-full border border-cream-200 bg-white/70 px-4 py-2 text-sm text-thread-700">
          {messages.tracker.modeEyebrow}: {craftType ? modeLabel : "-"}
        </div>
        <div className="text-sm text-thread-700">{name || "-"}</div>
      </div>

      <div className="grid gap-4 sm:gap-5">
        <PageCard>
          {!hasParsedSteps ? (
            <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-5">
              <p className="font-medium text-thread-900">
                {rowsWithErrors.length > 0
                  ? messages.tracker.parseErrorTitle
                  : messages.tracker.emptyTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-thread-700">
                {rowsWithErrors.length > 0
                  ? rowsWithErrors[0].parseError
                  : emptyDescription}
              </p>
              <div className="mt-4 grid gap-2 text-sm text-thread-700">
                <p>{messages.tracker.modeEyebrow}: {craftType ?? "-"}</p>
                <p>{messages.tracker.parsedRowCount}: {parsedRowCount}</p>
                <p>{messages.tracker.totalRows}: {totalRows}</p>
                <p>{messages.tracker.totalStepCount}: {totalSteps}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {isProjectComplete ? (
                <div className="rounded-[1.5rem] border border-cream-200 bg-oat-100 p-5">
                  <p className="font-medium text-thread-900">
                    {messages.tracker.completedTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-thread-700">
                    {messages.tracker.completedDescription}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-5">
                  <p className="eyebrow">{currentRowLabel}</p>
                  <p className="mt-3 font-serif text-3xl text-thread-900">
                    {format(rowLabelTemplate, {
                      number: String(safeCurrentRow + 1).padStart(2, "0"),
                    })}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-5">
                  <p className="eyebrow">{messages.tracker.overallProgress}</p>
                  <div className="mt-3 space-y-3">
                    <p className="font-serif text-3xl text-thread-900">
                      {overallProgressPercent}%
                    </p>
                    <p className="text-sm font-medium text-thread-900">
                      {completedSteps} / {totalSteps}
                    </p>
                    <div className="h-2 rounded-full bg-cream-200/80">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${overallProgressPercent}%`,
                          backgroundColor: "#D8B7AE",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-5">
                  <p className="eyebrow">{messages.tracker.currentLineTotal}</p>
                  <div className="mt-3 space-y-3">
                    <p className="text-sm font-medium text-thread-900">
                      {format(messages.tracker.stepCount, {
                        current: safeCurrentStep,
                        total: activeSteps.length,
                      })}
                    </p>
                    <p className="text-sm text-thread-700">
                      {messages.tracker.currentStep}:{" "}
                      {format(messages.tracker.stepLabel, {
                        number: String(currentLineStep).padStart(2, "0"),
                      })}
                    </p>
                    <div className="h-2 rounded-full bg-cream-200/80">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${currentLineProgressPercent}%`,
                          backgroundColor: "#B7C2AE",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-4">
                  <p className="eyebrow">{messages.tracker.debugTitle}</p>
                  <p className="mt-3 text-sm text-thread-700">
                    {messages.tracker.modeEyebrow}: {craftType}
                  </p>
                  <p className="mt-2 text-sm text-thread-700">
                    {messages.tracker.rawInput}: {activeRow?.text || "-"}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-4">
                  <p className="eyebrow">{messages.tracker.parsedRowCount}</p>
                  <p className="mt-3 text-sm text-thread-900">{parsedRowCount}</p>
                </div>
                <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-4">
                  <p className="eyebrow">{messages.tracker.totalStepCount}</p>
                  <p className="mt-3 text-sm text-thread-900">{totalSteps}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => advanceProjectSteps(projectId, 1)}
                  disabled={isProjectComplete}
                  className="pill-button hover:border-thread-700/30 hover:bg-white"
                >
                  {messages.tracker.plusOne}
                </button>
                <button
                  type="button"
                  onClick={() => advanceProjectSteps(projectId, 5)}
                  disabled={isProjectComplete}
                  className="pill-button hover:border-thread-700/30 hover:bg-white"
                >
                  {messages.tracker.plusFive}
                </button>
                <button
                  type="button"
                  onClick={() => advanceProjectSteps(projectId, 10)}
                  disabled={isProjectComplete}
                  className="pill-button hover:border-thread-700/30 hover:bg-white"
                >
                  {messages.tracker.plusTen}
                </button>
                <button
                  type="button"
                  onClick={() => undoProjectStep(projectId)}
                  className="pill-button hover:border-thread-700/30 hover:bg-white"
                >
                  {messages.tracker.undo}
                </button>
                <button
                  type="button"
                  onClick={() => completeProjectLine(projectId)}
                  disabled={isProjectComplete}
                  className="pill-button-accent px-5 hover:bg-sand-100"
                >
                  {completeLabel}
                </button>
              </div>
            </div>
          )}
        </PageCard>

        <PageCard>
          {!hasParsedSteps ? (
            <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-5">
              <p className="font-medium text-thread-900">
                {rowsWithErrors.length > 0
                  ? messages.tracker.parseErrorTitle
                  : messages.tracker.emptyTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-thread-700">
                {rowsWithErrors.length > 0
                  ? rowsWithErrors[0].parseError
                  : emptyDescription}
              </p>
              {rows.map((row, rowIndex) => (
                <div
                  key={row.id}
                  className="mt-3 rounded-[1.25rem] border border-cream-200 bg-white/60 p-4"
                >
                  <p className="eyebrow">
                    {format(rowLabelTemplate, {
                      number: String(rowIndex + 1).padStart(2, "0"),
                    })}
                  </p>
                  <p className="mt-2 text-sm text-thread-700">
                    {messages.tracker.rawInput}: {row.text || "-"}
                  </p>
                  {row.parseError ? (
                    <p className="mt-2 text-sm text-thread-700">
                      {messages.create.parseErrorPrefix}: {row.parseError}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl text-thread-900">
                  {stepListTitle}
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeSteps.map((step, index) => {
                    const isCurrent =
                      !isProjectComplete && index === visibleCurrentStep;
                    const isCompleted = index < safeCurrentStep;

                    return (
                      <span
                        key={`${activeRow?.id}-${index}`}
                        className={`rounded-full border px-4 py-2 text-sm font-medium ${
                          isCurrent
                            ? "border-transparent text-thread-900"
                            : isCompleted
                              ? "border-cream-200 bg-oat-100 text-thread-700"
                              : "border-cream-200 bg-white/70 text-thread-900"
                        }`}
                        style={
                          isCurrent ? { backgroundColor: "#D8B7AE" } : undefined
                        }
                      >
                        {step}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl text-thread-900">
                  {allRowsTitle}
                </h3>
                <div className="mt-4 grid gap-3">
                  {rows.map((row, rowIndex) => (
                    <div
                      key={row.id}
                      className="rounded-[1.5rem] border border-cream-200 bg-white/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="eyebrow">
                            {format(rowLabelTemplate, {
                              number: String(rowIndex + 1).padStart(2, "0"),
                            })}
                          </p>
                          <p className="mt-2 text-sm text-thread-700">
                            {messages.tracker.rawInput}: {row.text || "-"}
                          </p>
                        </div>
                        <span className="text-xs text-thread-700">
                          {format(messages.tracker.stepCount, {
                            current:
                              rowIndex === safeCurrentRow && row.parsedSteps.length > 0
                                ? currentLineStep
                                : row.parsedSteps.length > 0 && rowIndex < safeCurrentRow
                                  ? row.parsedSteps.length
                                  : 0,
                            total: row.parsedSteps.length,
                          })}
                        </span>
                      </div>
                      {row.parseError ? (
                        <p className="mt-3 text-sm text-thread-700">
                          {messages.create.parseErrorPrefix}: {row.parseError}
                        </p>
                      ) : null}
                      {row.parsedSteps.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {row.parsedSteps.map((step, stepIndex) => {
                            const isCurrent =
                              !isProjectComplete &&
                              rowIndex === safeCurrentRow &&
                              stepIndex === visibleCurrentStep;
                            const isCompleted =
                              rowIndex < safeCurrentRow ||
                              (rowIndex === safeCurrentRow &&
                                stepIndex < safeCurrentStep);

                            return (
                              <span
                                key={`${row.id}-${stepIndex}`}
                                className={`rounded-full border px-3 py-2 text-sm font-medium ${
                                  isCurrent
                                    ? "border-transparent text-thread-900"
                                    : isCompleted
                                      ? "border-cream-200 bg-oat-100 text-thread-700"
                                      : "border-cream-200 bg-white/70 text-thread-900"
                                }`}
                                style={
                                  isCurrent
                                    ? { backgroundColor: "#D8B7AE" }
                                    : undefined
                                }
                              >
                                {step}
                              </span>
                            );
                          })}
                        </div>
                      ) : row.text.trim() ? (
                        <p className="mt-3 text-sm text-thread-700">
                          {messages.tracker.parseErrorTitle}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm text-thread-700">
                          {messages.tracker.emptyTitle}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {rowsWithErrors.length > 0 ? (
                <div>
                  <h3 className="font-serif text-2xl text-thread-900">
                    {messages.tracker.parseErrorTitle}
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {rowsWithErrors.map((row) => {
                      const rowIndex = rows.findIndex((item) => item.id === row.id);

                      return (
                        <div
                          key={row.id}
                          className="rounded-[1.5rem] border border-cream-200 bg-white/60 p-4"
                        >
                          <p className="eyebrow">
                            {format(rowLabelTemplate, {
                              number: String(rowIndex + 1).padStart(2, "0"),
                            })}
                          </p>
                          <p className="mt-2 text-sm text-thread-700">
                            {messages.tracker.rawInput}: {row.text || "-"}
                          </p>
                          <p className="mt-2 text-sm text-thread-700">
                            {messages.create.parseErrorPrefix}: {row.parseError}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div>
                <h3 className="font-serif text-2xl text-thread-900">
                  {messages.tracker.debugTitle}
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-cream-200 bg-white/60 p-4">
                    <p className="eyebrow">{messages.tracker.currentRowIndex}</p>
                    <p className="mt-3 text-sm text-thread-900">{safeCurrentRow}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-cream-200 bg-white/60 p-4">
                    <p className="eyebrow">{messages.tracker.currentStepIndex}</p>
                    <p className="mt-3 text-sm text-thread-900">{safeCurrentStep}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-cream-200 bg-white/60 p-4">
                    <p className="eyebrow">{messages.tracker.isProjectComplete}</p>
                    <p className="mt-3 text-sm text-thread-900">
                      {String(isProjectComplete)}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-cream-200 bg-white/60 p-4">
                    <p className="eyebrow">{messages.tracker.totalRows}</p>
                    <p className="mt-3 text-sm text-thread-900">{totalRows}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-cream-200 bg-white/60 p-4">
                    <p className="eyebrow">{messages.tracker.totalStepCount}</p>
                    <p className="mt-3 text-sm text-thread-900">{totalSteps}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-cream-200 bg-white/60 p-4">
                    <p className="eyebrow">{messages.tracker.activeRowStepCount}</p>
                    <p className="mt-3 text-sm text-thread-900">{activeSteps.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </PageCard>
      </div>
    </section>
  );
}
