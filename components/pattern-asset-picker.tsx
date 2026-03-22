"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { PatternAssetCard } from "@/components/pattern-asset-card";
import { PatternAssetForm } from "@/components/pattern-asset-form";
import {
  usePatternRowsStore,
  type PatternAssetInput,
} from "@/stores/use-pattern-rows-store";

export function PatternAssetPicker({
  selectedAssetIds,
  onChange,
}: {
  selectedAssetIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const { messages } = useI18n();
  const patternAssets = usePatternRowsStore((state) => state.patternAssets);
  const addPatternAsset = usePatternRowsStore((state) => state.addPatternAsset);
  const [isAddingAsset, setIsAddingAsset] = useState(false);

  const selectedAssetIdSet = useMemo(
    () => new Set(selectedAssetIds),
    [selectedAssetIds],
  );

  function toggleAsset(assetId: string) {
    if (selectedAssetIdSet.has(assetId)) {
      onChange(selectedAssetIds.filter((id) => id !== assetId));
      return;
    }

    onChange([...selectedAssetIds, assetId]);
  }

  function handleCreateAsset(input: PatternAssetInput) {
    const createdAssetId = addPatternAsset(input);

    if (!createdAssetId) {
      return false;
    }

    onChange([...selectedAssetIds, createdAssetId]);
    setIsAddingAsset(false);
    return true;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{messages.library.libraryEyebrow}</p>
          <h3 className="font-serif text-[1.9rem] leading-none text-thread-900">
            {messages.library.projectAssetsTitle}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-thread-700">
            {messages.library.projectAssetsDescription}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddingAsset((current) => !current)}
          className="pill-button h-10 px-4"
        >
          {isAddingAsset
            ? messages.library.cancelAddAsset
            : messages.library.addNewAsset}
        </button>
      </div>

      {isAddingAsset ? (
        <PatternAssetForm
          onSubmit={handleCreateAsset}
          submitLabel={messages.library.saveAsset}
        />
      ) : null}

      {patternAssets.length === 0 ? (
        <div className="rounded-[1.5rem] border border-cream-200 bg-cream-50 p-5">
          <p className="text-sm leading-6 text-thread-700">
            {messages.library.emptyLibraryDescription}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {patternAssets.map((asset) => (
            <PatternAssetCard
              key={asset.id}
              asset={asset}
              selectable
              selected={selectedAssetIdSet.has(asset.id)}
              onToggle={toggleAsset}
            />
          ))}
        </div>
      )}
    </div>
  );
}
