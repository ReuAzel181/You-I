"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type RatioPresetId = "16:9" | "1:1" | "4:3" | "3:2" | "3:1" | "4:5" | "9:16" | "21:9" | "custom";

type RatioPreset = {
  id: RatioPresetId;
  label: string;
  width: number;
  height: number;
};

const ratioPresets: RatioPreset[] = [
  { id: "16:9", label: "16:9 · Widescreen", width: 16, height: 9 },
  { id: "1:1", label: "1:1 · Square", width: 1, height: 1 },
  { id: "4:3", label: "4:3 · Classic", width: 4, height: 3 },
  { id: "3:2", label: "3:2 · Photography", width: 3, height: 2 },
  { id: "3:1", label: "3:1 · Hero banner", width: 3, height: 1 },
  { id: "4:5", label: "4:5 · Portrait", width: 4, height: 5 },
  { id: "9:16", label: "9:16 · Mobile story", width: 9, height: 16 },
  { id: "21:9", label: "21:9 · Ultra-wide", width: 21, height: 9 },
  { id: "custom", label: "Custom", width: 16, height: 9 },
];

type RatioCalculatorProps = {
  variant?: "simple" | "full";
};

type CopyNoticeState = {
  label: string;
  x: number;
  y: number;
};

function roundToNearestEight(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value / 8) * 8;
}

function sanitizeIntegerInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");

  if (!digits) {
    return "";
  }

  return digits.replace(/^0+(?=\d)/, "");
}

function copyToClipboard(value: string) {
  if (!value) {
    return;
  }

  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).catch(() => {});
    return;
  }

  if (typeof document === "undefined") {
    return;
  }

  const textarea = document.createElement("textarea");

  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
  } catch {
  }

  document.body.removeChild(textarea);
}

