"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { PageCard } from "@/components/page-card";
import { usePatternRowsStore } from "@/stores/use-pattern-rows-store";

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
                    <input
                      type="text"
                      value={row.text}
                      onChange={(event) => updateRow(row.id, event.target.value)}
                      placeholder={placeholders[index % placeholders.length]}
                      className="h-12 w-full border-0 border-b border-cream-200 bg-transparent px-0 text-sm text-thread-900 outline-none transition placeholder:text-thread-700/70 focus:border-sand-100"
                    />
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
