"use client";

import type { KeyboardEvent } from "react";
import { useMemo, useState } from "react";
import { useSettings } from "@/providers/SettingsProvider";

type EmPercentConverterProps = {
  variant?: "simple" | "full";
};

type ActiveField = "px" | "rem" | "em" | "percent" | null;

const presetBases = [14, 16, 18, 20, 24];

const baseStepAmount = 1;

function sanitizeDecimalInput(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const normalized = trimmed.replace(/,/g, ".");
  const match = normalized.match(/^(\d+(\.\d*)?|\.\d*)?/);
  const result = match ? match[0] : "";

  if (!result) {
    return "";
  }

  if (result.startsWith(".")) {
    return `0${result}`;
  }

  return result;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }

  const rounded = Math.round(value * 10000) / 10000;
  const text = rounded.toString();

  if (!text.includes(".")) {
    return text;
  }

  return text.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
}

function applyStepToValue(value: string, delta: number): string {
  const sanitized = sanitizeDecimalInput(value || "0");
  const numeric = Number.parseFloat(sanitized || "0");

  if (!Number.isFinite(numeric)) {
    return sanitized || "0";
  }

  const next = numeric + delta;

  if (next <= 0) {
    return "0";
  }

  return formatNumber(next);
}

type StepTarget = "base" | Exclude<ActiveField, null>;

function handleStepKey(
  event: KeyboardEvent<HTMLInputElement>,
  field: StepTarget,
  currentValue: string,
  handlers: {
    onBaseChange: (value: string) => void;
    onFieldChange: (field: Exclude<ActiveField, null>, value: string) => void;
  },
  stepAmount: number,
) {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
    return;
  }

  event.preventDefault();

  const step = event.shiftKey ? stepAmount : baseStepAmount;
  const direction = event.key === "ArrowUp" ? 1 : -1;
  const delta = step * direction;
  const nextValue = applyStepToValue(currentValue, delta);

  if (field === "base") {
    handlers.onBaseChange(nextValue);
  } else {
    handlers.onFieldChange(field, nextValue);
  }
}

