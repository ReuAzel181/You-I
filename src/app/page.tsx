"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ToolGrid, type Tool, tools as allTools } from "@/components/ToolGrid";
import { FeatureSections } from "@/components/FeatureSections";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { ColorContrastChecker } from "@/components/ColorContrastChecker";
import { RatioCalculator } from "@/components/RatioCalculator";
import { EmPercentConverter } from "@/components/EmPercentConverter";
import { GoogleFontExplorer } from "@/components/GoogleFontExplorer";
import { LoremPlaceholderGenerator } from "@/components/LoremPlaceholderGenerator";
import { TypeScaleGenerator } from "@/components/TypeScaleGenerator";
import { SvgWaveGenerator } from "@/components/SvgWaveGenerator";
import { useAnalytics } from "@/providers/SettingsProvider";

type PinnedToolHeroProps = {
  tools: Tool[];
  onClear: (toolName: string) => void;
};

const PINNED_TOOLS_STORAGE_KEY = "zanari-pinned-tools";

function getPinnedToolIcon(toolName: string) {
  if (toolName === "Color Contrast Checker") {
    return {
      src: "/icons/color-contrast.svg",
      alt: "Color Contrast Checker",
    };
  }

  if (toolName === "Ratio Calculator") {
    return {
      src: "/icons/ratio-calculator.svg",
      alt: "Ratio Calculator",
    };
  }

  if (toolName === "Unit Converter") {
    return {
      src: "/icons/palette-comparisons.svg",
      alt: "Unit Converter",
    };
  }

  if (toolName === "Google Font Explorer") {
    return {
      src: "/icons/theme-explorer.svg",
      alt: "Google Font Explorer",
    };
  }

  if (toolName === "Placeholder Generator") {
    return {
      src: "/icons/accessible-gradients.svg",
      alt: "Placeholder Generator",
    };
  }

  if (toolName === "Type Scale") {
    return {
      src: "/icons/export-presets.svg",
      alt: "Type Scale",
    };
  }

  if (toolName === "SVG Wave Generator") {
    return {
      src: "/icons/palette-comparisons.svg",
      alt: "SVG Wave Generator",
    };
  }

  return {
    src: "/icons/pin.svg",
    alt: "Pinned tool",
  };
}

