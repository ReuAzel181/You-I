"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAnalytics } from "@/providers/SettingsProvider";

export default function ResourcesPage() {
  const router = useRouter();
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
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-red-300 px-3 text-[11px] font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
            >
              <span>Back to tools</span>
            </button>
          </div>
        </section>
        <section className="py-8 md:py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:px-8">
            <div className="flex-1 space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Contrast and color checks
                </h2>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
                  Pair the color contrast checker with quick rules of thumb so you can move faster
                  than the spec every time you adjust a palette.
                </p>
                <ul className="mt-4 space-y-1.5 text-[11px] text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Start by checking your primary text on its most common background using the{" "}
                      <Link href="/tools/color-contrast-checker" className="font-medium text-red-600 hover:text-red-700">
                        color contrast checker
                      </Link>
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
                      <Link href="/pinned-tools" className="font-medium text-red-600 hover:text-red-700">
                        workspace
                      </Link>{" "}
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
                      <Link href="/tools/ratio-calculator" className="font-medium text-red-600 hover:text-red-700">
                        ratio calculator
                      </Link>{" "}
                      to keep heading and body sizes related. Try keeping line-heights between 1.4
                      and 1.6 for long-form text.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      Convert EM and percent values with the{" "}
                      <Link
                        href="/tools/em-to-percent-converter"
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        EM to percent converter
                      </Link>{" "}
                      before handing off specs so spacing behaves as expected in code.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>
                      When pairing fonts in the{" "}
                      <Link
                        href="/tools/google-font-explorer"
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        Google font explorer
                      </Link>
                      , test headings at real viewport widths instead of only looking at specimen
                      rows.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-[320px] space-y-4">
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
                      <Link
                        href="/tools/lorem-placeholder-generator"
                        className="font-medium text-red-600 hover:text-red-700"
                      >
                        lorem placeholder generator
                      </Link>{" "}
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
                      <Link href="/pinned-tools" className="font-medium text-red-600 hover:text-red-700">
                        workspace
                      </Link>{" "}
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
      </main>
      <Footer />
    </div>
  );
}

