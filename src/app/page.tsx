"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ToolGrid, type Tool } from "@/components/ToolGrid";
import { FeatureSections } from "@/components/FeatureSections";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { ColorContrastChecker } from "@/components/ColorContrastChecker";
import { RatioCalculator } from "@/components/RatioCalculator";

type PinnedToolHeroProps = {
  tools: Tool[];
  onClear: (toolName: string) => void;
};

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

  if (toolName === "Palette comparisons") {
    return {
      src: "/icons/palette-comparisons.svg",
      alt: "Palette comparisons",
    };
  }

  if (toolName === "Theme explorer") {
    return {
      src: "/icons/theme-explorer.svg",
      alt: "Theme explorer",
    };
  }

  if (toolName === "Accessible gradients") {
    return {
      src: "/icons/accessible-gradients.svg",
      alt: "Accessible gradients",
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
  return (
    <section className="min-h-screen border-b border-zinc-200 bg-gradient-to-b from-white to-zinc-50">
      <div className="mx-auto flex min-h-screen px-4 max-w-6xl flex-col justify-center pt-0 pb-12 md:px-8">
        <div className="space-y-8">
       
          <div className="space-y-10">
            {tools.map((tool, index) => {
              const icon = getPinnedToolIcon(tool.name);

              return (
                <div key={tool.name}>
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
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <Link
                            href={tool.href}
                            className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
                          >
                            Open full tool
                          </Link>
                          <button
                            type="button"
                            onClick={() => onClear(tool.name)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-red-600 active:scale-95"
                            aria-label="Unpin tool"
                          >
                            <Image
                              src="/icons/pin-alt.svg"
                              alt=""
                              width={16}
                              height={16}
                              className="h-4 w-4 -rotate-12"
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
  const [pinnedTools, setPinnedTools] = useState<Tool[]>([]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Header />
      <main>
        {pinnedTools.length > 0 ? (
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
      </main>
      <Footer />
    </div>
  );
}
