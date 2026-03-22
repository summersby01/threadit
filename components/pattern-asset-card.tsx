"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import type { PatternAsset } from "@/stores/use-pattern-rows-store";

function getAssetTypeLabel(
  type: PatternAsset["type"],
  labels: ReturnType<typeof useI18n>["messages"]["library"]["assetTypes"],
) {
  switch (type) {
    case "pdf":
      return labels.pdf;
    case "image":
      return labels.image;
    case "youtube":
      return labels.youtube;
    default:
      return labels.link;
  }
}

export function PatternAssetCard({
  asset,
  selectable = false,
  selected = false,
  onToggle,
  showDetailLink = true,
}: {
  asset: PatternAsset;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (assetId: string) => void;
  showDetailLink?: boolean;
}) {
  const { messages } = useI18n();

  return (
    <div
      className={`rounded-[1.5rem] border p-4 ${
        selected ? "border-thread-500 bg-oat-100/60" : "border-cream-200 bg-cream-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cream-200 bg-oat-100/35 px-3 py-1 text-xs text-thread-700">
              {getAssetTypeLabel(asset.type, messages.library.assetTypes)}
            </span>
            {asset.category ? (
              <span className="rounded-full border border-cream-200 bg-cream-50 px-3 py-1 text-xs text-thread-700">
                {asset.category}
              </span>
            ) : null}
          </div>
          <h3 className="font-serif text-2xl text-thread-900">{asset.title}</h3>
          {asset.note ? (
            <p className="text-sm leading-6 text-thread-700">{asset.note}</p>
          ) : null}
          {asset.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {asset.tags.map((tag) => (
                <span
                  key={`${asset.id}-${tag}`}
                  className="rounded-full border border-cream-200 bg-cream-50 px-3 py-1 text-xs text-thread-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {selectable ? (
          <button
            type="button"
            onClick={() => onToggle?.(asset.id)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              selected
                ? "border-thread-500 bg-sage-100/15 text-thread-900"
                : "border-cream-200 bg-cream-50 text-thread-700 hover:bg-oat-100/30"
            }`}
          >
            {selected ? messages.library.selectedAsset : messages.library.selectAsset}
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={asset.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="pill-button h-10 px-4"
        >
          {messages.common.open}
        </a>
        {showDetailLink ? (
          <Link href={`/library/${asset.id}`} className="pill-button h-10 px-4">
            {messages.library.detailLink}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
