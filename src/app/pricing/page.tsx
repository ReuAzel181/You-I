"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAnalytics } from "@/providers/SettingsProvider";

export default function PricingPage() {
  const router = useRouter();
  const { analyticsEnabled, trackEvent } = useAnalytics();
  const [billingMode, setBillingMode] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_pricing", { path: "/pricing" });
  }, [analyticsEnabled, trackEvent]);

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section>
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Pricing
                </div>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                  Pricing plans for every stage
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                  Start free, then grow into more guidance and collaboration when you need it. All
                  plans keep your settings and pinned tools in your browser, so your workspace feels
                  the same every time you open YOU-I.
                </p>
                <p className="max-w-2xl text-[11px] leading-relaxed text-zinc-500">
                  YOU-I is designed to sit next to your design tool. Use pricing more like a
                  commitment to your own workflow than a traditional subscription.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex h-7 items-center gap-1 self-start rounded-full border border-red-300 px-3 text-[11px] font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Back to main page"
              >
                <Image
                  src="/icons/chevron.svg"
                  alt=""
                  width={10}
                  height={10}
                  className="h-3 w-3"
                />
                <span>Back</span>
              </button>
            </div>
          </div>
        </section>
        <section className="bg-[var(--background)]">
          <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Starter is active by default for every account.
            </div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 p-1 text-[11px] text-zinc-700">
                <button
                  type="button"
                  onClick={() => setBillingMode("monthly")}
                  className={`rounded-full px-3 py-1 font-medium ${
                    billingMode === "monthly"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingMode("yearly")}
                  className={`rounded-full px-3 py-1 font-medium ${
                    billingMode === "yearly"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Yearly · save 15%
                </button>
              </div>
              <p className="text-[10px] text-zinc-500">
                Prices are placeholders; choose how you think about the commitment.
              </p>
            </div>
            <div className="grid items-center gap-4 md:grid-cols-3">
              <div className="flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-800">
                      Starter
                    </p>
                    <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Current plan
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">$0</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Try YOU-I on solo work with your own pace.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-[11px]">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-zinc-700">
                        Unlimited access to all tools
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-zinc-700">
                        Save pinned tools and presets
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-zinc-700">
                        Local-only analytics, no ads
                      </span>
                    </li>
                  </ul>
                  <button
                    className="mt-6 inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-[11px] font-semibold text-zinc-500"
                    aria-disabled="true"
                  >
                    You&apos;re using this plan
                  </button>
                </div>
                <div className="flex flex-col justify-center rounded-2xl border-2 border-red-500 bg-red-50 pricing-featured-card p-5 sm:p-6 md:py-8 md:h-[29rem] shadow-sm md:z-10">
                  <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                      Best for you
                    </p>
                    <span className="rounded-full border border-red-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-red-600">
                      Most popular
                    </span>
                  </div>
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Recommended
                  </span>
                </div>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 pricing-featured-amount [data-theme=dark]:text-white">
                    {billingMode === "monthly" ? "$5" : "$50"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-700 pricing-featured-body [data-theme=dark]:text-zinc-100">
                    For weekly interface work with YOU-I next to your design tool.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-[11px] pricing-featured-body">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Unlimited access to all tools
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Save pinned tools and workspace presets
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Local analytics only, no ads
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Saved presets for colors and typography
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Sections for different products or clients
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-red-700 [data-theme=dark]:text-red-200">
                        Email updates when new tools and checks are added
                      </span>
                    </li>
                  </ul>
                  <button className="mt-6 inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600">
                  Get Pro access
                </button>
              </div>
              <div className="top-tier-glow mx-auto">
                <div className="violet-inner-ring relative flex flex-col overflow-hidden rounded-2xl border-2 border-violet-500 bg-gradient-to-b from-violet-50 to-violet-100 p-3 sm:p-4 shadow-sm">
                  <div
                    className="pointer-events-none absolute inset-x-[-40%] top-0 h-24 bg-gradient-to-b from-white/70 via-violet-50/40 to-transparent opacity-90 mix-blend-screen blur-md animate-pulse"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute -right-10 top-10 h-24 w-24 rounded-full bg-violet-400/35 blur-3xl"
                    aria-hidden="true"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-violet-700">
                      Top tier
                    </p>
                    <span className="rounded-full border border-violet-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                      Teams
                    </span>
                  </div>
                  <div className="mt-2 h-0.5 w-16 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-transparent" />
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                    {billingMode === "monthly" ? "$10" : "$100"}
                  </p>
                  <p className="mt-1 text-xs text-violet-700">
                    For teams shipping accessible work across many products.
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[11px]">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Unlimited access for your team
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Shared presets and workspaces
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Local analytics only, no tracking
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Sections shared across products
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Role-based workspace suggestions
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Priority feedback and early feature access
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center">
                        <Image
                          src="/icons/check.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="font-medium text-violet-700">
                        Email updates on new checks and tools
                      </span>
                    </li>
                  </ul>
                  <button className="mt-6 inline-flex items-center justify-center rounded-full border border-violet-300 bg-white px-4 py-1.5 text-[11px] font-medium text-violet-700 transition-colors hover:border-violet-400 hover:bg-violet-50 hover:text-violet-800">
                    Talk to us
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-[11px] text-zinc-600 md:grid-cols-3">
              <div>
                <p className="font-medium text-zinc-800">All plans include</p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Access to every current tool, contrast-safe defaults, and a workspace that lives
                  in your browser.
                </p>
              </div>
              <div>
                <p className="font-medium text-zinc-800">How you might use this</p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Run quick checks before shipping, explore new palettes, and size frames without
                  having to open a full design file.
                </p>
              </div>
              <div>
                <p className="font-medium text-zinc-800">About these prices</p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Prices are placeholders for layout only. When billing launches, you can stay on
                  the free tier or upgrade with the same account.
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
