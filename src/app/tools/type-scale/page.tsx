"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TypeScaleGenerator } from "@/components/TypeScaleGenerator";
import { useAnalytics } from "@/providers/SettingsProvider";

export default function TypeScalePage() {
  const router = useRouter();
  const { analyticsEnabled, trackEvent } = useAnalytics();

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_type_scale", { path: "/tools/type-scale" });
  }, [analyticsEnabled, trackEvent]);

  return (
    <div className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
      <Header />
      <main>
        <section>
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="hero-intro space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Tool</span>
                </div>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                  Type scale
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                  Start from a base font size and pick a scale ratio to generate a simple,
                  minimalist typography system. Use the resulting sizes for headings, body text,
                  and supporting labels.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    router.back();
                  } else {
                    router.push("/");
                  }
                }}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-zinc-300 px-3 text-[11px] font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-800"
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
            <TypeScaleGenerator variant="full" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
