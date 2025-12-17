"use client";

import { useMemo, useState } from "react";

type RatioPresetId = "16:9" | "4:3" | "3:2" | "21:9" | "custom";

type RatioPreset = {
  id: RatioPresetId;
  label: string;
  width: number;
  height: number;
};

const ratioPresets: RatioPreset[] = [
  { id: "16:9", label: "16:9 · Widescreen", width: 16, height: 9 },
  { id: "4:3", label: "4:3 · Classic", width: 4, height: 3 },
  { id: "3:2", label: "3:2 · Photography", width: 3, height: 2 },
  { id: "21:9", label: "21:9 · Ultra-wide", width: 21, height: 9 },
  { id: "custom", label: "Custom", width: 16, height: 9 },
];

type RatioCalculatorProps = {
  variant?: "simple" | "full";
};

export function RatioCalculator({ variant = "full" }: RatioCalculatorProps) {
  const [presetId, setPresetId] = useState<RatioPresetId>("16:9");
  const [customWidthRatio, setCustomWidthRatio] = useState("16");
  const [customHeightRatio, setCustomHeightRatio] = useState("9");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lastCalculatedFrom, setLastCalculatedFrom] = useState<"width" | "height" | null>(null);

  const activePreset = useMemo(
    () => ratioPresets.find((preset) => preset.id === presetId) ?? ratioPresets[0],
    [presetId],
  );

  const ratio = useMemo(() => {
    if (presetId === "custom") {
      const customWidth = Number.parseFloat(customWidthRatio) || 0;
      const customHeight = Number.parseFloat(customHeightRatio) || 0;

      if (customWidth > 0 && customHeight > 0) {
        return { width: customWidth, height: customHeight };
      }

      return { width: 16, height: 9 };
    }

    return { width: activePreset.width, height: activePreset.height };
  }, [presetId, customWidthRatio, customHeightRatio, activePreset]);

  const ratioValue = useMemo(() => {
    if (ratio.height === 0) {
      return null;
    }

    const value = ratio.width / ratio.height;
    const rounded = Math.round(value * 100) / 100;

    return rounded;
  }, [ratio]);

  const handleCalculate = () => {
    const ratioWidth = ratio.width;
    const ratioHeight = ratio.height;

    if (ratioWidth <= 0 || ratioHeight <= 0) {
      return;
    }

    const numericWidth = Number.parseFloat(width);
    const numericHeight = Number.parseFloat(height);

    const hasWidth = !Number.isNaN(numericWidth) && numericWidth > 0;
    const hasHeight = !Number.isNaN(numericHeight) && numericHeight > 0;

    if (!hasWidth && !hasHeight) {
      return;
    }

    if (hasWidth && !hasHeight) {
      const nextHeight = Math.round((numericWidth / ratioWidth) * ratioHeight);

      setHeight(String(nextHeight));
      setLastCalculatedFrom("width");
      return;
    }

    if (hasHeight && !hasWidth) {
      const nextWidth = Math.round((numericHeight / ratioHeight) * ratioWidth);

      setWidth(String(nextWidth));
      setLastCalculatedFrom("height");
      return;
    }

    const nextHeight = Math.round((numericWidth / ratioWidth) * ratioHeight);

    setHeight(String(nextHeight));
    setLastCalculatedFrom("width");
  };

  const handleSwap = () => {
    setWidth(height);
    setHeight(width);
    setLastCalculatedFrom(null);
  };

  const summaryText = useMemo(() => {
    if (!ratioValue) {
      return "";
    }

    const label = `${ratio.width}:${ratio.height}`;

    if (lastCalculatedFrom === "width" && width && height) {
      return `${width} × ${height} keeps a ${label} frame (${ratioValue}:1).`;
    }

    if (lastCalculatedFrom === "height" && width && height) {
      return `${width} × ${height} keeps a ${label} frame (${ratioValue}:1).`;
    }

    return `${label} means ${ratio.width} units wide for every ${ratio.height} units tall (${ratioValue}:1).`;
  }, [height, lastCalculatedFrom, ratio.height, ratio.width, ratioValue, width]);

  const containerPadding = variant === "full" ? "p-5 sm:p-6" : "p-4 sm:p-5";

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border border-zinc-200 bg-white ${containerPadding}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Aspect ratio calculator
          </div>
          {ratioValue !== null && (
            <p className="text-xs font-mono text-zinc-500">{ratioValue.toFixed(2)} : 1</p>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-700">Choose ratio</p>
              <div className="flex flex-wrap gap-2">
                {ratioPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPresetId(preset.id)}
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      preset.id === presetId
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-red-200 hover:text-red-500"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {presetId === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={customWidthRatio}
                    onChange={(event) => setCustomWidthRatio(event.target.value)}
                    inputMode="decimal"
                    className="h-8 w-16 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                    placeholder="W"
                    aria-label="Custom width ratio"
                  />
                  <span className="text-xs text-zinc-500">:</span>
                  <input
                    value={customHeightRatio}
                    onChange={(event) => setCustomHeightRatio(event.target.value)}
                    inputMode="decimal"
                    className="h-8 w-16 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                    placeholder="H"
                    aria-label="Custom height ratio"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700">Width</label>
                <div className="flex items-center gap-2">
                  <input
                    value={width}
                    onChange={(event) => setWidth(event.target.value)}
                    inputMode="decimal"
                    placeholder="1920"
                    className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                  />
                  <span className="text-[11px] text-zinc-500">px</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-700">Height</label>
                <div className="flex items-center gap-2">
                  <input
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    inputMode="decimal"
                    placeholder="1080"
                    className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                  />
                  <span className="text-[11px] text-zinc-500">px</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCalculate}
                className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
              >
                Calculate matching dimension
              </button>
              <button
                type="button"
                onClick={handleSwap}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50"
              >
                Swap width and height
              </button>
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-3 sm:p-4">
            <p className="text-xs font-medium text-zinc-700">How this helps</p>
            <p className="text-xs leading-relaxed text-zinc-600">
              Aspect ratio is the width-to-height proportion of an image or video. Pick a preset or
              set your own ratio, enter either width or height, and this calculator fills in the
              other side for you.
            </p>
            {summaryText && (
              <p className="text-[11px] leading-relaxed text-zinc-500">{summaryText}</p>
            )}
            {variant === "full" && (
              <ul className="mt-1 space-y-1 text-[11px] text-zinc-600">
                <li>16:9 is common for modern video and presentations.</li>
                <li>4:3 is used for older footage and some slides.</li>
                <li>3:2 matches many camera sensors and prints.</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

