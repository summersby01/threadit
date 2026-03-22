"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { PageCard } from "@/components/page-card";
import { PatternAssetCard } from "@/components/pattern-asset-card";
import { usePatternRowsStore } from "@/stores/use-pattern-rows-store";

export function PatternAssetDetailView({ assetId }: { assetId: string }) {
  const { messages } = useI18n();
  const asset = usePatternRowsStore((state) =>
    state.patternAssets.find((item) => item.id === assetId),
  );
  const linkedProjects = usePatternRowsStore((state) =>
    state.projects.filter((project) => project.patternAssetIds.includes(assetId)),
  );

  if (!asset) {
    return (
      <section className="space-y-7 sm:space-y-8">
        <PageCard>
          <div className="rounded-[1.5rem] border border-cream-200 bg-cream-50 p-5">
            <p className="font-medium text-thread-900">
              {messages.library.assetNotFoundTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-thread-700">
              {messages.library.assetNotFoundDescription}
            </p>
            <Link href="/library" className="pill-button mt-4 h-10 px-4">
              {messages.library.backToLibrary}
            </Link>
          </div>
        </PageCard>
      </section>
    );
  }

  return (
    <section className="space-y-7 sm:space-y-8">
      <div className="space-y-3">
        <p className="eyebrow">{messages.library.assetDetailEyebrow}</p>
        <h1 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-thread-900 sm:text-3xl">
          {asset.title}
        </h1>
      </div>

      <PageCard>
        <PatternAssetCard asset={asset} showDetailLink={false} />
      </PageCard>

      <PageCard>
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-thread-900">
            {messages.library.linkedProjectsTitle}
          </h2>
          {linkedProjects.length === 0 ? (
            <p className="text-sm leading-6 text-thread-700">
              {messages.library.noLinkedProjects}
            </p>
          ) : (
            <div className="grid gap-3">
              {linkedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="rounded-[1.25rem] border border-cream-200 bg-cream-50 px-4 py-4 transition hover:bg-oat-100/30"
                >
                  <p className="font-medium text-thread-900">{project.name}</p>
                  <p className="mt-2 text-sm text-thread-700">
                    {messages.tracker.trackingModeLabel}:{" "}
                    {project.trackingMode === "pattern"
                      ? messages.tracker.trackingModePattern
                      : project.trackingMode === "progress"
                        ? messages.tracker.trackingModeProgress
                        : messages.tracker.trackingModeCounter}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageCard>
    </section>
  );
}
