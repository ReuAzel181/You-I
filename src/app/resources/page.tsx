"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAnalytics } from "@/providers/SettingsProvider";
import { PageTransitionLink } from "@/components/PageTransitionLink";

export default function ResourcesPage() {
  const { analyticsEnabled, trackEvent } = useAnalytics();

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_resources", { path: "/resources" });
  }, [analyticsEnabled, trackEvent]);

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section className="border-b border-zinc-200 bg-white/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8 md:py-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Learn
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Accessibility resources for everyday interface work
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
                Use these guides alongside YOU-I&apos;s tools to check contrast, typography, and
                content structure while you design.
              </p>
            </div>
            <PageTransitionLink
              href="/"
              className="inline-flex h-8 items-center gap-1 rounded-full border border-red-300 px-3 text-[11px] font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
            >
              <span>Back</span>
            </PageTransitionLink>
          </div>
        </section>
        <section id="guides" className="py-8 md:py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:px-8">
            <div className="flex-1 space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Contrast and color checks
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                  Pair the Color Contrast Checker with quick rules of thumb so you can move faster
                  than the spec every time you adjust a palette.
                </p>
                <ul className="mt-4 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Start by checking your primary text on its most common background using the{" "}
                      <PageTransitionLink
                        href="/tools/color-contrast-checker"
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        Color Contrast Checker
                      </PageTransitionLink>
                      . Aim for at least 4.5&nbsp;:&nbsp;1 for body text and 3&nbsp;:&nbsp;1 for
                      large headings.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Test interactive states together: default, hover, focus, and disabled. Keep
                      contrast consistent across all four so affordances stay obvious.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      When exploring palettes, pin color combinations that pass AA/AAA in your{" "}
                      <PageTransitionLink
                        href="/pinned-tools"
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        workspace
                      </PageTransitionLink>{" "}
                      so you can reuse them across projects.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      For the full WCAG reference on contrast, see{" "}
                      <a
                        href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        Contrast (Minimum)
                      </a>
                      .
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Typography and spacing
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                  Use ratio-based layouts and EM/percent conversions to keep body text readable and
                  headings consistent across breakpoints.
                </p>
                <ul className="mt-4 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Use the{" "}
                      <PageTransitionLink
                        href="/tools/ratio-calculator"
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        Ratio Calculator
                      </PageTransitionLink>{" "}
                      to keep heading and body sizes related. Try keeping line-heights between 1.4
                      and 1.6 for long-form text.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Convert EM and percent values with the{" "}
                      <PageTransitionLink
                        href="/tools/em-to-percent-converter"
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        Unit Converter
                      </PageTransitionLink>{" "}
                      before handing off specs so spacing behaves as expected in code.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      When pairing fonts in the{" "}
                      <PageTransitionLink
                        href="/tools/google-font-explorer"
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        Google Font Explorer
                      </PageTransitionLink>
                      , test headings at real viewport widths instead of only looking at specimen
                      rows.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full space-y-4 md:w-[320px]">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Copy and placeholder content
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                  Use structured placeholder text so reviewers can spot hierarchy, not lorem noise.
                </p>
                <ul className="mt-4 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Generate titles, definitions, and lists with the{" "}
                      <PageTransitionLink
                        href="/tools/lorem-placeholder-generator"
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        lorem placeholder generator
                      </PageTransitionLink>{" "}
                      so each block hints at the real content type.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Switch casing modes to mimic how labels, sentences, and navigation items will
                      appear in the final product.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Keep presets for quotes, definitions, and title-plus-list patterns in your{" "}
                      <PageTransitionLink
                        href="/pinned-tools"
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        workspace
                      </PageTransitionLink>{" "}
                      so writers and designers start from the same structures.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-[11px] leading-relaxed text-zinc-600 sm:p-6">
                <p className="font-medium text-zinc-800">
                  Working with a team?
                </p>
                <p className="mt-1">
                  Share this page with designers, developers, and writers as a single place to align
                  on contrast, typography, and content defaults. Then pin the tools you use together
                  in a shared workspace.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="solutions" className="border-t border-zinc-100 bg-[var(--background)] py-8 md:py-10">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Ways teams use YOU-I
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                  Combine tools, presets, and your workspace
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
                  See how different teams pair YOU-I&apos;s tools with their own files: from quick
                  pre-ship checks to everyday layout and typography explorations.
                </p>
              </div>
              <div className="flex w-full max-w-xs flex-col items-start gap-2 self-end text-[11px] text-zinc-600 md:w-auto md:self-auto md:items-end">
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
            <div className="grid gap-4 md:grid-cols-3">
              <article className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm sm:p-6">
                <p className="text-[11px] font-medium uppercase tracking-wide text-red-500">
                  Product teams
                </p>
                <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                  Keep contrast-safe components in every design file
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Pair the Color Contrast Checker with your workspace so primary, secondary, and
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
                <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                  Switch between client workspaces in one place
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-600">
                  Use presets to represent different clients, products, or themes. Keep example
                  ratios and font stacks handy when presenting options.
                </p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span>Create a preset per client with contrast, fonts, and notes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500" />
                    <span>Use the Ratio Calculator for layout explorations and responsive frames.</span>
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
                <h3 className="mt-1 text-sm font-semibold text-zinc-900">
                  Keep small accessibility checks lightweight
                </h3>
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
            <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-4 text-[11px] leading-relaxed text-zinc-600 sm:px-5 sm:py-5">
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
