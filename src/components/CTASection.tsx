import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center md:px-8 lg:py-16">
        <h2 className="max-w-xl text-balance text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
          Keep your accessibility checks one shortcut away
        </h2>
        <p className="max-w-xl text-sm text-zinc-600">
          Pin the tools you use most, save presets for real projects, and come back to the same
          accessible defaults every time you design.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/pinned-tools"
            className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
          >
            Set up your workspace
          </Link>
          <Link
            href="/resources"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50"
          >
            Browse accessibility resources
          </Link>
        </div>
      </div>
    </section>
  );
}
