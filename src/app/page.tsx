"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ToolGrid, type Tool } from "@/components/ToolGrid";
import { FeatureSections } from "@/components/FeatureSections";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { ColorContrastChecker } from "@/components/ColorContrastChecker";

type PinnedToolHeroProps = {
  tool: Tool;
  onClear: () => void;
};

function PinnedToolHero({ tool, onClear }: PinnedToolHeroProps) {
  return (
    <section className="min-h-screen border-b border-zinc-200 bg-gradient-to-b from-white to-zinc-50">
      <div className="h-screen mx-auto max-w-6xl flex flex-col justify-center pt-0 pb-12 md:px-8">
        <div className="hero-intro space-y-6">
          
          <div className="flex flex-col md:flex-row md:gap-12">
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Pinned tool
                </div>
                <h1 className="text-balance leading-[1.1] text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
                  {tool.name}
                </h1>
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
                    onClick={onClear}
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    Unpin
                  </button>
                </div>
              )}
            </div>
            {tool.href === "/tools/color-contrast-checker" && (
              <div className="flex-1">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                  <ColorContrastChecker variant="simple" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [pinnedTool, setPinnedTool] = useState<Tool | null>(null);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Header />
      <main>
        {pinnedTool ? <PinnedToolHero tool={pinnedTool} onClear={() => setPinnedTool(null)} /> : <Hero />}
        <ToolGrid
          pinnedToolName={pinnedTool?.name ?? null}
          onPinTool={(tool) =>
            setPinnedTool((current) => (current && current.name === tool.name ? null : tool))
          }
        />
        <FeatureSections />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
