"use client";

import { useI18n } from "@/components/i18n-provider";
import { CreatePatternForm } from "@/components/create-pattern-form";

export default function CreatePage() {
  const { messages } = useI18n();

  return (
    <section className="space-y-7 sm:space-y-8">
      <div className="space-y-3">
        <p className="eyebrow">{messages.create.eyebrow}</p>
        <h1 className="font-serif text-4xl leading-tight text-thread-900">
          {messages.create.title}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-thread-700">
          {messages.create.description}
        </p>
      </div>

      <CreatePatternForm />
    </section>
  );
}
