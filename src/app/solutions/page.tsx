"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAnalytics } from "@/providers/SettingsProvider";

export default function SolutionsPage() {
  const { analyticsEnabled, trackEvent } = useAnalytics();

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_solutions", { path: "/solutions" });
  }, [analyticsEnabled, trackEvent]);

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section className="border-b border-zinc-200 bg-white/80">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-start md:justify-between md:px-8 md:py-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Solutions
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Ways teams use YOU-I day to day
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
                Combine tools, presets, and your workspace to support real interface work: from
                quick checks before shipping to exploring new palettes and typography systems.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 text-[11px] text-zinc-600">
              <p className="max-w-xs">
                Not sure where to start? Set up a workspace for one project, then add tools as you
                discover what you check most often.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/pinned-tools"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  Open workspace
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="py-8 md:py-10">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3 md:px-8">
            <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
              <p className="text-[11px] font-medium uppercase tracking-wide text-red-500">
                Product teams
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-900">
                Keep contrast-safe components in every design file
              </h2>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                Pair the color contrast checker with your workspace so primary, secondary, and
                surface colors are always available with AA/AAA status visible.
              </p>
              <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Pin color pairs you reuse across flows and products.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Save presets for brand, neutral, and semantic palettes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Share a single workspace preset with designers and developers.</span>
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/tools/color-contrast-checker"
                  className="inline-flex items-center justify-center rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
                >
                  Open contrast checker
                </Link>
              </div>
            </article>
            <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
              <p className="text-[11px] font-medium uppercase tracking-wide text-violet-500">
                Agencies and studios
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-900">
                Switch between client workspaces in one place
              </h2>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                Use presets to represent different clients, products, or themes. Keep example ratios
                and font stacks handy when presenting options.
              </p>
              <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                  <span>Create a preset per client with contrast, fonts, and notes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                  <span>Use the ratio calculator for layout explorations and responsive frames.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                  <span>Generate structured lorem when mocks need clearer hierarchy.</span>
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/pinned-tools"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
                >
                  Organize workspace presets
                </Link>
              </div>
            </article>
            <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                Solo designers and devs
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-900">
                Keep small accessibility checks lightweight
              </h2>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                Use YOU-I as a side panel next to your design or code editor for quick checks you
                repeat every week.
              </p>
              <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Check new color ideas without leaving your current file.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Convert EM and percent values when adjusting spacing in CSS.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Explore Google Fonts with your real copy before committing.</span>
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  Browse all tools
                </Link>
              </div>
            </article>
          </div>
        </section>
        <section className="pb-10">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4 text-[11px] leading-relaxed text-zinc-600 sm:px-5 sm:py-5">
              <p className="font-medium text-zinc-800">Try this next</p>
              <p className="mt-1">
                Pick one recurring accessibility check in your week—like verifying heading contrast
                or testing line-height—and set up a preset in your workspace for it. Reuse that
                setup the next time you design, so checking it becomes a habit instead of a task.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

