"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { PageCard } from "@/components/page-card";
import { usePatternRowsStore } from "@/stores/use-pattern-rows-store";

type PatternHelperType =
  | "rib-1x1"
  | "rib-2x2"
  | "stockinette"
  | "garter"
  | "seed";
type StitchType = "K" | "P";

export function CreatePatternForm() {
  const { format, messages } = useI18n();
  const router = useRouter();
  const draftProject = usePatternRowsStore((state) => state.draftProject);
  const setProjectName = usePatternRowsStore((state) => state.setDraftProjectName);
  const setCraftType = usePatternRowsStore((state) => state.setDraftCraftType);
  const setStructureType = usePatternRowsStore(
    (state) => state.setDraftStructureType,
  );
  const setStartDirection = usePatternRowsStore(
    (state) => state.setDraftStartDirection,
  );
  const setStartSide = usePatternRowsStore((state) => state.setDraftStartSide);
  const addRow = usePatternRowsStore((state) => state.addDraftRow);
  const duplicateRow = usePatternRowsStore((state) => state.duplicateDraftRow);
  const deleteRow = usePatternRowsStore((state) => state.deleteDraftRow);
  const updateRow = usePatternRowsStore((state) => state.updateDraftRow);
  const createProject = usePatternRowsStore((state) => state.createProject);
  const projectName = draftProject.name;
  const craftType = draftProject.craftType;
  const structureType = draftProject.structureType;
  const startDirection = draftProject.startDirection;
  const startSide = draftProject.startSide;
  const rows = draftProject.rows;
  const isCrochet = craftType === "crochet";
  const isKnitting = craftType === "knitting";
  const usesRounds = structureType === "round";
  const modeLabel = isCrochet ? messages.create.crochet : messages.create.knitting;
  const rowEyebrow = usesRounds
    ? messages.create.roundEyebrow
    : messages.create.rowEyebrow;
  const rowInstruction = usesRounds
    ? messages.create.roundInstruction
    : messages.create.rowInstruction;
  const addLabel = usesRounds ? messages.create.addRound : messages.create.addRow;
  const rowLabelTemplate = usesRounds
    ? messages.create.roundLabel
    : messages.create.rowLabel;
  const placeholders = isCrochet
    ? messages.create.crochetPlaceholders
    : messages.create.placeholders;
  const rowsEyebrow = usesRounds
    ? messages.create.crochetRowsEyebrow
    : messages.create.rowsEyebrow;
  const rowsTitle = usesRounds
    ? messages.create.crochetRowsTitle
    : messages.create.rowsTitle;
  const rowsDescription = usesRounds
    ? messages.create.crochetRowsDescription
    : messages.create.rowsDescription;
  const [openPatternHelperRowId, setOpenPatternHelperRowId] = useState<number | null>(
    null,
  );
  const [patternType, setPatternType] = useState<PatternHelperType>("rib-1x1");
  const [patternStitchCount, setPatternStitchCount] = useState("");
  const [seedStartingStitch, setSeedStartingStitch] = useState<StitchType>("K");
  const [patternHelperError, setPatternHelperError] = useState("");

  function getKnittingRowSide(rowIndex: number) {
    const rowNumber = rowIndex;
    const isOddRow = rowNumber % 2 === 1;

    return startSide === "RS"
      ? isOddRow
        ? "RS"
        : "WS"
      : isOddRow
        ? "WS"
        : "RS";
  }

  function openPatternHelper(rowId: number) {
    setOpenPatternHelperRowId((current) => (current === rowId ? null : rowId));
    setPatternType("rib-1x1");
    setPatternStitchCount("");
    setSeedStartingStitch("K");
    setPatternHelperError("");
  }

  function buildAlternatingInstruction(
    firstStitch: StitchType,
    secondStitch: StitchType,
    stitchCount: number,
  ) {
    const pairCount = Math.floor(stitchCount / 2);
    const hasRemainder = stitchCount % 2 === 1;
    const repeated = `${firstStitch}1, ${secondStitch}1 repeat ${pairCount}`;

    if (pairCount === 0) {
      return `${firstStitch}1`;
    }

    return hasRemainder ? `${repeated}, ${firstStitch}1` : repeated;
  }

  function buildPatternInstruction(
    nextPatternType: PatternHelperType,
    stitchCount: number,
    rowIndex: number,
  ) {
    if (nextPatternType === "rib-1x1") {
      if (stitchCount % 2 !== 0) {
        return {
          error: messages.create.patternInvalidEven,
          instruction: null,
        };
      }

      return {
        error: "",
        instruction: `K1, P1 repeat ${stitchCount / 2}`,
      };
    }

    if (nextPatternType === "rib-2x2") {
      if (stitchCount % 4 !== 0) {
        return {
          error: messages.create.patternInvalidDivisibleByFour,
          instruction: null,
        };
      }

      return {
        error: "",
        instruction: `K2, P2 repeat ${stitchCount / 4}`,
      };
    }

    if (nextPatternType === "stockinette") {
      const side = getKnittingRowSide(rowIndex);

      return {
        error: "",
        instruction: `${side === "RS" ? "K" : "P"}${stitchCount}`,
      };
    }

    if (nextPatternType === "garter") {
      return {
        error: "",
        instruction: `K${stitchCount}`,
      };
    }

    return {
      error: "",
      instruction: buildAlternatingInstruction(
        seedStartingStitch,
        seedStartingStitch === "K" ? "P" : "K",
        stitchCount,
      ),
    };
  }

  function applyPatternHelper(rowId: number, rowIndex: number) {
    const stitchCount = Number.parseInt(patternStitchCount, 10);

    if (Number.isNaN(stitchCount) || stitchCount <= 0) {
      setPatternHelperError(messages.create.patternInvalidStitchCount);
      return;
    }

    const result = buildPatternInstruction(patternType, stitchCount, rowIndex);

    if (result.error || !result.instruction) {
      setPatternHelperError(result.error);
      return;
    }

    updateRow(rowId, result.instruction);
    setOpenPatternHelperRowId(null);
    setPatternHelperError("");
    setPatternStitchCount("");
  }

  function handleStartTracking() {
    const projectId = createProject();

    if (!projectId) {
      return;
    }

    router.push(`/projects/${projectId}`);
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageCard>
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="eyebrow">{messages.create.projectNameEyebrow}</p>
            <h2 className="font-serif text-3xl text-thread-900">
              {messages.create.projectNameTitle}
            </h2>
          </div>

          <input
            type="text"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder={messages.create.projectNamePlaceholder}
            className="h-14 w-full rounded-full border border-cream-200 bg-white/80 px-5 text-sm text-thread-900 outline-none transition focus:border-sand-100 focus:bg-white"
          />
        </div>
      </PageCard>

      <PageCard>
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="eyebrow">{messages.create.craftTypeEyebrow}</p>
            <h2 className="font-serif text-3xl text-thread-900">
              {messages.create.craftTypeTitle}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-thread-700">
              {messages.create.craftTypeDescription}
            </p>
          </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCraftType("knitting")}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                craftType === "knitting"
                  ? "border-transparent bg-oat-100"
                  : "border-cream-200 bg-white/70"
              }`}
            >
              <p className="font-serif text-2xl text-thread-900">
                {messages.create.knitting}
              </p>
              <p className="mt-2 text-sm leading-6 text-thread-700">
                {messages.create.knittingDescription}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setCraftType("crochet")}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                craftType === "crochet"
                  ? "border-transparent bg-oat-100"
                  : "border-cream-200 bg-white/70"
              }`}
            >
              <p className="font-serif text-2xl text-thread-900">
                {messages.create.crochet}
              </p>
              <p className="mt-2 text-sm leading-6 text-thread-700">
                {messages.create.crochetDescription}
              </p>
            </button>
          </div>
        </div>
      </PageCard>

      {isKnitting ? (
        <PageCard>
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="eyebrow">{messages.create.knittingSetupEyebrow}</p>
              <h2 className="font-serif text-3xl text-thread-900">
                {messages.create.knittingSetupTitle}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-thread-700">
                {messages.create.knittingSetupDescription}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-medium text-thread-900">
                  {messages.create.startDirectionLabel}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setStartDirection("right")}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      startDirection === "right"
                        ? "border-transparent bg-oat-100"
                        : "border-cream-200 bg-white/70"
                    }`}
                  >
                    <p className="text-base font-medium text-thread-900">
                      {messages.create.directionRight}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartDirection("left")}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      startDirection === "left"
                        ? "border-transparent bg-oat-100"
                        : "border-cream-200 bg-white/70"
                    }`}
                  >
                    <p className="text-base font-medium text-thread-900">
                      {messages.create.directionLeft}
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-thread-900">
                  {messages.create.startSideLabel}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setStartSide("RS")}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      startSide === "RS"
                        ? "border-transparent bg-oat-100"
                        : "border-cream-200 bg-white/70"
                    }`}
                  >
                    <p className="text-base font-medium text-thread-900">RS</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartSide("WS")}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      startSide === "WS"
                        ? "border-transparent bg-oat-100"
                        : "border-cream-200 bg-white/70"
                    }`}
                  >
                    <p className="text-base font-medium text-thread-700">WS</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PageCard>
      ) : null}

      {isCrochet ? (
        <PageCard>
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="eyebrow">{messages.create.structureTypeEyebrow}</p>
              <h2 className="font-serif text-3xl text-thread-900">
                {messages.create.structureTypeTitle}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-thread-700">
                {messages.create.structureTypeDescription}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStructureType("row")}
                className={`rounded-[1.5rem] border p-5 text-left transition ${
                  structureType === "row"
                    ? "border-transparent bg-oat-100"
                    : "border-cream-200 bg-white/70"
                }`}
              >
                <p className="font-serif text-2xl text-thread-900">
                  {messages.create.rowMode}
                </p>
                <p className="mt-2 text-sm leading-6 text-thread-700">
                  {messages.create.rowModeDescription}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStructureType("round")}
                className={`rounded-[1.5rem] border p-5 text-left transition ${
                  structureType === "round"
                    ? "border-transparent bg-oat-100"
                    : "border-cream-200 bg-white/70"
                }`}
              >
                <p className="font-serif text-2xl text-thread-900">
                  {messages.create.roundMode}
                </p>
                <p className="mt-2 text-sm leading-6 text-thread-700">
                  {messages.create.roundModeDescription}
                </p>
              </button>
            </div>
          </div>
        </PageCard>
      ) : null}

      <PageCard>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="eyebrow">{rowsEyebrow}</p>
            <h2 className="font-serif text-3xl text-thread-900">
              {rowsTitle}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-thread-700">
              {rowsDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cream-200 bg-white/70 px-4 py-2 text-sm text-thread-700">
              {messages.create.selectedMode}: {craftType ? modeLabel : "-"}
            </span>
          </div>
        </div>
      </PageCard>

      <PageCard>
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="eyebrow">{rowEyebrow}</p>
            <h3 className="font-serif text-[1.9rem] leading-none text-thread-900">
              {rowsTitle}
            </h3>
          </div>

          <div className="rounded-[1.75rem] border border-cream-200 bg-white/40">
            {rows.map((row, index) => (
              (() => {
                const isCastOnRow = isKnitting && index === 0;

                return (
              <div
                key={row.id}
                className={`grid grid-cols-[44px_minmax(0,1fr)_auto] items-start gap-3 px-4 py-4 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:px-5 ${
                  index !== rows.length - 1 ? "border-b border-cream-200" : ""
                }`}
              >
                <div className="pt-3 text-sm font-medium tracking-[0.08em] text-thread-700">
                  {isCastOnRow
                    ? messages.create.castOnShort
                    : String(isKnitting ? index : index + 1).padStart(2, "0")}
                </div>

                <label className="block min-w-0">
                  <span className="sr-only">
                    {isCastOnRow
                      ? messages.create.castOnLabel
                      : `${format(rowLabelTemplate, {
                          number: String(isKnitting ? index : index + 1).padStart(2, "0"),
                        })} ${rowInstruction}`}
                  </span>
                  {isCastOnRow ? (
                    <div className="rounded-[1.25rem] border border-cream-200 bg-oat-100/70 px-4 py-4">
                      <p className="text-sm font-medium text-thread-900">
                        {messages.create.castOnLabel}
                      </p>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={row.text.replace(/^CO\s*/i, "")}
                        onChange={(event) =>
                          updateRow(row.id, `CO ${event.target.value || "0"}`)
                        }
                        placeholder={messages.create.castOnPlaceholder}
                        className="mt-3 h-12 w-full border-0 border-b border-cream-200 bg-transparent px-0 text-sm text-thread-900 outline-none transition placeholder:text-thread-700/70 focus:border-sand-100"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={row.text}
                        onChange={(event) => updateRow(row.id, event.target.value)}
                        placeholder={placeholders[index % placeholders.length]}
                        className="h-12 w-full border-0 border-b border-cream-200 bg-transparent px-0 text-sm text-thread-900 outline-none transition placeholder:text-thread-700/70 focus:border-sand-100"
                      />
                      {isKnitting ? (
                        <div className="space-y-3">
                          <button
                            type="button"
                            onClick={() => openPatternHelper(row.id)}
                            className="inline-flex h-9 items-center rounded-full border border-cream-200 bg-white/70 px-3 text-xs text-thread-700 transition hover:border-thread-700/30 hover:bg-white"
                          >
                            {messages.create.patternQuickInput}
                          </button>
                          {openPatternHelperRowId === row.id ? (
                            <div className="rounded-[1.25rem] border border-cream-200 bg-oat-100/55 p-3">
                              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-end">
                                <label className="space-y-2">
                                  <span className="text-xs text-thread-700">
                                    {messages.create.patternTypeLabel}
                                  </span>
                                  <select
                                    value={patternType}
                                    onChange={(event) =>
                                      setPatternType(
                                        event.target.value as PatternHelperType,
                                      )
                                    }
                                    className="h-10 w-full rounded-full border border-cream-200 bg-white/90 px-4 text-sm text-thread-900 outline-none transition focus:border-sand-100"
                                  >
                                    <option value="rib-1x1">
                                      {messages.create.pattern1x1Rib}
                                    </option>
                                    <option value="rib-2x2">
                                      {messages.create.pattern2x2Rib}
                                    </option>
                                    <option value="stockinette">
                                      {messages.create.patternStockinette}
                                    </option>
                                    <option value="garter">
                                      {messages.create.patternGarter}
                                    </option>
                                    <option value="seed">
                                      {messages.create.patternSeedStitch}
                                    </option>
                                  </select>
                                </label>
                                <label className="space-y-2">
                                  <span className="text-xs text-thread-700">
                                    {messages.create.totalStitchCountLabel}
                                  </span>
                                  <input
                                    type="number"
                                    min="1"
                                    inputMode="numeric"
                                    value={patternStitchCount}
                                    onChange={(event) => {
                                      setPatternStitchCount(event.target.value);
                                      setPatternHelperError("");
                                    }}
                                    className="h-10 w-full rounded-full border border-cream-200 bg-white/90 px-4 text-sm text-thread-900 outline-none transition focus:border-sand-100"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => applyPatternHelper(row.id, index)}
                                  className="inline-flex h-10 items-center justify-center rounded-full border border-cream-200 bg-white/90 px-4 text-sm text-thread-900 transition hover:border-thread-700/30 hover:bg-white"
                                >
                                  {messages.create.applyPattern}
                                </button>
                              </div>
                              {patternType === "seed" ? (
                                <div className="mt-3 max-w-[180px]">
                                  <label className="space-y-2">
                                    <span className="text-xs text-thread-700">
                                      {messages.create.startingStitchLabel}
                                    </span>
                                    <select
                                      value={seedStartingStitch}
                                      onChange={(event) =>
                                        setSeedStartingStitch(
                                          event.target.value as StitchType,
                                        )
                                      }
                                      className="h-10 w-full rounded-full border border-cream-200 bg-white/90 px-4 text-sm text-thread-900 outline-none transition focus:border-sand-100"
                                    >
                                      <option value="K">
                                        {messages.create.stitchKnit}
                                      </option>
                                      <option value="P">
                                        {messages.create.stitchPurl}
                                      </option>
                                    </select>
                                  </label>
                                </div>
                              ) : null}
                              {patternHelperError ? (
                                <p className="mt-2 text-xs text-thread-700">
                                  {patternHelperError}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )}
                  {row.parseError ? (
                    <p className="mt-2 text-xs text-thread-700">
                      {messages.create.parseErrorPrefix}: {row.parseError}
                    </p>
                  ) : null}
                </label>

                <div className="flex items-center gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => duplicateRow(row.id)}
                    disabled={isCastOnRow}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-thread-700 transition hover:border-cream-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={messages.create.duplicateRow}
                    title={messages.create.duplicateRow}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <rect x="9" y="9" width="10" height="10" rx="2" />
                      <path d="M5 15V7a2 2 0 0 1 2-2h8" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteRow(row.id)}
                    disabled={rows.length <= 1 || isCastOnRow}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-thread-700 transition hover:border-cream-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={messages.create.deleteRow}
                    title={messages.create.deleteRow}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M6 7h12" />
                      <path d="M9 7V5h6v2" />
                      <path d="M8 7l1 12h6l1-12" />
                    </svg>
                  </button>
                </div>
              </div>
                );
              })()
            ))}

            <div className="border-t border-cream-200 px-4 py-4 sm:px-5">
              <button
                type="button"
                onClick={addRow}
                className="pill-button h-11 px-4 hover:border-thread-700/30 hover:bg-white"
              >
                {addLabel}
              </button>
            </div>
          </div>
        </div>
      </PageCard>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleStartTracking}
          disabled={!craftType}
          className={`pill-button-accent h-12 px-5 hover:bg-sand-100 ${
            !craftType ? "opacity-50" : ""
          }`}
        >
          {messages.create.startTracking}
        </button>
      </div>
    </div>
  );
}
