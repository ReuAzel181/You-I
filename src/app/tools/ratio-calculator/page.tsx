"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RatioCalculator } from "@/components/RatioCalculator";

type ViewportPresetId =
  | "none"
  | "375"
  | "414"
  | "768"
  | "1024"
  | "1280"
  | "1440"
  | "1512"
  | "1920";

type ViewportPreset = {
  id: ViewportPresetId;
  label: string;
  width: number | null;
};

const viewportPresets: ViewportPreset[] = [
  { id: "none", label: "Auto", width: null },
  { id: "375", label: "375 · Mobile", width: 375 },
  { id: "414", label: "414 · Large mobile", width: 414 },
  { id: "768", label: "768 · Tablet", width: 768 },
  { id: "1024", label: "1024 · Small laptop", width: 1024 },
  { id: "1280", label: "1280 · Desktop", width: 1280 },
  { id: "1440", label: "1440 · Desktop", width: 1440 },
  { id: "1512", label: "1512 · Desktop", width: 1512 },
  { id: "1920", label: "1920 · Full HD", width: 1920 },
];

export default function RatioCalculatorPage() {
  const [dimensionWidth, setDimensionWidth] = useState<number | null>(null);
  const [dimensionHeight, setDimensionHeight] = useState<number | null>(null);
  const [viewportPixelWidth, setViewportPixelWidth] = useState(0);
  const [pagePixelWidth, setPagePixelWidth] = useState(0);
  const [viewportPreset, setViewportPreset] = useState<ViewportPresetId>("none");

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const hasDimensions =
    dimensionWidth !== null && dimensionWidth > 0 && dimensionHeight !== null && dimensionHeight > 0;

  const previewBoxWidth = hasDimensions && dimensionWidth ? dimensionWidth : 0;
  const previewBoxHeight = hasDimensions && dimensionHeight ? dimensionHeight : 0;

  const hasPageMeasurement = pagePixelWidth > 0;

  const selectedPreset =
    viewportPresets.find((preset) => preset.id === viewportPreset) ?? viewportPresets[0];

  const viewportPresetWidth = selectedPreset.width;

  const effectiveSectionWidth =
    viewportPresetWidth !== null && viewportPresetWidth > 0
      ? viewportPresetWidth
      : viewportPixelWidth;

  const isPresetTooLargeForPage =
    viewportPresetWidth !== null &&
    hasPageMeasurement &&
    pagePixelWidth < viewportPresetWidth;

  const isBoxWiderThanSection =
    hasDimensions && effectiveSectionWidth > 0 && previewBoxWidth > effectiveSectionWidth;

  useEffect(() => {
    const element = viewportRef.current;

    if (!element) {
      return;
    }

    const updateWidth = () => {
      setViewportPixelWidth(element.clientWidth);
    };

    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateWidth());

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useEffect(() => {
    const updatePageWidth = () => {
      setPagePixelWidth(window.innerWidth);
    };

    updatePageWidth();

    window.addEventListener("resize", updatePageWidth);

    return () => {
      window.removeEventListener("resize", updatePageWidth);
    };
  }, []);

  const handleDimensionsChange = (dimensions: { width: number | null; height: number | null }) => {
    setDimensionWidth(dimensions.width);
    setDimensionHeight(dimensions.height);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Header />
      <main>
        <section>
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-8">
            <div className="hero-intro space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Tool
              </div>
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                Ratio calculator
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                Calculate matching dimensions for any aspect ratio. Pick presets like 16:9, 1:1,
                4:5, or 9:16, or set your own, enter either width or height, and get the other
                value instantly.
              </p>
            </div>
          </div>
        </section>
        <section className="bg-zinc-50">
          <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8">
            <RatioCalculator variant="full" onDimensionsChange={handleDimensionsChange} />
          </div>
        </section>
        <section>
          <div className="pb-12">
            <div className="space-y-2 border border-zinc-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Website viewport</span>
                <span className="font-mono text-[11px] text-zinc-500">
                  {pagePixelWidth ? `${Math.round(pagePixelWidth)} px` : "measuring..."}
                </span>
              </div>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500">
                <div className="inline-flex items-center gap-2">
                  <span>Viewport preset</span>
                  <div className="inline-flex flex-wrap gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-1 py-0.5">
                    {viewportPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setViewportPreset(preset.id)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                          viewportPreset === preset.id
                            ? "bg-red-500 text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-700"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">
                  {viewportPresetWidth ? `Section: ${viewportPresetWidth} px` : "Section: auto"}
                </span>
              </div>
              {isPresetTooLargeForPage && (
                <div className="mb-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] text-amber-700">
                  The preset is larger than your browser width, try resizing the page.
                </div>
              )}
              {isBoxWiderThanSection && (
                <div className="mb-1 rounded-md bg-red-50 px-2 py-1 text-[10px] text-red-700">
                  The frame is wider than this viewport section.
                </div>
              )}
              <div
                ref={viewportRef}
                className="relative mx-auto max-h-96 w-full overflow-auto rounded-md border border-zinc-200 bg-zinc-50"
                style={{
                  width:
                    viewportPresetWidth !== null && viewportPresetWidth > 0
                      ? `${viewportPresetWidth}px`
                      : "100%",
                  backgroundImage:
                    "linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)",
                  backgroundSize: "1px 1px",
                }}
              >
                <div className="absolute left-3 top-2 flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex min-h-40 items-center justify-center py-6">
                  {hasDimensions && previewBoxWidth > 0 && previewBoxHeight > 0 ? (
                    <div
                      className="relative border border-red-400 bg-red-500/5"
                      style={{
                        width: `${previewBoxWidth}px`,
                        height: `${previewBoxHeight}px`,
                      }}
                    >
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, rgba(248,113,113,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(248,113,113,0.18) 1px, transparent 1px)",
                        backgroundSize: "1px 1px",
                      }}
                    />
                      <div className="relative flex h-full items-center justify-center">
                        <span className="rounded bg-white/80 px-2 py-0.5 text-[10px] font-medium text-red-700 shadow-sm">
                          {dimensionWidth} × {dimensionHeight}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="px-4 text-center text-[11px] text-zinc-400">
                      Enter width and height to see this frame inside a page.
                    </p>
                  )}
                  <div className="pointer-events-none absolute bottom-2 right-3 rounded bg-white/85 px-2 py-0.5 text-[10px] font-medium text-zinc-600 shadow-sm">
                    {viewportPixelWidth ? `${Math.round(viewportPixelWidth)} px viewport` : "Viewport"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
