"use client";

import Link from "next/link";
import { PageCard } from "@/components/page-card";
import { usePatternRowsStore } from "@/stores/use-pattern-rows-store";

const placeholders = ["K10, P10", "*K2, P2* repeat 5"];

export function CreatePatternForm() {
  const rows = usePatternRowsStore((state) => state.rows);
  const addRow = usePatternRowsStore((state) => state.addRow);
  const updateRow = usePatternRowsStore((state) => state.updateRow);

  return (
    <div className="space-y-6">
      <PageCard className="bg-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-thread-700/60">
              Pattern Rows
            </p>
            <h2 className="font-serif text-3xl text-thread-900">
              Add your row instructions
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-thread-700">
              Start with three rows and keep adding more as needed. Parsing and
              validation are intentionally not implemented yet.
            </p>
          </div>

          <button
            type="button"
            onClick={addRow}
            className="inline-flex h-12 items-center justify-center rounded-full border border-thread-700/15 bg-cream-50 px-5 text-sm font-medium text-thread-900 hover:border-thread-700/30"
          >
            + Add Row
          </button>
        </div>
      </PageCard>

      <div className="space-y-4">
        {rows.map((row, index) => (
          <PageCard key={row.id} className="bg-white p-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-thread-700/55">
                    Instruction
                  </p>
                  <h3 className="mt-2 font-serif text-2xl text-thread-900">
                    Row {index + 1}
                  </h3>
                </div>
                <div className="rounded-full bg-cream-50 px-3 py-1 text-xs font-medium text-thread-700">
                  Step {index + 1}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-thread-900">
                  Row instruction
                </span>
                <input
                  type="text"
                  value={row.text}
                  onChange={(event) => updateRow(row.id, event.target.value)}
                  placeholder={placeholders[index % placeholders.length]}
                  className="h-14 w-full rounded-3xl border border-thread-700/10 bg-cream-50 px-4 text-sm text-thread-900 outline-none transition focus:border-thread-700/30 focus:bg-white"
                />
              </label>

              <div className="rounded-3xl bg-cream-50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-thread-700/55">
                  Parsed steps
                </p>
                {row.parsedSteps.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {row.parsedSteps.map((step, stepIndex) => (
                      <span
                        key={`${row.id}-${stepIndex}`}
                        className="rounded-full bg-white px-3 py-1 text-sm font-medium text-thread-900 shadow-sm"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-thread-700">
                    Enter a simple instruction to preview expanded steps.
                  </p>
                )}
              </div>
            </div>
          </PageCard>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex h-12 items-center justify-center rounded-full border border-thread-700/15 bg-white px-5 text-sm font-medium text-thread-900 hover:border-thread-700/30"
        >
          + Add Row
        </button>
        <Link
          href="/tracker"
          className="inline-flex h-12 items-center justify-center rounded-full bg-thread-700 px-5 text-sm font-medium text-white hover:bg-thread-900"
        >
          Start Tracking
        </Link>
      </div>
    </div>
  );
}
