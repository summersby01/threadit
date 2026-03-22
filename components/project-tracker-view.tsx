"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { PageCard } from "@/components/page-card";
import { PatternAssetCard } from "@/components/pattern-asset-card";
import { usePatternRowsStore } from "@/stores/use-pattern-rows-store";

export function ProjectTrackerView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { format, messages } = useI18n();
  const project = usePatternRowsStore((state) =>
    state.projects.find((item) => item.id === projectId),
  );
  const patternAssets = usePatternRowsStore((state) => state.patternAssets);
  const selectProject = usePatternRowsStore((state) => state.selectProject);
  const advanceProjectSteps = usePatternRowsStore(
    (state) => state.advanceProjectSteps,
  );
  const undoProjectStep = usePatternRowsStore((state) => state.undoProjectStep);
  const completeProjectLine = usePatternRowsStore(
    (state) => state.completeProjectLine,
  );
  const setProjectProgressTargetCount = usePatternRowsStore(
    (state) => state.setProjectProgressTargetCount,
  );
  const markProjectComplete = usePatternRowsStore(
    (state) => state.markProjectComplete,
  );
  const toggleProjectDirection = usePatternRowsStore(
    (state) => state.toggleProjectDirection,
  );
  const toggleProjectStartSide = usePatternRowsStore(
    (state) => state.toggleProjectStartSide,
  );
  const setProjectNotes = usePatternRowsStore((state) => state.setProjectNotes);

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
    structureType,
    trackingMode,
    startDirection,
    startSide,
    currentRow,
    currentStep,
    isCompleted,
    completedAt,
    isProjectComplete,
    notes,
    progressTargetCount,
    countValue,
    patternAssetIds,
  } = project;
  const linkedPatternAssets = patternAssets.filter((asset) =>
    patternAssetIds.includes(asset.id),
  );
  const rows = Array.isArray(project.rows) ? project.rows : [];
  const activityLog = Array.isArray(project.activityLog) ? project.activityLog : [];
  const [isEditingProgressTarget, setIsEditingProgressTarget] = useState(false);
  const [progressTargetDraft, setProgressTargetDraft] = useState(
    progressTargetCount > 0 ? String(progressTargetCount) : "",
  );

  useEffect(() => {
    setProgressTargetDraft(progressTargetCount > 0 ? String(progressTargetCount) : "");
    setIsEditingProgressTarget(false);
  }, [progressTargetCount, projectId]);
  const isPatternMode = trackingMode === "pattern";
  const isProgressMode = trackingMode === "progress";
  const isCounterMode = trackingMode === "counter";
  const isCrochet = craftType === "crochet";
  const usesRounds = structureType === "round";
  const usesKnittingRows = craftType === "knitting" && structureType === "row";
  const craftLabel = isCrochet ? messages.create.crochet : messages.create.knitting;
  const trackingModeLabel = isPatternMode
    ? messages.tracker.trackingModePattern
    : isProgressMode
      ? messages.tracker.trackingModeProgress
      : messages.tracker.trackingModeCounter;
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
  const activeSequenceTitle = isCrochet
    ? messages.tracker.stitchSequenceTitle
    : stepListTitle;
  const completeLabel = usesRounds
    ? messages.tracker.completeRound
    : messages.tracker.completeRow;
  const emptyDescription = isCrochet
    ? messages.tracker.crochetEmptyDescription
    : messages.tracker.emptyDescription;
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
    progressTargetCount > 0
      ? Math.min(100, Math.max(0, Math.round((currentRow / progressTargetCount) * 100)))
      : 0;
  const currentLineProgressPercent =
    activeSteps.length > 0
      ? Math.min(
          100,
          Math.max(0, Math.round((safeCurrentStep / activeSteps.length) * 100)),
        )
      : 0;
  const hasParsedSteps = totalSteps > 0;
  const castOnRow = usesKnittingRows ? rows[0] ?? null : null;
  const displayRows = (usesKnittingRows ? rows.slice(1) : rows)
    .map((row, rowIndex) => ({
      row,
      rowIndex: usesKnittingRows ? rowIndex + 1 : rowIndex,
    }))
    .reverse();

  function getLineDirectionMeta(rowIndex: number) {
    const rowNumber = rowIndex;
    const isOddRow = rowNumber % 2 === 1;
    const pointsRight = startDirection === "right" ? isOddRow : !isOddRow;
    const side = startSide === "RS"
      ? isOddRow
        ? "RS"
        : "WS"
      : isOddRow
        ? "WS"
        : "RS";

    return {
      arrow: pointsRight ? "→" : "←",
      side,
    };
  }

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

  const activeDirectionMeta = getLineDirectionMeta(safeCurrentRow);
  const nextDirectionLabel =
    startDirection === "right" ? "←로 변경" : "→로 변경";
  const nextSideLabel = startSide === "RS" ? "WS로 변경" : "RS로 변경";

  function handleSaveProgressTarget() {
    const nextCount = Number.parseInt(progressTargetDraft || "0", 10);

    if (Number.isNaN(nextCount) || nextCount <= 0) {
      return;
    }

    setProjectProgressTargetCount(projectId, nextCount);
    setIsEditingProgressTarget(false);
  }

  function handleCounterComplete() {
    if (!window.confirm(messages.tracker.counterCompleteConfirm)) {
      return;
    }

    markProjectComplete(projectId);
  }

  if (isProgressMode) {
    return (
      <section className="space-y-7 sm:space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="eyebrow">{messages.tracker.eyebrow}</p>
            <h1 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-thread-900 sm:text-3xl">
              {messages.tracker.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex rounded-full border border-cream-200 bg-white/70 px-4 py-2 text-sm text-thread-700">
                {messages.tracker.modeEyebrow}: {craftLabel}
              </div>
              <div className="inline-flex rounded-full border border-cream-200 bg-white/70 px-4 py-2 text-sm text-thread-700">
                {messages.tracker.trackingModeLabel}: {trackingModeLabel}
              </div>
            </div>
            <div className="text-sm text-thread-700">{name || "-"}</div>
          </div>
        </div>

        <PageCard>
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
              <div className="rounded-[1.75rem] border border-sand-100 bg-oat-100/70 p-5 sm:p-6">
                <p className="eyebrow">{currentRowLabel}</p>
                <p className="mt-3 font-serif text-4xl text-thread-900">
                  {currentRow}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-sand-100 bg-oat-100/55 p-5 sm:p-6">
                <p className="eyebrow">
                  {usesRounds
                    ? messages.create.progressTotalRoundsLabel
                    : messages.create.progressTotalRowsLabel}
                </p>
                {isEditingProgressTarget ? (
                  <div className="mt-3 space-y-3">
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={progressTargetDraft}
                      onChange={(event) => setProgressTargetDraft(event.target.value)}
                      className="h-11 w-full rounded-[1rem] border border-cream-200 bg-white/80 px-4 text-sm text-thread-900 outline-none transition focus:border-sand-100 focus:bg-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveProgressTarget}
                        className="pill-button h-10 px-4 hover:border-thread-700/30 hover:bg-white"
                      >
                        {messages.tracker.saveTotal}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProgressTargetDraft(String(progressTargetCount));
                          setIsEditingProgressTarget(false);
                        }}
                        className="pill-button h-10 px-4 hover:border-thread-700/30 hover:bg-white"
                      >
                        {messages.tracker.cancelEdit}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2">
                    <p className="font-serif text-4xl text-thread-900">
                      {progressTargetCount}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditingProgressTarget(true)}
                      className="inline-flex h-9 items-center rounded-full border border-cream-200 bg-white/80 px-3 text-sm text-thread-700 transition hover:border-thread-700/30 hover:bg-white"
                    >
                      {messages.tracker.editTotal}
                    </button>
                  </div>
                )}
              </div>
              <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-5">
                <p className="eyebrow">{messages.tracker.progressPercentLabel}</p>
                <div className="mt-3 space-y-3">
                  <p className="font-serif text-3xl text-thread-900">
                    {overallProgressPercent}%
                  </p>
                  <p className="text-sm font-medium text-thread-900">
                    {currentRow} / {progressTargetCount} [{messages.tracker.editTotal}]
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
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => advanceProjectSteps(projectId, 1)}
                disabled={isProjectComplete}
                className="pill-button hover:border-thread-700/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {messages.tracker.plusOne}
              </button>
              <button
                type="button"
                onClick={() => advanceProjectSteps(projectId, 5)}
                disabled={isProjectComplete}
                className="pill-button hover:border-thread-700/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {messages.tracker.plusFive}
              </button>
              <button
                type="button"
                onClick={() => completeProjectLine(projectId)}
                disabled={isProjectComplete}
                className="pill-button-accent px-5 hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {messages.tracker.progressComplete}
              </button>
            </div>
          </div>
        </PageCard>

        {linkedPatternAssets.length > 0 ? (
          <PageCard>
            <div className="space-y-4">
              <div>
                <p className="eyebrow">{messages.library.libraryEyebrow}</p>
                <h3 className="font-serif text-2xl text-thread-900">
                  {messages.library.linkedAssetsTitle}
                </h3>
              </div>
              <div className="grid gap-3">
                {linkedPatternAssets.map((asset) => (
                  <PatternAssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            </div>
          </PageCard>
        ) : null}

        <PageCard>
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl text-thread-900">
                {messages.tracker.notesTitle}
              </h3>
              <div className="mt-4 rounded-[1.75rem] border border-cream-200 bg-white/60 p-5">
                <p className="text-sm leading-6 text-thread-700">
                  {messages.tracker.notesDescription}
                </p>
                <textarea
                  value={notes}
                  onChange={(event) => setProjectNotes(projectId, event.target.value)}
                  placeholder={messages.tracker.notesPlaceholder}
                  className="mt-4 min-h-40 w-full resize-none rounded-[1.5rem] border border-cream-200 bg-cream-50/80 px-4 py-4 text-sm leading-7 text-thread-900 outline-none transition placeholder:text-thread-700/70 focus:border-sand-100 focus:bg-white"
                />
              </div>
            </div>

            {activityLog.length > 0 ? (
              <div>
                <h3 className="font-serif text-2xl text-thread-900">
                  {messages.tracker.activityTitle}
                </h3>
                <div className="mt-4 rounded-[1.75rem] border border-cream-200 bg-white/60 p-5">
                  <div className="space-y-3">
                    {activityLog.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-cream-200 bg-cream-50/70 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-thread-900">
                          {entry.label}
                        </span>
                        <span className="text-xs text-thread-700">
                          {new Date(entry.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </PageCard>
      </section>
    );
  }

  if (isCounterMode) {
    return (
      <section className="space-y-7 sm:space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="eyebrow">{messages.tracker.eyebrow}</p>
            <h1 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-thread-900 sm:text-3xl">
              {messages.tracker.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex rounded-full border border-cream-200 bg-white/70 px-4 py-2 text-sm text-thread-700">
                {messages.tracker.modeEyebrow}: {craftLabel}
              </div>
              <div className="inline-flex rounded-full border border-cream-200 bg-white/70 px-4 py-2 text-sm text-thread-700">
                {messages.tracker.trackingModeLabel}: {trackingModeLabel}
              </div>
            </div>
            <div className="text-sm text-thread-700">{name || "-"}</div>
          </div>
        </div>

        <PageCard>
          <div className="space-y-5">
            {isCompleted ? (
              <div className="rounded-[1.5rem] border border-cream-200 bg-oat-100 p-5">
                <p className="font-medium text-thread-900">
                  {messages.tracker.counterCompletedBadge}
                </p>
                <p className="mt-2 text-sm leading-6 text-thread-700">
                  {format(messages.tracker.counterValue, {
                    count: String(countValue),
                  })}
                </p>
                {completedAt ? (
                  <p className="mt-2 text-xs text-thread-700">
                    {messages.tracker.completedAtLabel}:{" "}
                    {new Date(completedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-[1.75rem] border border-sand-100 bg-oat-100/70 p-5 sm:p-6">
              <p className="eyebrow">{messages.tracker.counterTitle}</p>
              <p className="mt-3 font-serif text-4xl text-thread-900">
                {format(messages.tracker.counterValue, {
                  count: String(countValue),
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => advanceProjectSteps(projectId, 1)}
                disabled={isCompleted}
                className="pill-button hover:border-thread-700/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {messages.tracker.plusOne}
              </button>
              <button
                type="button"
                onClick={() => advanceProjectSteps(projectId, 5)}
                disabled={isCompleted}
                className="pill-button hover:border-thread-700/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {messages.tracker.plusFive}
              </button>
              <button
                type="button"
                onClick={() => undoProjectStep(projectId)}
                className="pill-button hover:border-thread-700/30 hover:bg-white"
              >
                {messages.tracker.undo}
              </button>
            </div>
            <button
              type="button"
              onClick={handleCounterComplete}
              disabled={isCompleted}
              className="pill-button-accent px-5 hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCompleted
                ? messages.tracker.counterCompletedBadge
                : messages.tracker.counterMarkComplete}
            </button>
          </div>
        </PageCard>

        {linkedPatternAssets.length > 0 ? (
          <PageCard>
            <div className="space-y-4">
              <div>
                <p className="eyebrow">{messages.library.libraryEyebrow}</p>
                <h3 className="font-serif text-2xl text-thread-900">
                  {messages.library.linkedAssetsTitle}
                </h3>
              </div>
              <div className="grid gap-3">
                {linkedPatternAssets.map((asset) => (
                  <PatternAssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            </div>
          </PageCard>
        ) : null}

        <PageCard>
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-2xl text-thread-900">
                {messages.tracker.notesTitle}
              </h3>
              <div className="mt-4 rounded-[1.75rem] border border-cream-200 bg-white/60 p-5">
                <p className="text-sm leading-6 text-thread-700">
                  {messages.tracker.notesDescription}
                </p>
                <textarea
                  value={notes}
                  onChange={(event) => setProjectNotes(projectId, event.target.value)}
                  placeholder={messages.tracker.notesPlaceholder}
                  className="mt-4 min-h-40 w-full resize-none rounded-[1.5rem] border border-cream-200 bg-cream-50/80 px-4 py-4 text-sm leading-7 text-thread-900 outline-none transition placeholder:text-thread-700/70 focus:border-sand-100 focus:bg-white"
                />
              </div>
            </div>

            {activityLog.length > 0 ? (
              <div>
                <h3 className="font-serif text-2xl text-thread-900">
                  {messages.tracker.activityTitle}
                </h3>
                <div className="mt-4 rounded-[1.75rem] border border-cream-200 bg-white/60 p-5">
                  <div className="space-y-3">
                    {activityLog.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-cream-200 bg-cream-50/70 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-thread-900">
                          {entry.label}
                        </span>
                        <span className="text-xs text-thread-700">
                          {new Date(entry.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </PageCard>
      </section>
    );
  }

  return (
    <section className="space-y-7 sm:space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="eyebrow">{messages.tracker.eyebrow}</p>
          <h1 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-thread-900 sm:text-3xl">
            {messages.tracker.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-full border border-cream-200 bg-white/70 px-4 py-2 text-sm text-thread-700">
              {messages.tracker.modeEyebrow}: {craftLabel}
            </div>
            <div className="inline-flex rounded-full border border-cream-200 bg-white/70 px-4 py-2 text-sm text-thread-700">
              {messages.tracker.trackingModeLabel}: {trackingModeLabel}
            </div>
          </div>
          <div className="text-sm text-thread-700">{name || "-"}</div>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/projects/${projectId}/edit`)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-200 bg-white/70 text-thread-700 transition hover:border-thread-700/30 hover:bg-white"
          aria-label={messages.tracker.openPatternEditor}
          title={messages.tracker.openPatternEditor}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="M12 3.75l1.1 2.23 2.46.36-1.78 1.74.42 2.45L12 9.38 9.8 10.53l.42-2.45L8.44 6.34l2.46-.36L12 3.75z" />
            <path d="M4.75 13.25l1.59.3.72 1.46 1.47.72.29 1.59-1.21 1.08.12 1.62-1.62.12-1.08 1.21-1.59-.29-.72-1.47-1.46-.72-.3-1.59 1.21-1.08-.12-1.62 1.62-.12 1.08-1.21z" />
          </svg>
        </button>
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
              {castOnRow ? (
                <div className="mt-3 rounded-[1.25rem] border border-cream-200 bg-oat-100/60 p-4">
                  <p className="eyebrow">{messages.tracker.castOnLabel}</p>
                  <p className="mt-2 text-sm text-thread-700">
                    {messages.tracker.rawInput}: {castOnRow.text || "-"}
                  </p>
                  <p className="mt-2 text-sm text-thread-700">
                    {messages.tracker.castOnDescription}
                  </p>
                </div>
              ) : null}
              <div className="mt-4 grid gap-2 text-sm text-thread-700">
                <p>{messages.tracker.modeEyebrow}: {craftType ?? "-"}</p>
                <p>{messages.tracker.trackingModeLabel}: {trackingModeLabel}</p>
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
                <div className="rounded-[1.75rem] border border-sand-100 bg-oat-100/70 p-5 sm:p-6">
                  <p className="eyebrow">{currentRowLabel}</p>
                  <p className="mt-3 font-serif text-4xl text-thread-900">
                    {getLineTitle(safeCurrentRow)}
                  </p>
                  {usesKnittingRows ? (
                    <div className="mt-3 space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-white/75 px-3 py-1.5 text-sm text-thread-700">
                        <span className="text-base text-thread-900">
                          {activeDirectionMeta.arrow}
                        </span>
                        <span
                          className={
                            activeDirectionMeta.side === "RS"
                              ? "font-medium text-thread-900"
                              : "text-thread-700"
                          }
                        >
                          {activeDirectionMeta.side}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleProjectDirection(projectId)}
                          className="inline-flex items-center rounded-full border border-cream-200 bg-white/65 px-3 py-1.5 text-xs text-thread-700 transition hover:border-thread-700/30 hover:bg-white"
                          aria-label={nextDirectionLabel}
                          title={nextDirectionLabel}
                        >
                          {nextDirectionLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleProjectStartSide(projectId)}
                          className="inline-flex items-center rounded-full border border-cream-200 bg-white/65 px-3 py-1.5 text-xs text-thread-700 transition hover:border-thread-700/30 hover:bg-white"
                          aria-label={nextSideLabel}
                          title={nextSideLabel}
                        >
                          {nextSideLabel}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="rounded-[1.75rem] border border-sand-100 bg-oat-100/55 p-5 sm:p-6">
                  <p className="eyebrow">
                    {isCrochet
                      ? messages.tracker.currentStepProgress
                      : messages.tracker.currentLineTotal}
                  </p>
                  <div className="mt-3 space-y-3">
                    <p className="font-serif text-3xl text-thread-900">
                      {format(messages.tracker.stepCount, {
                        current: safeCurrentStep,
                        total: activeSteps.length,
                      })}
                    </p>
                    <p className="text-sm text-thread-700">
                      {isCrochet
                        ? `${messages.tracker.currentStep}: ${activeSteps[visibleCurrentStep] ?? "-"}`
                        : `${messages.tracker.currentStep}: ${format(
                            messages.tracker.stepLabel,
                            {
                              number: String(currentLineStep).padStart(2, "0"),
                            },
                          )}`}
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
                <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-5">
                  <p className="eyebrow">{messages.tracker.overallProgress}</p>
                  <div className="mt-3 space-y-3">
                    <p className="font-serif text-3xl text-thread-900">
                      {Math.min(
                        100,
                        Math.max(0, Math.round((completedSteps / Math.max(totalSteps, 1)) * 100)),
                      )}
                      %
                    </p>
                    <p className="text-sm font-medium text-thread-900">
                      {completedSteps} / {totalSteps}
                    </p>
                    <div className="h-2 rounded-full bg-cream-200/80">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, Math.round((completedSteps / Math.max(totalSteps, 1)) * 100)),
                          )}%`,
                          backgroundColor: "#D8B7AE",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-cream-200 bg-white/65 p-4">
                  <p className="eyebrow">{messages.tracker.trackerSummaryTitle}</p>
                  <p className="mt-3 text-sm text-thread-700">
                    {messages.tracker.modeEyebrow}: {craftType}
                  </p>
                  <p className="mt-2 text-sm text-thread-700">
                    {messages.tracker.trackingModeLabel}: {trackingModeLabel}
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
                  className="pill-button hover:border-thread-700/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {messages.tracker.plusOne}
                </button>
                <button
                  type="button"
                  onClick={() => advanceProjectSteps(projectId, 5)}
                  disabled={isProjectComplete}
                  className="pill-button hover:border-thread-700/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {messages.tracker.plusFive}
                </button>
                <button
                  type="button"
                  onClick={() => advanceProjectSteps(projectId, 10)}
                  disabled={isProjectComplete}
                  className="pill-button hover:border-thread-700/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="pill-button-accent px-5 hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-50"
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
              {rows.map((row, rowIndex) =>
                usesKnittingRows && rowIndex === 0 ? null : (
                  <div
                    key={row.id}
                    className="mt-3 rounded-[1.25rem] border border-cream-200 bg-white/60 p-4"
                  >
                    <p className="eyebrow">{getLineTitle(rowIndex)}</p>
                    <p className="mt-2 text-sm text-thread-700">
                      {messages.tracker.rawInput}: {row.text || "-"}
                    </p>
                    {row.parseError ? (
                      <p className="mt-2 text-sm text-thread-700">
                        {messages.create.parseErrorPrefix}: {row.parseError}
                      </p>
                    ) : null}
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl text-thread-900">
                  {activeSequenceTitle}
                </h2>
                {isCrochet ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {activeSteps.map((step, index) => {
                      const isCurrent =
                        !isProjectComplete && index === visibleCurrentStep;
                      const isCompleted = index < safeCurrentStep;

                      return (
                        <div
                          key={`${activeRow?.id}-${index}`}
                          className={`rounded-[1.25rem] border px-4 py-4 ${
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
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs uppercase tracking-[0.24em] text-thread-700">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cream-200 bg-white/80 text-sm font-medium text-thread-900">
                              {step.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
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
                )}
              </div>

              <div>
                {castOnRow ? (
                  <div className="mb-4 rounded-[1.5rem] border border-cream-200 bg-oat-100/60 p-4">
                    <p className="eyebrow">{messages.tracker.castOnLabel}</p>
                    <p className="mt-2 text-sm text-thread-700">
                      {messages.tracker.rawInput}: {castOnRow.text || "-"}
                    </p>
                    <p className="mt-3 text-sm text-thread-700">
                      {messages.tracker.castOnDescription}
                    </p>
                  </div>
                ) : null}
                <h3 className="font-serif text-2xl text-thread-900">
                  {allRowsTitle}
                </h3>
                <div className="mt-4 grid gap-3">
                  {displayRows.map(({ row, rowIndex }) => {
                    const directionMeta = getLineDirectionMeta(rowIndex);
                    const isCurrentRow = rowIndex === safeCurrentRow;
                    const lineTitle = getLineTitle(rowIndex);

                    return (
                      <div
                        key={row.id}
                        className={`rounded-[1.5rem] border p-4 transition ${
                          isCurrentRow
                            ? "border-sand-100 bg-oat-100/80 p-5"
                            : "border-cream-200 bg-white/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="eyebrow">{lineTitle}</p>
                              {usesKnittingRows ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-cream-200 bg-white/70 px-2.5 py-1 text-xs text-thread-700">
                                  <span className="text-sm text-thread-900">
                                    {directionMeta.arrow}
                                  </span>
                                  <span
                                    className={
                                      directionMeta.side === "RS"
                                        ? "font-medium text-thread-900"
                                        : "text-thread-700"
                                    }
                                  >
                                    {directionMeta.side}
                                  </span>
                                </span>
                              ) : null}
                            </div>
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
                    );
                  })}
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

                      if (usesKnittingRows && rowIndex === 0) {
                        return null;
                      }

                      return (
                        <div
                          key={row.id}
                          className="rounded-[1.5rem] border border-cream-200 bg-white/60 p-4"
                        >
                          <p className="eyebrow">{getLineTitle(rowIndex)}</p>
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
                  {messages.tracker.notesTitle}
                </h3>
                <div className="mt-4 rounded-[1.75rem] border border-cream-200 bg-white/60 p-5">
                  <p className="text-sm leading-6 text-thread-700">
                    {messages.tracker.notesDescription}
                  </p>
                  <textarea
                    value={notes}
                    onChange={(event) => setProjectNotes(projectId, event.target.value)}
                    placeholder={messages.tracker.notesPlaceholder}
                    className="mt-4 min-h-40 w-full resize-none rounded-[1.5rem] border border-cream-200 bg-cream-50/80 px-4 py-4 text-sm leading-7 text-thread-900 outline-none transition placeholder:text-thread-700/70 focus:border-sand-100 focus:bg-white"
                  />
                </div>
              </div>

              {activityLog.length > 0 ? (
                <div>
                  <h3 className="font-serif text-2xl text-thread-900">
                    {messages.tracker.activityTitle}
                  </h3>
                  <div className="mt-4 rounded-[1.75rem] border border-cream-200 bg-white/60 p-5">
                    <div className="space-y-3">
                      {activityLog.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-cream-200 bg-cream-50/70 px-4 py-3"
                        >
                          <span className="text-sm font-medium text-thread-900">
                            {entry.label}
                          </span>
                          <span className="text-xs text-thread-700">
                            {new Date(entry.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </PageCard>

        {linkedPatternAssets.length > 0 ? (
          <PageCard>
            <div className="space-y-4">
              <div>
                <p className="eyebrow">{messages.library.libraryEyebrow}</p>
                <h3 className="font-serif text-2xl text-thread-900">
                  {messages.library.linkedAssetsTitle}
                </h3>
              </div>
              <div className="grid gap-3">
                {linkedPatternAssets.map((asset) => (
                  <PatternAssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            </div>
          </PageCard>
        ) : null}
      </div>
    </section>
  );
}
