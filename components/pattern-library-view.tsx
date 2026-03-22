"use client";

import { useMemo, useState } from "react";
import { PatternAssetCard } from "@/components/pattern-asset-card";
import { PatternAssetForm } from "@/components/pattern-asset-form";
import { PageCard } from "@/components/page-card";
import { useI18n } from "@/components/i18n-provider";
import {
  usePatternRowsStore,
  type PatternAssetInput,
} from "@/stores/use-pattern-rows-store";

export function PatternLibraryView() {
  const { messages } = useI18n();
  const patternAssets = usePatternRowsStore((state) => state.patternAssets);
  const addPatternAsset = usePatternRowsStore((state) => state.addPatternAsset);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          patternAssets
            .map((asset) => asset.category)
            .filter((category) => category.length > 0),
        ),
      ),
    [patternAssets],
  );

  const filteredAssets = useMemo(
    () =>
      patternAssets.filter((asset) => {
        if (selectedType !== "all" && asset.type !== selectedType) {
          return false;
        }

        if (selectedCategory !== "all" && asset.category !== selectedCategory) {
          return false;
        }

        return true;
      }),
    [patternAssets, selectedCategory, selectedType],
  );

  function handleCreateAsset(input: PatternAssetInput) {
    return Boolean(addPatternAsset(input));
  }

  return (
    <section className="space-y-7 sm:space-y-8">
      <div className="space-y-3">
        <p className="eyebrow">{messages.library.libraryEyebrow}</p>
        <h1 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-thread-900 sm:text-3xl">
          {messages.library.title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-thread-700">
          {messages.library.description}
        </p>
      </div>

      <PageCard>
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-thread-900">
                {messages.library.filterByType}
              </span>
              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
                className="h-11 rounded-full border border-cream-200 bg-cream-50 px-4 text-thread-900 outline-none"
              >
                <option value="all">{messages.library.allTypes}</option>
                <option value="pdf">{messages.library.assetTypes.pdf}</option>
                <option value="image">{messages.library.assetTypes.image}</option>
                <option value="link">{messages.library.assetTypes.link}</option>
                <option value="youtube">{messages.library.assetTypes.youtube}</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-thread-900">
                {messages.library.filterByCategory}
              </span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="h-11 rounded-full border border-cream-200 bg-cream-50 px-4 text-thread-900 outline-none"
              >
                <option value="all">{messages.library.allCategories}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <PatternAssetForm
            onSubmit={handleCreateAsset}
            submitLabel={messages.library.saveAsset}
          />
        </div>
      </PageCard>

      {filteredAssets.length === 0 ? (
        <PageCard>
          <div className="rounded-[1.5rem] border border-cream-200 bg-cream-50 p-5">
            <p className="text-sm leading-6 text-thread-700">
              {messages.library.emptyLibraryDescription}
            </p>
          </div>
        </PageCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredAssets.map((asset) => (
            <PatternAssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </section>
  );
}
