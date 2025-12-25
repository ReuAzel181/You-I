"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAnalytics } from "@/providers/SettingsProvider";

export default function LearnPage() {
  const { analyticsEnabled, trackEvent } = useAnalytics();

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_learn", { path: "/learn" });
  }, [analyticsEnabled, trackEvent]);

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section className="border-b border-zinc-200 bg-white/80">
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Learn
                </div>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                  Learn accessibility and interface basics alongside your tools
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                  Short, practical guides that pair with YOU-I&apos;s tools so you can check
                  contrast, typography, and layouts while you design—not after.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 text-[11px] text-zinc-600 md:w-64">
                <p>
                  New to YOU-I? Start with contrast, then move into typography and workflow tips.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="#contrast-basics"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    Start with contrast
                  </Link>
                  <Link
                    href="#release-notes"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    What&apos;s new
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-emerald-950/95">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-7">
            <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-500/70 bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-4 text-[11px] leading-relaxed text-emerald-50 shadow-[0_16px_40px_rgba(16,185,129,0.5)] sm:px-6 sm:py-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="inline-flex items-center gap-2 rounded-full bg-emerald-900/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-50/90">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
                    NO ADS · NO LOGIN
                  </p>
                  <p>
                    Core tools stay free of ads and don&apos;t require an account. Learn how to use
                    them alongside your existing design workflow.
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-white"
                  >
                    Open tools
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-full border border-emerald-100/80 bg-emerald-600/20 px-3 py-1.5 text-[11px] font-medium text-emerald-50/90 transition-transform hover:-translate-y-0.5 hover:bg-emerald-500/40"
                  >
                    See future plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contrast-basics" className="py-8 md:py-10">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
              <article className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-red-500">
                  WCAG contrast basics
                </p>
                <h2 className="mt-1 text-sm font-semibold text-zinc-900">
                  Keep body text and UI labels above AA contrast
                </h2>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Most interface text should meet at least AA contrast: 4.5:1 for regular body text
                  and 3:1 for larger text. That applies to buttons, navigation, form labels, and any
                  copy users rely on to move through your UI.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Check your primary text-on-surface pairs first: body on background, buttons on
                      brand, and muted text on subtle surfaces.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Treat disabled text as an exception—keep it legible, but lower contrast can
                      help communicate state.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Avoid relying on color alone. Use contrast plus weight, size, or patterns for
                      critical information.
                    </span>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/tools/color-contrast-checker"
                    className="inline-flex items-center justify-center rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
                  >
                    Open contrast checker
                  </Link>
                  <Link
                    href="/solutions"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                  >
                    See how teams use it
                  </Link>
                </div>
              </article>

              <aside className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4 text-[11px] leading-relaxed text-zinc-600 sm:px-5 sm:py-5">
                <p className="font-medium text-zinc-800">Quick rule of thumb</p>
                <p className="mt-1">
                  If it&apos;s text and it&apos;s important, aim for AA or better. Use YOU-I&apos;s
                  contrast checker to save a preset for your brand, neutral, and semantic colors so
                  you don&apos;t have to re-check every time.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section id="design-handoff" className="pb-8 md:pb-10">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
              <article className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-violet-500">
                  Design handoff tips
                </p>
                <h2 className="mt-1 text-sm font-semibold text-zinc-900">
                  Hand off color, type, and spacing that already works
                </h2>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Handoff goes smoother when specs reference tokens and reusable presets instead of
                  one-off values. YOU-I&apos;s tools help you capture the decisions that matter
                  before the handoff meeting.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span>
                      Use the Ratio Calculator to record the viewport and component sizes you design
                      against.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span>
                      Convert EM and percent spacing values before they reach your CSS or design
                      tokens.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span>
                      Try real copy in the Google Font Explorer so your type choices already account
                      for long labels and edge cases.
                    </span>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/pinned-tools"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
                  >
                    Set up a workspace
                  </Link>
                  <Link
                    href="/tools/ratio-calculator"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
                  >
                    Open Ratio Calculator
                  </Link>
                </div>
              </article>

              <aside className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4 text-[11px] leading-relaxed text-zinc-600 sm:px-5 sm:py-5">
                <p className="font-medium text-zinc-800">A simple handoff checklist</p>
                <p className="mt-1">
                  Share a single YOU-I workspace preset with the developers you work with. Include
                  your key color pairs, base font stack, and a couple of viewport examples so
                  everyone talks about the same reference points.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section id="release-notes" className="pb-10">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-left text-[11px] leading-relaxed text-zinc-600 shadow-sm sm:p-6">
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">
                Release notes
              </p>
              <h2 className="mt-1 text-sm font-semibold text-zinc-900">
                What&apos;s new in YOU-I
              </h2>
              <ul className="mt-3 space-y-1.5">
                <li>
                  <span className="font-medium text-zinc-800">Solutions examples.</span> Explore
                  real-world ways teams use YOU-I day to day, with examples for product teams,
                  agencies, and solo designers, now in the Resources page.
                </li>
                <li>
                  <span className="font-medium text-zinc-800">Pinned workspace tools.</span> Pin the
                  tools you use every week so they&apos;re waiting on the homepage when you return.
                </li>
                <li>
                  <span className="font-medium text-zinc-800">Google Font Explorer.</span> Browse
                  focused font previews with your own copy and quick links back to your workspace.
                </li>
                <li>
                  <span className="font-medium text-zinc-800">Learn library.</span> This page brings
                  together contrast guidance, handoff tips, and a quick snapshot of what&apos;s new.
                </li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  View pricing
                </Link>
                <Link
                  href="/resources#solutions"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  View Solutions section
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
