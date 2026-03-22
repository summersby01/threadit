"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import type {
  PatternAssetInput,
  PatternAssetType,
} from "@/stores/use-pattern-rows-store";

function buildInitialState(): PatternAssetInput {
  return {
    title: "",
    type: "pdf",
    sourceUrl: "",
    category: "",
    tags: [],
    note: "",
  };
}

export function PatternAssetForm({
  onSubmit,
  submitLabel,
}: {
  onSubmit: (input: PatternAssetInput) => boolean;
  submitLabel: string;
}) {
  const { messages } = useI18n();
  const [draft, setDraft] = useState<PatternAssetInput>(buildInitialState());
  const [tagsInput, setTagsInput] = useState("");

  function setField<Key extends keyof PatternAssetInput>(
    key: Key,
    value: PatternAssetInput[Key],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit() {
    const nextDraft = {
      ...draft,
      tags: tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const created = onSubmit(nextDraft);

    if (!created) {
      return;
    }

    setDraft(buildInitialState());
    setTagsInput("");
  }

  return (
    <div className="rounded-[1.5rem] border border-cream-200 bg-oat-100/35 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-thread-900">
            {messages.library.assetTitle}
          </span>
          <input
            type="text"
            value={draft.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder={messages.library.assetTitlePlaceholder}
            className="h-12 w-full rounded-[1rem] border border-cream-200 bg-cream-50 px-4 text-thread-900 outline-none transition focus:border-sand-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-thread-900">
            {messages.library.assetType}
          </span>
          <select
            value={draft.type}
            onChange={(event) => setField("type", event.target.value as PatternAssetType)}
            className="h-12 w-full rounded-[1rem] border border-cream-200 bg-cream-50 px-4 text-thread-900 outline-none transition focus:border-sand-100"
          >
            <option value="pdf">{messages.library.assetTypes.pdf}</option>
            <option value="image">{messages.library.assetTypes.image}</option>
            <option value="link">{messages.library.assetTypes.link}</option>
            <option value="youtube">{messages.library.assetTypes.youtube}</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-thread-900">
            {messages.library.assetCategory}
          </span>
          <input
            type="text"
            value={draft.category}
            onChange={(event) => setField("category", event.target.value)}
            placeholder={messages.library.assetCategoryPlaceholder}
            className="h-12 w-full rounded-[1rem] border border-cream-200 bg-cream-50 px-4 text-thread-900 outline-none transition focus:border-sand-100"
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-thread-900">
            {messages.library.assetUrl}
          </span>
          <input
            type="url"
            value={draft.sourceUrl}
            onChange={(event) => setField("sourceUrl", event.target.value)}
            placeholder={messages.library.assetUrlPlaceholder}
            className="h-12 w-full rounded-[1rem] border border-cream-200 bg-cream-50 px-4 text-thread-900 outline-none transition focus:border-sand-100"
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-thread-900">
            {messages.library.assetTags}
          </span>
          <input
            type="text"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder={messages.library.assetTagsPlaceholder}
            className="h-12 w-full rounded-[1rem] border border-cream-200 bg-cream-50 px-4 text-thread-900 outline-none transition focus:border-sand-100"
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-thread-900">
            {messages.library.assetNote}
          </span>
          <textarea
            value={draft.note}
            onChange={(event) => setField("note", event.target.value)}
            placeholder={messages.library.assetNotePlaceholder}
            className="min-h-28 w-full rounded-[1rem] border border-cream-200 bg-cream-50 px-4 py-3 text-thread-900 outline-none transition focus:border-sand-100"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={handleSubmit} className="pill-button-accent h-11 px-4">
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
