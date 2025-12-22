"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
import { useAnalytics } from "@/providers/SettingsProvider";

type PinnedToolHeroProps = {
  tools: Tool[];
  onClear: (toolName: string) => void;
};

const PINNED_TOOLS_STORAGE_KEY = "you-i-pinned-tools";

function getPinnedToolIcon(toolName: string) {
  if (toolName === "Color contrast checker") {
    return {
      src: "/icons/color-contrast.svg",
      alt: "Color contrast checker",
    };
  }

  if (toolName === "Ratio calculator") {
    return {
      src: "/icons/ratio-calculator.svg",
      alt: "Ratio calculator",
    };
  }

  if (toolName === "EM to percent converter") {
    return {
      src: "/icons/palette-comparisons.svg",
      alt: "EM to percent converter",
    };
  }

  if (toolName === "Google font explorer") {
    return {
      src: "/icons/theme-explorer.svg",
      alt: "Google font explorer",
    };
  }

  if (toolName === "Placeholder Generator") {
    return {
      src: "/icons/accessible-gradients.svg",
      alt: "Placeholder Generator",
    };
  }

  if (toolName === "Export presets") {
    return {
      src: "/icons/export-presets.svg",
      alt: "Export presets",
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

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        {hasHydrated && pinnedTools.length > 0 ? (
          <PinnedToolHero
            tools={pinnedTools}
            onClear={(toolName) =>
              setPinnedTools((current) => current.filter((tool) => tool.name !== toolName))
            }
          />
        ) : (
          <Hero />
        )}
        <ToolGrid
          pinnedToolNames={hasHydrated ? pinnedTools.map((tool) => tool.name) : []}
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
      </main>
      <Footer />
    </div>
  );
}