function PinnedToolHero({ tools, onClear }: PinnedToolHeroProps) {
  const [unpinningTools, setUnpinningTools] = useState<string[]>([]);

  return (
    <section className="min-h-screen border-b border-zinc-200 bg-gradient-to-b from-white to-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 pt-8 pb-12 md:px-8">
        <div className="space-y-8">
          <div className="space-y-10">
            {tools.map((tool, index) => {
              const icon = getPinnedToolIcon(tool.name);
              const isUnpinning = unpinningTools.includes(tool.name);

              return (
                <div
                  key={tool.name}
                  className={`transition-all duration-200 ease-out ${
                    isUnpinning ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
                  }`}
                >
                  {index > 0 && <div className="my-6 h-px w-full bg-zinc-200" />}
                  <div className="flex flex-col md:flex-row md:gap-12">
                    <div className="flex flex-1 flex-col justify-center space-y-4">
                      <div className="space-y-3">
                        <h2 className="text-balance leading-[1.1] text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl">
                          <span className="inline-flex items-center gap-2">
                            <span>{tool.name}</span>
                            <Image
                              src={icon.src}
                              alt={icon.alt}
                              width={16}
                              height={16}
                              className="h-4 w-4"
                            />
                          </span>
                        </h2>
                        <p className="max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                          {tool.description}
                        </p>
                      </div>
                      {tool.href && (
                        <div className="flex flex-row flex-wrap items-center gap-3">
                          <Link
                            href={tool.href}
                            className="inline-flex flex-1 items-center justify-center rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600 sm:flex-none"
                          >
                            Open full tool
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setUnpinningTools((current) =>
                                current.includes(tool.name)
                                  ? current
                                  : [...current, tool.name],
                              );

                              window.setTimeout(() => {
                                onClear(tool.name);
                                setUnpinningTools((current) =>
                                  current.filter((name) => name !== tool.name),
                                );
                              }, 180);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-red-600 active:scale-95"
                            aria-label="Unpin tool"
                          >
                            <Image
                              src="/icons/pin-alt.svg"
                              alt=""
                              width={16}
                              height={16}
                              className="h-4 w-4 -rotate-12 transition-transform duration-200"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                    {tool.href === "/tools/color-contrast-checker" && (
                      <div className="mt-6 flex-1 md:mt-0">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                          <ColorContrastChecker variant="simple" />
                        </div>
                      </div>
                    )}
                    {tool.href === "/tools/ratio-calculator" && (
                      <div className="mt-6 flex-1 md:mt-0">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                          <RatioCalculator variant="simple" />
                        </div>
                      </div>
                    )}
                    {tool.href === "/tools/em-to-percent-converter" && (
                      <div className="mt-6 flex-1 md:mt-0">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                          <EmPercentConverter variant="simple" />
                        </div>
                      </div>
                    )}
                    {tool.href === "/tools/google-font-explorer" && (
                      <div className="mt-6 flex-1 md:mt-0">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                          <GoogleFontExplorer variant="preview" />
                        </div>
                      </div>
                    )}
                    {tool.href === "/tools/lorem-placeholder-generator" && (
                      <div className="mt-6 flex-1 md:mt-0">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                          <LoremPlaceholderGenerator variant="hero" />
                        </div>
                      </div>
                    )}
                    {tool.href === "/tools/type-scale" && (
                      <div className="mt-6 flex-1 md:mt-0">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                          <TypeScaleGenerator variant="hero" />
                        </div>
                      </div>
                    )}
                    {tool.href === "/tools/svg-wave-generator" && (
                      <div className="mt-6 flex-1 md:mt-0">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                          <SvgWaveGenerator variant="hero" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeSkeleton() {
  return (
    <>
      <section className="min-h-screen border-b border-zinc-200 bg-gradient-to-b from-white to-zinc-50">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 pt-8 pb-12 md:px-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-medium text-zinc-400 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                <span className="h-3 w-32 rounded-full bg-zinc-200" />
              </div>
              <div className="space-y-3">
                <div className="h-7 w-64 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-3 w-72 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-3 w-60 rounded-full bg-zinc-200 animate-pulse" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-9 w-32 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-9 w-28 rounded-full bg-zinc-100 animate-pulse" />
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-full rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-200" />
                    <span className="h-2 w-2 rounded-full bg-zinc-200" />
                    <span className="h-2 w-2 rounded-full bg-zinc-200" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-20 rounded-full bg-zinc-200" />
                    <span className="hidden h-4 w-20 rounded-full bg-zinc-100 sm:inline-block" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                    <div className="space-y-2">
                      <div className="h-3 w-16 rounded-full bg-zinc-200" />
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-zinc-200" />
                        <div className="h-3 w-28 rounded-full bg-zinc-200" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-16 rounded-full bg-zinc-200" />
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-zinc-200" />
                        <div className="h-3 w-28 rounded-full bg-zinc-200" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded-full bg-zinc-200" />
                      <div className="h-5 w-16 rounded-full bg-zinc-200" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 w-16 rounded-full bg-zinc-200" />
                      <div className="h-4 w-16 rounded-full bg-zinc-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-8 rounded-lg bg-white" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-4 py-3">
                    <div className="space-y-2">
                      <div className="h-3 w-28 rounded-full bg-zinc-200" />
                      <div className="h-3 w-40 rounded-full bg-zinc-200" />
                    </div>
                    <div className="h-5 w-20 rounded-full bg-zinc-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-16">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="h-5 w-56 rounded-full bg-zinc-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-72 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-3 w-64 rounded-full bg-zinc-200 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 text-xs text-zinc-500 md:items-end">
              <div className="h-3 w-40 rounded-full bg-zinc-100 animate-pulse" />
              <div className="inline-flex items-center gap-2">
                <div className="h-7 w-28 rounded-full bg-zinc-100 animate-pulse" />
                <div className="h-7 w-24 rounded-full bg-zinc-100 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col rounded-xl border border-zinc-200 bg-zinc-50 p-4 animate-pulse"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-zinc-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded-full bg-zinc-200" />
                      <div className="h-3 w-20 rounded-full bg-zinc-100" />
                    </div>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-zinc-100" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded-full bg-zinc-200" />
                  <div className="h-3 w-5/6 rounded-full bg-zinc-200" />
                  <div className="h-3 w-2/3 rounded-full bg-zinc-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  const [pinnedTools, setPinnedTools] = useState<Tool[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(PINNED_TOOLS_STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored) as unknown;

      if (!Array.isArray(parsed)) {
        return [];
      }

      const names = parsed.filter((value) => typeof value === "string") as string[];

      return names
        .map((name) => allTools.find((tool) => tool.name === name))
        .filter((tool): tool is Tool => Boolean(tool));
    } catch {
      return [];
    }
  });

  const [hasHydrated, setHasHydrated] = useState(false);

  const { analyticsEnabled, trackEvent } = useAnalytics();

  useEffect(() => {
    if (!analyticsEnabled) {
      return;
    }

    trackEvent("view_home", { path: "/" });
  }, [analyticsEnabled, trackEvent]);

  useEffect(() => {
    const id = setTimeout(() => {
      setHasHydrated(true);
    }, 0);

    return () => {
      clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const names = pinnedTools.map((tool) => tool.name);

    window.localStorage.setItem(PINNED_TOOLS_STORAGE_KEY, JSON.stringify(names));
  }, [pinnedTools]);

  const searchParams = useSearchParams();
  const activeToolSlug = searchParams.get("tool");

  const displayedPinnedTools = useMemo(() => {
    if (!activeToolSlug) {
      return pinnedTools;
    }

    const matchIndex = pinnedTools.findIndex((tool) => {
      if (!tool.href) {
        return false;
      }

      const segments = tool.href.split("/");
      const slug = segments[segments.length - 1] || "";

      return slug === activeToolSlug;
    });

    if (matchIndex <= 0) {
      return pinnedTools;
    }

    const match = pinnedTools[matchIndex];

    return [match, ...pinnedTools.filter((_, index) => index !== matchIndex)];
  }, [activeToolSlug, pinnedTools]);

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        {!hasHydrated ? (
          <HomeSkeleton />
        ) : (
          <>
            {pinnedTools.length > 0 ? (
              <PinnedToolHero
                tools={displayedPinnedTools}
                onClear={(toolName) =>
                  setPinnedTools((current) => current.filter((tool) => tool.name !== toolName))
                }
              />
            ) : (
              <Hero />
            )}
            <ToolGrid
              pinnedToolNames={pinnedTools.map((tool) => tool.name)}
              onPinTool={(tool) =>
                setPinnedTools((current) => {
                  const isAlreadyPinned = current.some((item) => item.name === tool.name);
                  if (isAlreadyPinned) {
                    return current.filter((item) => item.name !== tool.name);
                  }
                  return [...current, tool];
                })
              }
            />
            <FeatureSections />
            <CTASection />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
