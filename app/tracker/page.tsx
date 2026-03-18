"use client";

import { PageCard } from "@/components/page-card";
import { usePatternRowsStore } from "@/stores/use-pattern-rows-store";

export default function TrackerPage() {
  const rows = usePatternRowsStore((state) => state.rows);
  const currentRow = usePatternRowsStore((state) => state.currentRow);
  const currentStep = usePatternRowsStore((state) => state.currentStep);
  const advanceSteps = usePatternRowsStore((state) => state.advanceSteps);
  const undoStep = usePatternRowsStore((state) => state.undoStep);

  const activeRow = rows[currentRow];
  const activeStepValue = activeRow?.parsedSteps[currentStep];
  const totalSteps = rows.reduce((sum, row) => sum + row.parsedSteps.length, 0);
  const completedStepsBeforeRow = rows
    .slice(0, currentRow)
    .reduce((sum, row) => sum + row.parsedSteps.length, 0);
  const overallStep = activeStepValue
    ? completedStepsBeforeRow + currentStep + 1
    : 0;
  const hasParsedSteps = totalSteps > 0;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-thread-700/70">
          Tracker
        </p>
        <h1 className="font-serif text-4xl text-thread-900">
          Pattern tracker
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-thread-700">
          Move through each parsed stitch step by step. Progress stays calm and
          focused, with the current stitch highlighted in place.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <PageCard className="bg-white">
          {hasParsedSteps ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-cream-50 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-thread-700/55">
                    Current row
                  </p>
                  <p className="mt-3 font-serif text-3xl text-thread-900">
                    Row {currentRow + 1}
                  </p>
                </div>
                <div className="rounded-3xl bg-cream-50 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-thread-700/55">
                    Current step
                  </p>
                  <p className="mt-3 font-serif text-3xl text-thread-900">
                    {currentStep + 1}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-thread-900 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-white/55">
                  Active stitch
                </p>
                <p className="mt-3 font-serif text-5xl">{activeStepValue}</p>
                <p className="mt-3 text-sm text-white/75">
                  Step {overallStep} of {totalSteps}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => advanceSteps(1)}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-thread-700 px-5 text-sm font-medium text-white hover:bg-thread-900"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => advanceSteps(5)}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-thread-700/15 bg-cream-50 px-5 text-sm font-medium text-thread-900 hover:border-thread-700/30"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={undoStep}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-thread-700/15 bg-white px-5 text-sm font-medium text-thread-900 hover:border-thread-700/30"
                >
                  Undo
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-cream-50 p-6">
              <p className="text-sm font-medium text-thread-900">
                No parsed steps yet
              </p>
              <p className="mt-2 text-sm leading-6 text-thread-700">
                Add row instructions on the create page to start tracking stitch
                progress here.
              </p>
            </div>
          )}
        </PageCard>

        <div className="space-y-4">
          {rows.map((row, rowIndex) => {
            const isActiveRow = rowIndex === currentRow;

            return (
              <PageCard key={row.id} className="bg-white p-5 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-thread-700/55">
                        Parsed row
                      </p>
                      <h2 className="mt-2 font-serif text-2xl text-thread-900">
                        Row {rowIndex + 1}
                      </h2>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isActiveRow
                          ? "bg-thread-700 text-white"
                          : "bg-cream-50 text-thread-700"
                      }`}
                    >
                      {row.parsedSteps.length} steps
                    </div>
                  </div>

                  {row.parsedSteps.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {row.parsedSteps.map((step, stepIndex) => {
                        const isCurrentStep =
                          rowIndex === currentRow && stepIndex === currentStep;

                        return (
                          <span
                            key={`${row.id}-${stepIndex}`}
                            className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                              isCurrentStep
                                ? "bg-thread-500 text-white shadow-soft"
                                : "bg-cream-50 text-thread-900"
                            }`}
                          >
                            {step}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-thread-700">
                      No steps available for this row yet.
                    </p>
                  )}
                </div>
              </PageCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
