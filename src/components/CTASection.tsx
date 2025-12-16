import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center md:px-8 lg:py-16">
        <h2 className="max-w-xl text-balance text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
          Ready to start designing with accessible color from day one?
        </h2>
        <p className="max-w-xl text-sm text-zinc-600">
          Set up your first color pairs in seconds. Add more tools as YOU-I
          grows, without changing how you work.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/tools/color-contrast-checker"
            className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
          >
            Open color contrast checker
          </Link>
          <button className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50">
            Learn how WCAG ratios work
          </button>
        </div>
      </div>
    </section>
  );
}
