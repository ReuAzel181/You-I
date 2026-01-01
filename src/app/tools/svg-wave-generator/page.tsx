"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SvgWaveGenerator } from "@/components/SvgWaveGenerator";
import { useAnalytics, useSettings } from "@/providers/SettingsProvider";

export default function SvgWaveGeneratorPage() {
  const router = useRouter();
  const { analyticsEnabled, trackEvent } = useAnalytics();
  const { profileBannerColor } = useSettings();
  const chevronIconSrc = `/icons/chevron/chevron_${profileBannerColor}.svg`;
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_svg_wave_generator", { path: "/tools/svg-wave-generator" });
  }, [analyticsEnabled, trackEvent]);

  const handleBackClick = () => {
    if (typeof window === "undefined" || isLeaving) {
      return;
    }

    const root = document.documentElement;

    root.classList.add("no-smooth-scroll");
    root.classList.add("page-transition-leave");
    setIsLeaving(true);

    window.setTimeout(() => {
      router.push("/?tool=svg-wave-generator");

      window.setTimeout(() => {
        root.classList.remove("page-transition-leave");
        root.classList.remove("no-smooth-scroll");
        setIsLeaving(false);
      }, 220);
    }, 160);
  };

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section>
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="hero-intro space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span>Tool</span>
                </div>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                  SVG Wave Generator
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                  Generate SVG wave backgrounds you can drop into hero sections, dividers, and
                  transitions between sections. Adjust height, curvature, position, and colors, then
                  copy the markup into your project.
                </p>
              </div>
              <button
                type="button"
                onClick={handleBackClick}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-red-300 px-3 text-[11px] font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Back to main page"
              >
                <Image
                  src={chevronIconSrc}
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
            <SvgWaveGenerator variant="full" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