export function RatioCalculator({ variant = "full" }: RatioCalculatorProps) {
  const [presetId, setPresetId] = useState<RatioPresetId>("16:9");
  const [customWidthRatio, setCustomWidthRatio] = useState("16");
  const [customHeightRatio, setCustomHeightRatio] = useState("9");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lastCalculatedFrom, setLastCalculatedFrom] = useState<"width" | "height" | null>(null);
  const [activeField, setActiveField] = useState<"width" | "height" | null>(null);
  const [copyNotice, setCopyNotice] = useState<CopyNoticeState | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const copyNoticeTimeoutRef = useRef<number | null>(null);

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

  const numericWidth = Number.parseFloat(width);
  const numericHeight = Number.parseFloat(height);

  const hasDimensions =
    !Number.isNaN(numericWidth) && numericWidth > 0 && !Number.isNaN(numericHeight) && numericHeight > 0;

  const totalPixels = hasDimensions ? numericWidth * numericHeight : null;
  const baselinePixels = 1920 * 1080;

  const relativeSizePercent =
    totalPixels && baselinePixels > 0 ? Math.round((totalPixels / baselinePixels) * 100) : null;

  const sizeBarPercent =
    relativeSizePercent !== null ? Math.max(4, Math.min(relativeSizePercent, 100)) : 0;

  const viewportWidthPx = 1510;
  const previewMaxWidth = 260;
  const previewMaxHeight = 140;

  const previewScale = useMemo(() => {
    if (!hasDimensions || numericWidth <= 0 || numericHeight <= 0) {
      return 0;
    }

    const widthScale = previewMaxWidth / viewportWidthPx;
    const scaledHeight = numericHeight * widthScale;

    if (scaledHeight <= previewMaxHeight) {
      return widthScale;
    }

    const heightAdjustment = previewMaxHeight / scaledHeight;

    return widthScale * heightAdjustment;
  }, [hasDimensions, numericHeight, numericWidth, previewMaxHeight, previewMaxWidth, viewportWidthPx]);

  const previewBoxWidth = hasDimensions ? Math.max(8, numericWidth * previewScale) : 0;
  const previewBoxHeight = hasDimensions ? Math.max(8, numericHeight * previewScale) : 0;

  const updateFromWidth = (rawValue: string) => {
    const value = sanitizeIntegerInput(rawValue);

    setWidth(value);

    const numeric = Number.parseFloat(value);
    const ratioWidth = ratio.width;
    const ratioHeight = ratio.height;

    if (!Number.isNaN(numeric) && numeric > 0 && ratioWidth > 0 && ratioHeight > 0) {
      const rawHeight = (numeric / ratioWidth) * ratioHeight;
      const nextHeight = roundToNearestEight(rawHeight);

      setHeight(nextHeight > 0 ? String(nextHeight) : "");
      setLastCalculatedFrom("width");
      setActiveField("width");
    } else {
      setLastCalculatedFrom(null);
    }
  };

  const updateFromHeight = (rawValue: string) => {
    const value = sanitizeIntegerInput(rawValue);

    setHeight(value);

    const numeric = Number.parseFloat(value);
    const ratioWidth = ratio.width;
    const ratioHeight = ratio.height;

    if (!Number.isNaN(numeric) && numeric > 0 && ratioWidth > 0 && ratioHeight > 0) {
      const rawWidth = (numeric / ratioHeight) * ratioWidth;
      const nextWidth = roundToNearestEight(rawWidth);

      setWidth(nextWidth > 0 ? String(nextWidth) : "");
      setLastCalculatedFrom("height");
      setActiveField("height");
    } else {
      setLastCalculatedFrom(null);
    }
  };

  const recalculateForNewRatio = (nextRatioWidth: number, nextRatioHeight: number) => {
    if (nextRatioWidth <= 0 || nextRatioHeight <= 0) {
      return;
    }

    const numericWidthCurrent = Number.parseFloat(width);
    const numericHeightCurrent = Number.parseFloat(height);

    const hasWidthValue = !Number.isNaN(numericWidthCurrent) && numericWidthCurrent > 0;
    const hasHeightValue = !Number.isNaN(numericHeightCurrent) && numericHeightCurrent > 0;

    if ((lastCalculatedFrom === "width" && hasWidthValue) || (!hasHeightValue && hasWidthValue)) {
      const rawHeight = (numericWidthCurrent / nextRatioWidth) * nextRatioHeight;
      const nextHeight = roundToNearestEight(rawHeight);

      setHeight(nextHeight > 0 ? String(nextHeight) : "");
      setLastCalculatedFrom("width");
    } else if (
      (lastCalculatedFrom === "height" && hasHeightValue) ||
      (!hasWidthValue && hasHeightValue)
    ) {
      const rawWidth = (numericHeightCurrent / nextRatioHeight) * nextRatioWidth;
      const nextWidth = roundToNearestEight(rawWidth);

      setWidth(nextWidth > 0 ? String(nextWidth) : "");
      setLastCalculatedFrom("height");
    } else {
      const baseWidth = roundToNearestEight(nextRatioWidth * 100);
      const baseHeight = roundToNearestEight(nextRatioHeight * 100);

      setWidth(baseWidth > 0 ? String(baseWidth) : "");
      setHeight(baseHeight > 0 ? String(baseHeight) : "");
      setLastCalculatedFrom("width");
    }
  };

  const handleSwap = () => {
    const nextWidth = height;
    const nextHeight = width;

    setWidth(nextWidth);
    setHeight(nextHeight);

    if (nextWidth && !nextHeight) {
      setLastCalculatedFrom("width");
      setActiveField("width");
    } else if (nextHeight && !nextWidth) {
      setLastCalculatedFrom("height");
      setActiveField("height");
    } else {
      setLastCalculatedFrom(null);
      setActiveField(null);
    }
  };

  const handleCopyDimension = (
    value: string,
    label: string,
    event: MouseEvent<HTMLElement>,
  ) => {
    copyToClipboard(value);

    const card = cardRef.current;

    if (card) {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setCopyNotice({ label, x, y });
    } else {
      setCopyNotice({
        label,
        x: 0,
        y: 0,
      });
    }

    if (copyNoticeTimeoutRef.current !== null) {
      window.clearTimeout(copyNoticeTimeoutRef.current);
    }

    copyNoticeTimeoutRef.current = window.setTimeout(() => {
      setCopyNotice(null);
      copyNoticeTimeoutRef.current = null;
    }, 1500);
  };

  useEffect(
    () => () => {
      if (copyNoticeTimeoutRef.current !== null) {
        window.clearTimeout(copyNoticeTimeoutRef.current);
      }
    },
    [],
  );

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
        <div ref={cardRef} className="relative grid gap-4 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
          {copyNotice && (
            <div
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white shadow-lg"
              style={{ left: copyNotice.x, top: copyNotice.y }}
            >
              Copied
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-700">Choose ratio</p>
              <div className="flex flex-wrap gap-2">
                {ratioPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPresetId(preset.id);
                      recalculateForNewRatio(preset.width, preset.height);
                    }}
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
                    onChange={(event) => {
                      const next = event.target.value;

                      setCustomWidthRatio(next);

                      const nextWidthRatio = Number.parseFloat(next);
                      const nextHeightRatio = Number.parseFloat(customHeightRatio);

                      if (nextWidthRatio > 0 && nextHeightRatio > 0) {
                        recalculateForNewRatio(nextWidthRatio, nextHeightRatio);
                      }
                    }}
                    inputMode="decimal"
                    className="h-8 w-16 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                    placeholder="W"
                    aria-label="Custom width ratio"
                  />
                  <span className="text-xs text-zinc-500">:</span>
                  <input
                    value={customHeightRatio}
                    onChange={(event) => {
                      const next = event.target.value;

                      setCustomHeightRatio(next);

                      const nextWidthRatio = Number.parseFloat(customWidthRatio);
                      const nextHeightRatio = Number.parseFloat(next);

                      if (nextWidthRatio > 0 && nextHeightRatio > 0) {
                        recalculateForNewRatio(nextWidthRatio, nextHeightRatio);
                      }
                    }}
                    inputMode="decimal"
                    className="h-8 w-16 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                    placeholder="H"
                    aria-label="Custom height ratio"
                  />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-end justify-between text-xs font-medium text-zinc-700">
                <span>Width</span>
                <span className="text-[10px] font-normal text-zinc-400">Swap</span>
                <span>Height</span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <div className="relative h-9 flex-1">
                  <input
                    value={width}
                    onChange={(event) => updateFromWidth(event.target.value)}
                    onFocus={() => setActiveField("width")}
                    inputMode="decimal"
                    placeholder="1920 px"
                    className="h-full w-full rounded-lg border border-zinc-200 bg-white px-3 pr-8 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                  />
                  <span className="pointer-events-none absolute inset-y-1 right-8 w-px bg-zinc-200" />
                  <button
                    type="button"
                    onClick={(event) => handleCopyDimension(width, "width", event)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-400 transition-colors hover:text-zinc-600"
                    aria-label="Copy width"
                  >
                    <Image
                      src="/icons/copy.svg"
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5"
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSwap}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
                  aria-label="Swap width and height"
                >
                  <Image
                    src="/icons/swap.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5"
                  />
                </button>
                <div className="relative h-9 flex-1">
                  <input
                    value={height}
                    onChange={(event) => updateFromHeight(event.target.value)}
                    onFocus={() => setActiveField("height")}
                    inputMode="decimal"
                    placeholder="1080 px"
                    className="h-full w-full rounded-lg border border-zinc-200 bg-white px-3 pr-8 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                  />
                  <span className="pointer-events-none absolute inset-y-1 right-8 w-px bg-zinc-200" />
                  <button
                    type="button"
                    onClick={(event) => handleCopyDimension(height, "height", event)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-400 transition-colors hover:text-zinc-600"
                    aria-label="Copy height"
                  >
                    <Image
                      src="/icons/copy.svg"
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5"
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-zinc-500">
                {hasDimensions && totalPixels !== null && relativeSizePercent !== null ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Size overview</span>
                      <span className="font-medium text-zinc-700">
                        {relativeSizePercent}% of 1920×1080
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{ width: `${sizeBarPercent}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      {numericWidth} × {numericHeight} ={" "}
                      {totalPixels.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}{" "}
                      pixels
                    </p>
                  </div>
                ) : (
                  <span>Enter width and height to see size overview.</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeField === "width") {
                    const numeric = Number.parseFloat(width);

                    if (!Number.isNaN(numeric) && numeric > 0) {
                      const rounded = roundToNearestEight(numeric);

                      updateFromWidth(String(rounded));
                    }
                  } else if (activeField === "height") {
                    const numeric = Number.parseFloat(height);

                    if (!Number.isNaN(numeric) && numeric > 0) {
                      const rounded = roundToNearestEight(numeric);

                      updateFromHeight(String(rounded));
                    }
                  }
                }}
                className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
              >
                Snap to 8
              </button>
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-3 sm:p-4">
            <p className="text-xs font-medium text-zinc-700">Visual preview</p>
            <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Website viewport</span>
                <span className="font-mono text-[11px] text-zinc-500">{viewportWidthPx} px</span>
              </div>
              <div
                className="relative h-40 w-full overflow-hidden rounded-md border border-zinc-200 bg-zinc-50"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)",
                  backgroundSize: "8px 8px",
                }}
              >
                <div className="absolute left-3 top-2 flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex h-full items-center justify-center px-4">
                  {hasDimensions && previewBoxWidth > 0 && previewBoxHeight > 0 ? (
                    <div
                      className="relative rounded-md border border-red-400 bg-red-500/5"
                      style={{
                        width: `${previewBoxWidth}px`,
                        height: `${previewBoxHeight}px`,
                        maxWidth: "88%",
                        maxHeight: "70%",
                      }}
                    >
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, rgba(248,113,113,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(248,113,113,0.18) 1px, transparent 1px)",
                          backgroundSize: "8px 8px",
                        }}
                      />
                      <div className="relative flex h-full items-center justify-center">
                        <span className="rounded bg-white/80 px-2 py-0.5 text-[10px] font-medium text-red-700 shadow-sm">
                          {numericWidth} × {numericHeight}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="px-4 text-center text-[11px] text-zinc-400">
                      Enter width and height to see this frame inside a page.
                    </p>
                  )}
                  <div className="pointer-events-none absolute bottom-2 right-3 rounded bg-white/85 px-2 py-0.5 text-[10px] font-medium text-zinc-600 shadow-sm">
                    {viewportWidthPx} px viewport
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-700">How this helps</p>
              <p className="text-xs leading-relaxed text-zinc-600">
                Aspect ratio is the width-to-height proportion of an image or video. Pick a preset
                or set your own ratio, enter either width or height, and this calculator fills in
                the other side for you.
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
    </div>
  );
}
