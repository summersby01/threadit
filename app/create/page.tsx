import { CreatePatternForm } from "@/components/create-pattern-form";

export default function CreatePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-thread-700/70">
          Create
        </p>
        <h1 className="font-serif text-4xl text-thread-900">
          Pattern input
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-thread-700">
          Build out row instructions for a project before moving into the
          tracker. This page only captures row text and structure for now.
        </p>
      </div>

      <CreatePatternForm />
    </section>
  );
}
