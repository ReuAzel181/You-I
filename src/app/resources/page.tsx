"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAnalytics } from "@/providers/SettingsProvider";

export default function ResourcesPage() {
  const { analyticsEnabled, trackEvent } = useAnalytics();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_resources", { path: "/resources" });
  }, [analyticsEnabled, trackEvent]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setHasHydrated(true);
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, []);

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        {!hasHydrated ? (
          <ResourcesSkeleton />
        ) : (
          <section
          id="solutions"
          className="border-t border-zinc-100 bg-[var(--background)] py-8 md:py-10"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Guides for each tool
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                  Learn how each piece fits into your workflow
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
                  Browse short, practical guides for every YOU-I tool. Each card explains when to
                  reach for it, what to look for, and how it pairs with your workspace.
                </p>
              </div>
              <div className="flex w-full max-w-xs flex-col items-start gap-2 self-end text-[11px] text-zinc-600 md:w-auto md:self-auto md:items-end">
                <p className="max-w-xs">
                  Not sure where to start? Pick one tool below and set up a workspace preset for the
                  checks you run most often.
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
            <div className="grid gap-4 md:grid-cols-3">
              <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-red-500">
                  Color Contrast Checker
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                  Make contrast checks part of every component
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Test text and background pairs in seconds, then save the ones that work. Use it
                  while you name tokens, document color roles, and review handoff files so every
                  state in a component stays readable.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>Check body text, large headings, and UI states in one place.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>Compare AA and AAA thresholds before committing to a palette.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>Pin your approved pairs in the workspace for future projects.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Use saved pairs as a single reference when reviewing mocks with teammates.
                    </span>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/tools/color-contrast-checker"
                    className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-3 py-1.5 text-[11px] font-medium text-red-700 transition-transform hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
                  >
                    Open Color Contrast Checker
                  </Link>
                </div>
              </article>
              <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-violet-500">
                  Ratio Calculator
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                  Keep typography scales and spacing predictable
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Explore type scales and layout ratios before you design. Use the same ratios when
                  you move from mockups to CSS or design tokens so line-heights and spacing feel
                  deliberate instead of improvised.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span>Map heading levels to a consistent scale for your project.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span>Translate ratios into rem or px values for implementation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span>Save your favorite scales as presets to reuse across files.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span>Share a single scale with developers so tokens and CSS match.</span>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/tools/ratio-calculator"
                    className="inline-flex items-center justify-center rounded-full border border-violet-200 bg-white px-3 py-1.5 text-[11px] font-medium text-violet-700 transition-transform hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
                  >
                    Open Ratio Calculator
                  </Link>
                </div>
              </article>
              <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                  Unit Converter
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                  Quickly translate between px, rem, em, and percent
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Move between design specs and implementation without guessing. Convert spacing and
                  typography values while you work in Figma, CSS, or Tailwind, and keep a single
                  source of truth for the numbers you hand off.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Convert rem-based spacing back to px when reviewing designs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Keep one base font size and reuse it across all conversions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Share exact CSS values with developers during handoff.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Spot inconsistent values early by converting everything through one tool.</span>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/tools/em-to-percent-converter"
                    className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[11px] font-medium text-emerald-700 transition-transform hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    Open Unit Converter
                  </Link>
                </div>
              </article>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-sky-500">
                  Google Font Explorer
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                  Try real copy with Google Fonts before you commit
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Preview headings, body text, and UI labels with the fonts you plan to use. Keep
                  contrast and sizing in mind while you explore, so your final choices feel
                  dependable in real layouts.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                    <span>Test type pairs with real interface copy instead of lorem ipsum.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                    <span>Check how different weights behave at small sizes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                    <span>Save favorite combinations as workspace notes or presets.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                    <span>Compare a few key screens side by side before locking in a family.</span>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/tools/google-font-explorer"
                    className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-white px-3 py-1.5 text-[11px] font-medium text-sky-700 transition-transform hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                  >
                    Open Google Font Explorer
                  </Link>
                </div>
              </article>
              <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-amber-500">
                  Placeholder Generator
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                  Use structured placeholder copy instead of noise
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Swap lorem ipsum for titles, definitions, and list patterns that match real
                  content. Reviewers can understand hierarchy at a glance and spot missing states
                  faster.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>Generate copy by block type, not just character count.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>Match casing to labels, navigation, or long-form content.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>Save go-to patterns as presets in your workspace.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span>Share realistic placeholder sets with writers during early reviews.</span>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/tools/lorem-placeholder-generator"
                    className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[11px] font-medium text-amber-700 transition-transform hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                  >
                    Open Placeholder Generator
                  </Link>
                </div>
              </article>
              <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-fuchsia-500">
                  SVG Wave Generator
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                  Add accessible decoration between sections
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Create SVG waves for hero breaks and section dividers without heavy images. Keep
                  backgrounds light so contrast stays predictable and sections feel connected
                  instead of abrupt.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                    <span>Match wave colors to your surface tokens and accents.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                    <span>Export SVG, PNG, or JPG depending on your stack.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                    <span>Keep previews side‑by‑side with your layout while you fine‑tune.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                    <span>Export a few variations so marketing and product can share a system.</span>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/tools/svg-wave-generator"
                    className="inline-flex items-center justify-center rounded-full border border-fuchsia-200 bg-white px-3 py-1.5 text-[11px] font-medium text-fuchsia-700 transition-transform hover:-translate-y-0.5 hover:border-fuchsia-300 hover:bg-fuchsia-50 hover:text-fuchsia-800"
                  >
                    Open SVG Wave Generator
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ResourcesSkeleton() {
  return (
    <section className="border-t border-zinc-100 bg-[var(--background)] py-8 md:py-10">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-medium text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
              <span className="h-3 w-40 rounded-full bg-zinc-200" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-64 rounded-full bg-zinc-200" />
              <div className="h-3 w-72 rounded-full bg-zinc-200" />
              <div className="h-3 w-60 rounded-full bg-zinc-200" />
            </div>
          </div>
          <div className="flex w-full max-w-xs flex-col items-start gap-2 self-end md:w-auto md:self-auto md:items-end">
            <div className="h-3 w-40 rounded-full bg-zinc-200" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-28 rounded-full bg-zinc-200" />
              <div className="h-7 w-28 rounded-full bg-zinc-100" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={index}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="h-3 w-32 rounded-full bg-zinc-200" />
              <div className="mt-2 h-4 w-40 rounded-full bg-zinc-200" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full rounded-full bg-zinc-100" />
                <div className="h-3 w-5/6 rounded-full bg-zinc-100" />
                <div className="h-3 w-3/4 rounded-full bg-zinc-100" />
              </div>
              <div className="mt-4 h-7 w-36 rounded-full bg-zinc-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