export function EmPercentConverter({ variant = "full" }: EmPercentConverterProps) {
  const [basePx, setBasePx] = useState("16");
  const [pxValue, setPxValue] = useState("16");
  const [remValue, setRemValue] = useState("1");
  const [emValue, setEmValue] = useState("1");
  const [percentValue, setPercentValue] = useState("100");
  const [activeField, setActiveField] = useState<ActiveField>("px");
  const [scaleRemValue, setScaleRemValue] = useState("1");
  const [previewText, setPreviewText] = useState("Hello");
  const [cssMode, setCssMode] = useState<"tailwind" | "css" | "react" | "vue" | "angular">("tailwind");
  const { nudgeAmount, tipsAndGuides } = useSettings();

  const effectiveNudgeAmount = Number.isFinite(nudgeAmount) && nudgeAmount > 0 ? nudgeAmount : 8;

  const numericBasePx = useMemo(() => {
    const parsed = Number.parseFloat(basePx);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 0;
    }

    return parsed;
  }, [basePx]);

  const previewFontSizePx = useMemo(() => {
    const numeric = Number.parseFloat(pxValue);

    if (!Number.isFinite(numeric) || numeric <= 0) {
      return numericBasePx || 16;
    }

    return numeric;
  }, [pxValue, numericBasePx]);

  const clampedPreviewFontSizePx = Math.min(previewFontSizePx, 200);
  const isPreviewTooLarge = previewFontSizePx > 72;
  const shouldRenderVertical = clampedPreviewFontSizePx >= 180;
  const previewDisplayText = previewText || "Hello";

  const pxNumeric = Number.parseFloat(pxValue);
  const hasSnippet = Number.isFinite(pxNumeric) && pxNumeric > 0;

  let cssSnippet = "";

  if (hasSnippet) {
    if (cssMode === "tailwind") {
      cssSnippet = `className="text-[${formatNumber(pxNumeric)}px]"`;
    } else if (cssMode === "css") {
      cssSnippet = `font-size: ${formatNumber(pxNumeric)}px;`;
    } else if (cssMode === "react") {
      cssSnippet = `style={{ fontSize: "${formatNumber(pxNumeric)}px" }}`;
    } else if (cssMode === "vue") {
      cssSnippet = `:style="{ fontSize: '${formatNumber(pxNumeric)}px' }"`;
    } else if (cssMode === "angular") {
      cssSnippet = `[ngStyle]="{ 'font-size.px': ${formatNumber(pxNumeric)} }"`;
    }
  }

  const updateFrom = (
    field: Exclude<ActiveField, null>,
    rawValue: string,
    baseOverride?: number,
  ) => {
    const sanitized = sanitizeDecimalInput(rawValue);

    setActiveField(field);

    if (field === "px") {
      setPxValue(sanitized);
    } else if (field === "rem") {
      setRemValue(sanitized);
    } else if (field === "em") {
      setEmValue(sanitized);
    } else if (field === "percent") {
      setPercentValue(sanitized);
    }

    const base =
      typeof baseOverride === "number" && Number.isFinite(baseOverride) ? baseOverride : numericBasePx;
    const hasBase = base > 0;

    if (!sanitized || !hasBase) {
      if (field !== "px") {
        setPxValue("");
      }

      if (field !== "rem") {
        setRemValue("");
      }

      if (field !== "em") {
        setEmValue("");
      }

      if (field !== "percent") {
        setPercentValue("");
      }

      return;
    }

    const numeric = Number.parseFloat(sanitized);

    if (!Number.isFinite(numeric) || numeric < 0) {
      return;
    }

    let px = 0;

    if (field === "px") {
      px = numeric;
    } else if (field === "rem" || field === "em") {
      px = numeric * base;
    } else if (field === "percent") {
      px = (numeric / 100) * base;
    }

    const em = base > 0 ? px / base : 0;
    const percent = base > 0 ? (px / base) * 100 : 0;

    if (field !== "px") {
      setPxValue(formatNumber(px));
    }

    if (field !== "rem") {
      setRemValue(formatNumber(em));
    }

    if (field !== "em") {
      setEmValue(formatNumber(em));
    }

    if (field !== "percent") {
      setPercentValue(formatNumber(percent));
    }
  };

  const handleBaseChange = (rawValue: string) => {
    const sanitized = sanitizeDecimalInput(rawValue);

    setBasePx(sanitized);

    const nextBase = Number.parseFloat(sanitized);

    if (!Number.isFinite(nextBase) || nextBase <= 0 || !activeField) {
      return;
    }

    if (activeField === "px") {
      updateFrom("px", pxValue, nextBase);
    } else if (activeField === "rem") {
      updateFrom("rem", remValue, nextBase);
    } else if (activeField === "em") {
      updateFrom("em", emValue, nextBase);
    } else if (activeField === "percent") {
      updateFrom("percent", percentValue, nextBase);
    }
  };

  const containerPadding = variant === "full" ? "p-5 sm:p-6" : "p-4 sm:p-5";

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border border-zinc-200 bg-white ${containerPadding}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <span>EM to percent converter</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-zinc-400">Base font size</p>
            <div className="mt-1 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-zinc-700 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100">
              <input
                value={basePx}
                onChange={(event) => handleBaseChange(event.target.value)}
                inputMode="decimal"
                type="number"
                onKeyDown={(event) =>
                  handleStepKey(event, "base", basePx, {
                    onBaseChange: handleBaseChange,
                    onFieldChange: (field, value) => updateFrom(field, value),
                  }, effectiveNudgeAmount)
                }
                className="h-6 w-20 border-0 bg-transparent px-1 text-center text-[11px] text-zinc-900 outline-none ring-0 placeholder:text-zinc-400"
                aria-label="Base font size in pixels"
                placeholder="16"
              />
              <span className="ml-1 text-[11px] text-zinc-400">px</span>
              {tipsAndGuides && (
                <span className="ml-2 hidden text-[10px] text-zinc-500 sm:inline">
                  Use Shift+Arrow keys to nudge by {effectiveNudgeAmount}px
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700">Pixels</label>
            <input
              value={pxValue}
              onChange={(event) => updateFrom("px", event.target.value)}
              onFocus={() => setActiveField("px")}
              inputMode="decimal"
              type="number"
              onKeyDown={(event) =>
                handleStepKey(event, "px", pxValue, {
                  onBaseChange: handleBaseChange,
                  onFieldChange: (field, value) => updateFrom(field, value),
                }, effectiveNudgeAmount)
              }
              placeholder="16"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
            />
            <p className="text-[10px] text-zinc-500">Raw pixel value</p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700">Percent</label>
            <input
              value={percentValue}
              onChange={(event) => updateFrom("percent", event.target.value)}
              onFocus={() => setActiveField("percent")}
              inputMode="decimal"
              type="number"
              onKeyDown={(event) =>
                handleStepKey(event, "percent", percentValue, {
                  onBaseChange: handleBaseChange,
                  onFieldChange: (field, value) => updateFrom(field, value),
                }, effectiveNudgeAmount)
              }
              placeholder="100"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
            />
            <p className="text-[10px] text-zinc-500">Relative to the base font size</p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700">rem</label>
            <input
              value={remValue}
              onChange={(event) => updateFrom("rem", event.target.value)}
              onFocus={() => setActiveField("rem")}
              inputMode="decimal"
              type="number"
              onKeyDown={(event) =>
                handleStepKey(event, "rem", remValue, {
                  onBaseChange: handleBaseChange,
                  onFieldChange: (field, value) => updateFrom(field, value),
                }, effectiveNudgeAmount)
              }
              placeholder="1"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
            />
            <p className="text-[10px] text-zinc-500">Root-relative size (usually the HTML font size)</p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-700">em</label>
            <input
              value={emValue}
              onChange={(event) => updateFrom("em", event.target.value)}
              onFocus={() => setActiveField("em")}
              inputMode="decimal"
              type="number"
              onKeyDown={(event) =>
                handleStepKey(event, "em", emValue, {
                  onBaseChange: handleBaseChange,
                  onFieldChange: (field, value) => updateFrom(field, value),
                }, effectiveNudgeAmount)
              }
              placeholder="1"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
            />
            <p className="text-[10px] text-zinc-500">Element-relative size using the same base</p>
          </div>
        </div>
        {variant === "full" && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-zinc-700">Live text preview</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div
                  className={`flex overflow-hidden rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 text-center ${
                    shouldRenderVertical
                      ? "h-40 sm:h-48 items-start justify-center"
                      : "h-40 sm:h-48 items-center justify-center"
                  }`}
                >
                  {shouldRenderVertical ? (
                    <span
                      className="flex flex-col items-center text-zinc-900"
                      style={{ fontSize: `${clampedPreviewFontSizePx}px`, lineHeight: 1 }}
                    >
                      {Array.from(previewDisplayText).map((char, index) => (
                        <span key={`${char}-${index}`} className="leading-none">
                          {char}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span
                      className="break-words text-zinc-900"
                      style={{ fontSize: `${clampedPreviewFontSizePx}px`, lineHeight: 1.2 }}
                    >
                      {previewDisplayText}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 sm:mt-0 sm:w-48">
                <label className="mb-1 block text-[11px] font-medium text-zinc-700">
                  Preview text
                </label>
                <input
                  value={previewText}
                  onChange={(event) => setPreviewText(event.target.value)}
                  placeholder="Hello"
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                />
                <p className="mt-1 text-[10px] text-zinc-500">
                  Font size uses the current pixel value from the converter.
                </p>
              </div>
            </div>
            {isPreviewTooLarge && (
              <p className="text-[10px] text-amber-700">
                The text no longer fits in the preview area at this size.
              </p>
            )}
          </div>
        )}
        {variant === "full" && (
          <div className="mt-4 grid gap-3 text-[11px] text-zinc-600 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
              <p className="font-medium text-zinc-800">CSS snippet</p>
              <div className="mt-2 inline-flex flex-wrap items-center gap-1 rounded-full border border-zinc-200 bg-white px-1 py-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCssMode("tailwind")}
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    cssMode === "tailwind"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Tailwind
                </button>
                <button
                  type="button"
                  onClick={() => setCssMode("css")}
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    cssMode === "css"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  CSS
                </button>
                <button
                  type="button"
                  onClick={() => setCssMode("react")}
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    cssMode === "react"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  React
                </button>
                <button
                  type="button"
                  onClick={() => setCssMode("vue")}
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    cssMode === "vue"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Vue
                </button>
                <button
                  type="button"
                  onClick={() => setCssMode("angular")}
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    cssMode === "angular"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Angular
                </button>
              </div>
              <div className="mt-2 rounded-md border border-zinc-900/20 bg-zinc-900/90 px-3 py-2">
                {hasSnippet ? (
                  <pre className="whitespace-pre-wrap text-[10px] font-mono leading-snug text-zinc-50">
                    {cssSnippet}
                  </pre>
                ) : (
                  <p className="text-[10px] text-zinc-400">
                    Enter a base font size and one value to see a CSS snippet.
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-100 bg-white px-3 py-2">
              <p className="font-medium text-zinc-800">Base presets comparison</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-zinc-600">Rem value to compare</p>
                <input
                  value={scaleRemValue}
                  onChange={(event) => setScaleRemValue(sanitizeDecimalInput(event.target.value))}
                  inputMode="decimal"
                  type="number"
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                      return;
                    }

                    event.preventDefault();

                    const step = event.shiftKey ? effectiveNudgeAmount : baseStepAmount;
                    const direction = event.key === "ArrowUp" ? 1 : -1;
                    const delta = step * direction;
                    const nextValue = applyStepToValue(scaleRemValue, delta);

                    setScaleRemValue(nextValue);
                  }}
                  className="h-7 w-20 rounded-md border border-zinc-200 bg-white px-2 text-right text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                  aria-label="Rem value used for base comparison"
                  placeholder="1"
                />
              </div>
              <div className="mt-2 overflow-hidden rounded-md border border-zinc-100">
                <div className="grid grid-cols-3 bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-500">
                  <span>Base</span>
                  <span className="text-right">Pixels</span>
                  <span className="text-right">% of base</span>
                </div>
                <div className="divide-y divide-zinc-100 bg-white">
                  {presetBases.map((preset) => {
                    const remNumeric = Number.parseFloat(scaleRemValue) || 0;
                    const px = preset * remNumeric;
                    const percent = remNumeric * 100;

                    return (
                      <div
                        key={preset}
                        className="grid grid-cols-3 px-2 py-1 text-[10px] text-zinc-600"
                      >
                        <span>{preset}px</span>
                        <span className="text-right">
                          {remNumeric > 0 ? formatNumber(px) : "–"}
                        </span>
                        <span className="text-right">
                          {remNumeric > 0 ? `${formatNumber(percent)}%` : "–"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
