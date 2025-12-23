"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useSettings } from "@/providers/SettingsProvider";
type TypeScaleGeneratorVariant = "hero" | "full";

type TypeScaleGeneratorProps = {
  variant?: TypeScaleGeneratorVariant;
};

type ScalePresetId =
  | "minorSecond"
  | "majorSecond"
  | "minorThird"
  | "majorThird"
  | "perfectFourth"
  | "augmentedFourth"
  | "perfectFifth"
  | "goldenRatio";

type ScalePreset = {
  id: ScalePresetId;
  label: string;
  ratio: number;
  description: string;
};

const scalePresets: ScalePreset[] = [
  {
    id: "minorSecond",
    label: "Minor second · 1.067",
    ratio: 1.067,
    description: "Very subtle steps, good for dense dashboards and data-heavy UIs.",
  },
  {
    id: "majorSecond",
    label: "Major second · 1.125",
    ratio: 1.125,
    description: "Gentle scale for product interfaces with compact typography.",
  },
  {
    id: "minorThird",
    label: "Minor third · 1.200",
    ratio: 1.2,
    description: "Balanced hierarchy and commonly used as a default UI scale.",
  },
  {
    id: "majorThird",
    label: "Major third · 1.250",
    ratio: 1.25,
    description: "Stronger hierarchy that is also widely used in design systems.",
  },
  {
    id: "perfectFourth",
    label: "Perfect fourth · 1.333",
    ratio: 1.333,
    description: "Bold scale for landing pages and storytelling content.",
  },
  {
    id: "augmentedFourth",
    label: "Augmented fourth · 1.414",
    ratio: 1.414,
    description: "Large jumps; works when you have very few text sizes.",
  },
  {
    id: "perfectFifth",
    label: "Perfect fifth · 1.500",
    ratio: 1.5,
    description: "Very dramatic steps best suited for display-first layouts.",
  },
  {
    id: "goldenRatio",
    label: "Golden ratio · 1.618",
    ratio: 1.618,
    description: "High contrast scale inspired by the golden ratio for expressive headings.",
  },
];

type ScaleLevel = {
  id: string;
  label: string;
  step: number;
};

const scaleLevels: ScaleLevel[] = [
  { id: "xxs", label: "X-small", step: -2 },
  { id: "xs", label: "Small", step: -1 },
  { id: "base", label: "Body", step: 0 },
  { id: "h6", label: "H6", step: 2 },
  { id: "h5", label: "H5", step: 3 },
  { id: "h4", label: "H4", step: 4 },
  { id: "h3", label: "H3", step: 5 },
  { id: "h2", label: "H2", step: 6 },
  { id: "h1", label: "H1", step: 7 },
];

type ComputedScaleLevel = ScaleLevel & {
  fontSizePx: number;
  rawPx: number;
  rem: number;
};

type WeightId = "light" | "regular" | "medium" | "semibold" | "bold" | "extrabold" | "black";

type FontOption = {
  id: string;
  label: string;
  stack: string;
  family?: string;
};

const baseFontOptions: FontOption[] = [
  {
    id: "system-sans",
    label: "System sans",
    stack: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  {
    id: "system-serif",
    label: "System serif",
    stack: "Georgia, 'Times New Roman', serif",
  },
  {
    id: "inter",
    label: "Inter",
    stack: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  {
    id: "roboto",
    label: "Roboto",
    stack: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    stack:
      "'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  {
    id: "merriweather",
    label: "Merriweather",
    stack: "Merriweather, Georgia, 'Times New Roman', serif",
  },
];

const loadedFontFamilies = new Set<string>();

function ensureFontStylesheet(family: string) {
  if (typeof document === "undefined") {
    return;
  }

  if (loadedFontFamilies.has(family)) {
    return;
  }

  const id = `google-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
  const existing = document.getElementById(id);

  if (existing) {
    loadedFontFamilies.add(family);
    return;
  }

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:wght@400;500;600;700;800;900&display=swap`;

  document.head.appendChild(link);
  loadedFontFamilies.add(family);
}

function normalizeHexColor(input: string): string | null {
  const value = input.trim();

  if (value.length === 0) {
    return null;
  }

  const match = value.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/u);

  if (!match) {
    return null;
  }

  let hex = match[1];

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }

  return `#${hex.toLowerCase()}`;
}

function nudgeHexColor(input: string, direction: 1 | -1, baseStep: number, isShift: boolean) {
  const normalized = normalizeHexColor(input);

  if (!normalized) {
    return null;
  }

  const step = baseStep * (isShift ? 3 : 1);
  const delta = direction === 1 ? step : -step;
  const r = Math.max(
    0,
    Math.min(255, parseInt(normalized.slice(1, 3), 16) + delta),
  );
  const g = Math.max(
    0,
    Math.min(255, parseInt(normalized.slice(3, 5), 16) + delta),
  );
  const b = Math.max(
    0,
    Math.min(255, parseInt(normalized.slice(5, 7), 16) + delta),
  );
  const toHex = (value: number) => value.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function formatNumber(value: number, decimals = 3): string {
  if (!Number.isFinite(value)) {
    return "";
  }

  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  const text = rounded.toString();

  if (!text.includes(".")) {
    return text;
  }

  return text.replace(/(\.\d*?[1-9])0+$/u, "$1").replace(/\.0+$/u, "");
}

function getWeightValue(id: WeightId): number {
  if (id === "light") {
    return 300;
  }

  if (id === "medium") {
    return 500;
  }

  if (id === "semibold") {
    return 600;
  }

  if (id === "bold") {
    return 700;
  }

  if (id === "extrabold") {
    return 800;
  }

  if (id === "black") {
    return 900;
  }

  return 400;
}

export function TypeScaleGenerator({ variant = "full" }: TypeScaleGeneratorProps) {
  const { nudgeAmount, appearance } = useSettings();
  const isDarkMode = appearance === "dark";
  const effectiveNudgeAmount =
    Number.isFinite(nudgeAmount) && nudgeAmount > 0 ? nudgeAmount : 8;
  const [baseFontSize, setBaseFontSize] = useState("16");
  const [selectedPresetId, setSelectedPresetId] = useState<ScalePresetId>("majorThird");
  const [previewText, setPreviewText] = useState("Aa");
  const [fontId, setFontId] = useState("inter");
  const [weightId, setWeightId] = useState<WeightId>("regular");
  const [lineHeight, setLineHeight] = useState("auto");
  const [letterSpacing, setLetterSpacing] = useState("auto");
  const [lineHeightUnit, setLineHeightUnit] = useState<"px" | "%" | "auto">("auto");
  const [letterSpacingUnit, setLetterSpacingUnit] = useState<"px" | "%" | "auto">("auto");
  const [foregroundColor, setForegroundColor] = useState(
    isDarkMode ? "#ffffff" : "#000000",
  );
  const [backgroundColor, setBackgroundColor] = useState(
    isDarkMode ? "#020617" : "#ffffff",
  );
  const [googleFontOptions, setGoogleFontOptions] = useState<FontOption[]>([]);
  const [titleToBodySpacing, setTitleToBodySpacing] = useState(16);
  const [bodyToButtonsSpacing, setBodyToButtonsSpacing] = useState(40);
  const [buttonsToCaptionSpacing, setButtonsToCaptionSpacing] = useState(8);
  const [dragInfo, setDragInfo] = useState<{
    target: "title-body" | "body-buttons" | "buttons-caption";
    startY: number;
    startValue: number;
  } | null>(null);
  const [fontSearchQuery, setFontSearchQuery] = useState("");
  const [fontCursorIndex, setFontCursorIndex] = useState<number | null>(null);

  const allFontOptions = useMemo(
    () => [...baseFontOptions, ...googleFontOptions],
    [googleFontOptions],
  );

  const selectedPreset =
    scalePresets.find((preset) => preset.id === selectedPresetId) ?? scalePresets[3];

  const baseFontSizePx = useMemo(() => {
    const parsed = Number.parseFloat(baseFontSize.trim());

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 16;
    }

    return parsed;
  }, [baseFontSize]);

  const computedLevels = useMemo<ComputedScaleLevel[]>(() => {
    const ratio = selectedPreset.ratio > 0 ? selectedPreset.ratio : 1.25;

    return scaleLevels.map((level) => {
      const rawPx = baseFontSizePx * ratio ** level.step;
      const clampedPx = Math.min(Math.max(rawPx, 8), 160);
      const rem = rawPx / baseFontSizePx;

      return {
        ...level,
        fontSizePx: clampedPx,
        rawPx,
        rem,
      };
    });
  }, [baseFontSizePx, selectedPreset.ratio]);

  const visibleLevels =
    variant === "hero"
      ? computedLevels.filter((level) => level.step >= 0).reverse()
      : [...computedLevels].reverse();

  const levelMap = useMemo(() => {
    const map: Record<string, ComputedScaleLevel> = {};

    computedLevels.forEach((level) => {
      map[level.id] = level;
    });

    return map;
  }, [computedLevels]);

  const headingLevel = levelMap.h1 ?? computedLevels[computedLevels.length - 1];
  const bodyLevel = levelMap.base ?? computedLevels[0];
  const smallBodyLevel = levelMap.xs ?? bodyLevel;

  const selectedFont =
    allFontOptions.find((option) => option.id === fontId) ??
    allFontOptions[0] ??
    baseFontOptions[0];

  const sortedFontOptions = useMemo(
    () =>
      [...allFontOptions].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
      ),
    [allFontOptions],
  );

  const defaultLetterSpacingForFont = useMemo(() => {
    const id = selectedFont.id;

    if (id === "system-sans" || id === "inter" || id.startsWith("google-")) {
      return "0";
    }

    if (id === "space-grotesk") {
      return "2px";
    }

    if (id === "merriweather" || id === "system-serif") {
      return "0.5px";
    }

    return "0";
  }, [selectedFont.id]);

  const filteredFontOptions = useMemo(() => {
    const query = fontSearchQuery.trim().toLowerCase();

    if (query.length === 0) {
      return sortedFontOptions;
    }

    return sortedFontOptions.filter((option) => option.label.toLowerCase().includes(query));
  }, [sortedFontOptions, fontSearchQuery]);

  useEffect(() => {
    if (!selectedFont.family) {
      return;
    }

    ensureFontStylesheet(selectedFont.family);
  }, [selectedFont.family]);

  useEffect(() => {
    let cancelled = false;

    async function loadFonts() {
      try {
        const response = await fetch("/api/google-fonts");

        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const items = (payload?.fonts ?? []) as { family: string; category: string }[];

        if (cancelled) {
          return;
        }

        const options: FontOption[] = items.map((item) => {
          const family = item.family;

          return {
            id: `google-${family.replace(/\s+/g, "-").toLowerCase()}`,
            label: family,
            stack: `'${family}', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
            family,
          };
        });

        setGoogleFontOptions(options);
      } catch {
        return;
      }
    }

    loadFonts();

    return () => {
      cancelled = true;
    };
  }, []);

  const numericLineHeight = useMemo(() => {
    const value = lineHeight.trim();

    if (value.length === 0) {
      return "140%";
    }

    if (lineHeightUnit === "auto" || value.toLowerCase() === "auto") {
      return "normal";
    }

    const percentMatch = value.match(/^(\d+(\.\d+)?)%$/u);

    if (percentMatch) {
      const parsed = Number.parseFloat(percentMatch[1]);

      if (!Number.isFinite(parsed)) {
        return "140%";
      }

      const clamped = Math.max(80, Math.min(240, parsed));

      return `${clamped}%`;
    }

    const pxMatch = value.match(/^(\d+(\.\d+)?)px$/u);

    if (pxMatch) {
      const parsed = Number.parseFloat(pxMatch[1]);

      if (!Number.isFinite(parsed)) {
        return "22px";
      }

      const clamped = Math.max(8, Math.min(80, parsed));

      return `${clamped}px`;
    }

    const parsed = Number.parseFloat(value);

    if (!Number.isFinite(parsed)) {
      return "140%";
    }

    if (lineHeightUnit === "%") {
      const clamped = Math.max(80, Math.min(240, parsed));

      return `${clamped}%`;
    }

    const clamped = Math.max(8, Math.min(80, parsed));

    return `${clamped}px`;
  }, [lineHeight, lineHeightUnit]);

  const letterSpacingValue = useMemo(() => {
    const raw = letterSpacing.trim();
    const value =
      raw.length === 0 || letterSpacingUnit === "auto" || raw.toLowerCase() === "auto"
        ? defaultLetterSpacingForFont.trim()
        : raw;

    if (value.length === 0) {
      return "0em";
    }

    const pxMatch = value.match(/^(-?\d+(\.\d+)?)px$/u);

    if (pxMatch) {
      const parsed = Number.parseFloat(pxMatch[1]);

      if (!Number.isFinite(parsed)) {
        return "0px";
      }

      const clamped = Math.max(-5, Math.min(20, parsed));

      return `${clamped}px`;
    }

    const percentMatch = value.match(/^(-?\d+(\.\d+)?)%$/u);

    if (percentMatch) {
      const parsed = Number.parseFloat(percentMatch[1]);

      if (!Number.isFinite(parsed)) {
        return "0em";
      }

      const clamped = Math.max(-50, Math.min(200, parsed));
      const em = clamped / 100;

      return `${em}em`;
    }

    const parsed = Number.parseFloat(value);

    if (!Number.isFinite(parsed)) {
      return "0em";
    }

    if (letterSpacingUnit === "%") {
      const clamped = Math.max(-50, Math.min(200, parsed));
      const em = clamped / 100;

      return `${em}em`;
    }

    const clamped = Math.max(-5, Math.min(20, parsed));

    return `${clamped}px`;
  }, [letterSpacing, letterSpacingUnit, defaultLetterSpacingForFont]);

  const containerPadding = variant === "full" ? "p-5 sm:p-6" : "";
  const containerChrome =
    variant === "full" ? "rounded-2xl border border-zinc-200 bg-white" : "";
  const layoutColumns =
    variant === "full"
      ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.2fr)]"
      : "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]";
  const layoutRow =
    variant === "full"
      ? layoutColumns
      : "lg:grid-cols-1";
  const descriptionText =
    variant === "full"
      ? "Adjust the base size and scale ratio on the left, see the size ladder in the middle, and preview a simple page on the right."
      : "Type Scale Generator.";

  function handleDragStart(
    event: PointerEvent<HTMLDivElement>,
    target: "title-body" | "body-buttons" | "buttons-caption",
  ) {
    event.preventDefault();
    const currentValue = target === "title-body" ? titleToBodySpacing : bodyToButtonsSpacing;
    setDragInfo({
      target,
      startY: event.clientY,
      startValue: currentValue,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDragMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragInfo) {
      return;
    }

    const delta = event.clientY - dragInfo.startY;
    const raw = dragInfo.startValue + delta;
    const clamped = Math.max(0, Math.min(96, raw));

    if (dragInfo.target === "title-body") {
      setTitleToBodySpacing(clamped);
    } else if (dragInfo.target === "body-buttons") {
      setBodyToButtonsSpacing(clamped);
    } else {
      setButtonsToCaptionSpacing(clamped);
    }
  }

  function handleDragEnd(event: PointerEvent<HTMLDivElement>) {
    if (!dragInfo) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragInfo(null);
  }

  function handleBaseFontSizeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();

    const parsed = Number.parseFloat(baseFontSize.trim());
    const current = Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
    const step = event.shiftKey ? effectiveNudgeAmount : 1;
    const direction = event.key === "ArrowUp" ? 1 : -1;
    const next = Math.min(64, Math.max(8, current + direction * step));

    setBaseFontSize(String(next));
  }

  function handleLineHeightKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();

    const direction = event.key === "ArrowUp" ? 1 : -1;

    let unit = lineHeightUnit;
    const trimmed = lineHeight.trim().toLowerCase();

    let numeric: number;

    if (trimmed === "" || trimmed === "auto" || unit === "auto") {
      unit = "%";
      numeric = 140;
    } else {
      const match = trimmed.match(/-?\d+(\.\d+)?/u);
      const parsed = match ? Number.parseFloat(match[0]) : Number.NaN;

      if (!Number.isFinite(parsed)) {
        numeric = unit === "%" ? 140 : 22;
      } else {
        numeric = parsed;
      }
    }

    if (unit === "%") {
      const step = event.shiftKey ? effectiveNudgeAmount : 1;
      const next = Math.max(80, Math.min(240, numeric + direction * step));

      setLineHeightUnit("%");
      setLineHeight(`${next}%`);
    } else {
      const step = event.shiftKey ? effectiveNudgeAmount : 1;
      const next = Math.max(8, Math.min(80, numeric + direction * step));

      setLineHeightUnit("px");
      setLineHeight(`${next}px`);
    }
  }

  function handleLetterSpacingKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();

    const direction = event.key === "ArrowUp" ? 1 : -1;

    let unit = letterSpacingUnit;
    let source = letterSpacing.trim();

    if (source === "" || source.toLowerCase() === "auto" || unit === "auto") {
      source = defaultLetterSpacingForFont.trim();
    }

    const match = source.match(/-?\d+(\.\d+)?/u);
    const parsed = match ? Number.parseFloat(match[0]) : Number.NaN;
    const numeric = Number.isFinite(parsed) ? parsed : 0;

    if (unit !== "%" && unit !== "px") {
      unit = source.endsWith("%") ? "%" : "px";
    }

    if (unit === "%") {
      const step = event.shiftKey ? effectiveNudgeAmount : 1;
      const next = Math.max(-50, Math.min(200, numeric + direction * step));

      setLetterSpacingUnit("%");
      setLetterSpacing(`${next}%`);
    } else {
      const step = event.shiftKey ? effectiveNudgeAmount : 1;
      const next = Math.max(-5, Math.min(20, numeric + direction * step));

      setLetterSpacingUnit("px");
      setLetterSpacing(`${next}px`);
    }
  }

  function handleColorKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    current: string,
    setColor: (value: string) => void,
  ) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();

    const direction = event.key === "ArrowUp" ? 1 : -1;
    const next = nudgeHexColor(current, direction, 4, event.shiftKey);

    if (next) {
      setColor(next);
    }
  }

  function handleFontSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();

      const index =
        fontCursorIndex !== null && fontCursorIndex >= 0 && fontCursorIndex < filteredFontOptions.length
          ? fontCursorIndex
          : 0;
      const nextFont = filteredFontOptions[index];

      if (nextFont) {
        setFontId(nextFont.id);
        setFontSearchQuery(nextFont.label);
      }

      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();

    const step = event.shiftKey ? 5 : 1;
    const direction = event.key === "ArrowDown" ? 1 : -1;

    if (filteredFontOptions.length === 0) {
      return;
    }

    let currentIndex: number;

    if (
      fontCursorIndex !== null &&
      fontCursorIndex >= 0 &&
      fontCursorIndex < filteredFontOptions.length
    ) {
      currentIndex = fontCursorIndex;
    } else if (direction === 1) {
      currentIndex = 0;
    } else {
      currentIndex = filteredFontOptions.length - 1;
    }
    const rawNextIndex = currentIndex + direction * step;
    const nextIndex = Math.max(0, Math.min(filteredFontOptions.length - 1, rawNextIndex));
    const nextFont = filteredFontOptions[nextIndex];

    if (!nextFont) {
      return;
    }

    setFontCursorIndex(nextIndex);
    setFontId(nextFont.id);
  }

  return (
    <div className="space-y-4">
      <div className={`${containerChrome} ${containerPadding}`}>
        <div className={`flex flex-col gap-4 lg:grid ${layoutRow} lg:gap-4`}>
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                 <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {descriptionText}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-zinc-900/40">
              <div className="space-y-3">
                {variant === "full" && (
                  <div className="space-y-2">
                    <div className="space-y-1.5">
                      <div className="flex flex-row items-center gap-2">
                        <label className="text-[11px] font-medium text-zinc-700">
                          Base font size
                        </label>
                        <div className="inline-flex h-8 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={baseFontSize}
                            onChange={(event) => setBaseFontSize(event.target.value)}
                            onKeyDown={handleBaseFontSizeKeyDown}
                            className="h-8 w-9 border-0 bg-transparent px-1 text-right text-[11px] text-zinc-900 outline-none ring-0 placeholder:text-zinc-400"
                            placeholder="16"
                            aria-label="Base font size in pixels"
                          />
                          <span className="text-[11px] text-zinc-500">px</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">
                        Preview text
                      </label>
                      <input
                        type="text"
                        value={previewText}
                        onChange={(event) => setPreviewText(event.target.value)}
                        className="h-8 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[11px] text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                        placeholder="Aa"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">Scale</label>
                      <div className="flex flex-wrap gap-1.5">
                        {scalePresets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setSelectedPresetId(preset.id)}
                            className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                              selectedPresetId === preset.id
                                ? "border-red-500 bg-red-500 text-white"
                                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-transparent [data-theme=dark]:text-zinc-300"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <p className="pt-1 text-[10px] leading-relaxed text-zinc-500">
                        {selectedPreset.description}
                      </p>
                    </div>
                  </div>
                )}
                <div
                  className={
                    variant === "hero"
                      ? "space-y-0 divide-y divide-zinc-100"
                      : "space-y-2"
                  }
                >
                  {variant === "hero" && (
                    <div className="pb-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <div className="flex flex-row items-center gap-2">
                            <label className="text-[11px] font-medium text-zinc-700">
                              Base font size
                            </label>
                            <div className="inline-flex h-8 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={baseFontSize}
                                onChange={(event) => setBaseFontSize(event.target.value)}
                                onKeyDown={handleBaseFontSizeKeyDown}
                                className="h-8 w-9 border-0 bg-transparent px-1 text-right text-[11px] text-zinc-900 outline-none ring-0 placeholder:text-zinc-400"
                                placeholder="16"
                                aria-label="Base font size in pixels"
                              />
                              <span className="text-[11px] text-zinc-500">px</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex flex-row items-center gap-2">
                            <label className="text-[11px] font-medium text-zinc-700">Scale</label>
                            <select
                              value={selectedPresetId}
                              onChange={(event) =>
                                setSelectedPresetId(event.target.value as ScalePresetId)
                              }
                              className="h-8 w-full rounded-lg border border-zinc-200 bg-white px-2 text-[11px] text-zinc-900 outline-none ring-0 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                            >
                              {scalePresets.map((preset) => (
                                <option key={preset.id} value={preset.id}>
                                  {preset.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={variant === "hero" ? "space-y-1 pb-3" : "space-y-1"}>
                    <label className="text-[11px] font-medium text-zinc-700">Font</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={fontSearchQuery}
                        onChange={(event) => {
                          setFontSearchQuery(event.target.value);
                          setFontCursorIndex(null);
                        }}
                        onKeyDown={handleFontSearchKeyDown}
                        placeholder="Search fonts"
                        className="h-8 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-[11px] text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      />
                      <select
                        value={fontId}
                        onChange={(event) => setFontId(event.target.value)}
                        className="h-8 w-32 flex-none rounded-lg border border-zinc-200 bg-white pl-2 pr-7 text-[11px] text-zinc-900 outline-none ring-0 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                        style={{ fontFamily: selectedFont.stack }}
                      >
                        {filteredFontOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={variant === "hero" ? "space-y-1 py-3" : "space-y-1"}>
                    <label className="text-[11px] font-medium text-zinc-700">Weight</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        ["light", "Light"],
                        ["regular", "Regular"],
                        ["medium", "Medium"],
                        ["semibold", "Semibold"],
                        ["bold", "Bold"],
                        ["extrabold", "Extra bold"],
                        ["black", "Black"],
                      ].map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setWeightId(id as WeightId)}
                          className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                            weightId === id
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-transparent [data-theme=dark]:text-zinc-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div
                    className={
                      variant === "hero"
                        ? "grid w-full grid-cols-1 gap-2 pt-3 sm:grid-cols-2"
                        : "grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
                    }
                  >
                    <div className="space-y-1.5 min-w-0">
                      <label className="text-[11px] font-medium text-zinc-700">Line height</label>
                      <div className="inline-flex w-full min-w-0 max-w-full items-center overflow-hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-200">
                        <input
                          type="text"
                          value={lineHeight}
                          onChange={(event) => {
                            const next = event.target.value;
                            setLineHeight(next);

                            if (next.trim().toLowerCase() === "auto") {
                              setLineHeightUnit("auto");
                              return;
                            }

                            if (next.trim().endsWith("%")) {
                              setLineHeightUnit("%");
                            } else if (next.trim().endsWith("px")) {
                              setLineHeightUnit("px");
                            }
                          }}
                          onKeyDown={handleLineHeightKeyDown}
                          className="h-5 w-full min-w-0 overflow-hidden border-0 bg-transparent px-1 text-right text-[11px] text-zinc-900 outline-none ring-0 placeholder:text-zinc-400"
                          placeholder="auto, 22px, 140%"
                        />
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setLineHeightUnit("auto");
                            setLineHeight("auto");
                          }}
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            lineHeightUnit === "auto"
                              ? "bg-red-500 text-white"
                              : "border border-zinc-200 text-zinc-600 [data-theme=dark]:border-zinc-700 [data-theme=dark]:text-zinc-300"
                          }`}
                        >
                          auto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLineHeightUnit("px");
                            const numeric = Number.parseFloat(lineHeight.replace(/[^\d.-]/gu, ""));
                            const safe = Number.isFinite(numeric) ? numeric : 22;
                            const clamped = Math.max(8, Math.min(80, safe));
                            setLineHeight(`${clamped}px`);
                          }}
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            lineHeightUnit === "px"
                              ? "bg-red-500 text-white"
                              : "border border-zinc-200 text-zinc-600 [data-theme=dark]:border-zinc-700 [data-theme=dark]:text-zinc-300"
                          }`}
                        >
                          px
                        </button>
                          <button
                          type="button"
                          onClick={() => {
                            setLineHeightUnit("%");
                            const numeric = Number.parseFloat(lineHeight.replace(/[^\d.-]/gu, ""));
                            const safe = Number.isFinite(numeric) ? numeric : 140;
                            const clamped = Math.max(80, Math.min(240, safe));
                            setLineHeight(`${clamped}%`);
                          }}
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            lineHeightUnit === "%"
                              ? "bg-red-500 text-white"
                              : "border border-zinc-200 text-zinc-600 [data-theme=dark]:border-zinc-700 [data-theme=dark]:text-zinc-300"
                          }`}
                        >
                          %
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <label className="text-[11px] font-medium text-zinc-700">
                        Letter spacing
                      </label>
                      <div className="inline-flex w-full min-w-0 max-w-full items-center overflow-hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-200">
                        <input
                          type="text"
                          value={letterSpacing}
                          onChange={(event) => {
                            const next = event.target.value;
                            setLetterSpacing(next);

                            if (next.trim().toLowerCase() === "auto") {
                              setLetterSpacingUnit("auto");
                              return;
                            }

                            if (next.trim().endsWith("%")) {
                              setLetterSpacingUnit("%");
                            } else if (next.trim().endsWith("px")) {
                              setLetterSpacingUnit("px");
                            }
                          }}
                          onKeyDown={handleLetterSpacingKeyDown}
                          className="h-5 w-full min-w-0 overflow-hidden border-0 bg-transparent px-1 text-right text-[11px] text-zinc-900 outline-none ring-0 placeholder:text-zinc-400"
                          placeholder="auto, 2px, 5%"
                        />
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setLetterSpacingUnit("auto");
                            setLetterSpacing("auto");
                          }}
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            letterSpacingUnit === "auto"
                              ? "bg-red-500 text-white"
                              : "border border-zinc-200 text-zinc-600 [data-theme=dark]:border-zinc-700 [data-theme=dark]:text-zinc-300"
                          }`}
                        >
                          auto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLetterSpacingUnit("px");
                            const numeric = Number.parseFloat(
                              letterSpacing.replace(/[^\d.-]/gu, ""),
                            );
                            const safe = Number.isFinite(numeric) ? numeric : 0;
                            const clamped = Math.max(-5, Math.min(20, safe));
                            setLetterSpacing(`${clamped}px`);
                          }}
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            letterSpacingUnit === "px"
                              ? "bg-red-500 text-white"
                              : "border border-zinc-200 text-zinc-600 [data-theme=dark]:border-zinc-700 [data-theme=dark]:text-zinc-300"
                          }`}
                        >
                          px
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLetterSpacingUnit("%");
                            const numeric = Number.parseFloat(
                              letterSpacing.replace(/[^\d.-]/gu, ""),
                            );
                            const safe = Number.isFinite(numeric) ? numeric : 0;
                            const clamped = Math.max(-50, Math.min(200, safe));
                            setLetterSpacing(`${clamped}%`);
                          }}
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            letterSpacingUnit === "%"
                              ? "bg-red-500 text-white"
                              : "border border-zinc-200 text-zinc-600 [data-theme=dark]:border-zinc-700 [data-theme=dark]:text-zinc-300"
                          }`}
                        >
                          %
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {variant === "full" && (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">Text color</label>
                      <div className="flex h-8 items-stretch gap-1">
                        <div className="relative h-full w-8 rounded-md border border-zinc-200 bg-white">
                          <div
                            className="h-full w-full rounded-[4px]"
                            style={{ backgroundColor: foregroundColor }}
                          />
                          <input
                            type="color"
                            value={foregroundColor}
                            onChange={(event) => setForegroundColor(event.target.value)}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={foregroundColor}
                            onChange={(event) => setForegroundColor(event.target.value)}
                            onKeyDown={(event) =>
                              handleColorKeyDown(event, foregroundColor, setForegroundColor)
                            }
                            className="h-full w-full rounded-lg border border-zinc-200 bg-white px-3 pr-3 text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                          />
                          <span className="pointer-events-none absolute inset-y-1 right-0 w-px bg-zinc-200" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForegroundColor("#000000")}
                        className="inline-flex items-center justify-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600 hover:border-zinc-300"
                      >
                        <Image
                          src="/icons/reset.svg"
                          alt=""
                          width={12}
                          height={12}
                          className="h-3 w-3"
                        />
                        <span>Reset</span>
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-700">Background</label>
                      <div className="flex h-8 items-stretch gap-1">
                        <div className="relative h-full w-8 rounded-md border border-zinc-200 bg-white">
                          <div
                            className="h-full w-full rounded-[4px]"
                            style={{ backgroundColor: backgroundColor }}
                          />
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(event) => setBackgroundColor(event.target.value)}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={backgroundColor}
                            onChange={(event) => setBackgroundColor(event.target.value)}
                            onKeyDown={(event) =>
                              handleColorKeyDown(event, backgroundColor, setBackgroundColor)
                            }
                            className="h-full w-full rounded-lg border border-zinc-200 bg-white px-3 pr-3 text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                          />
                          <span className="pointer-events-none absolute inset-y-1 right-0 w-px bg-zinc-200" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBackgroundColor("#ffffff")}
                        className="inline-flex items-center justify-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600 hover:border-zinc-300"
                      >
                        <Image
                          src="/icons/reset.svg"
                          alt=""
                          width={12}
                          height={12}
                          className="h-3 w-3"
                        />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        <div className="space-y-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-zinc-900/40">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[11px] font-medium text-zinc-500 [data-theme=dark]:text-zinc-400">
                Sample
              </p>
              <p className="text-[11px] font-semibold text-zinc-700 [data-theme=dark]:text-zinc-100">
                Sizes
              </p>
            </div>
              <div
                className={
                  variant === "hero"
                    ? "space-y-1.5 h-72 overflow-y-auto overflow-x-hidden pr-1"
                    : "space-y-1.5 overflow-x-hidden"
                }
              >
                {visibleLevels.map((level) => (
                  <div
                    key={level.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-zinc-50 [data-theme=dark]:hover:bg-zinc-800/70"
                  >
                    <div className="space-y-0.5">
                      <p
                        className="truncate text-zinc-900 [data-theme=dark]:text-zinc-50"
                        style={{
                          fontSize: `${level.fontSizePx}px`,
                          lineHeight: numericLineHeight,
                          fontFamily: selectedFont.stack,
                          fontWeight: getWeightValue(weightId),
                          letterSpacing: letterSpacingValue,
                          color: foregroundColor,
                        }}
                      >
                        {variant === "hero" ? "AaBbCc" : previewText || "Aa"}
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-zinc-500 [data-theme=dark]:text-zinc-400">
                      <p className="text-[14px] font-semibold text-zinc-800 [data-theme=dark]:text-zinc-100">
                        {level.label}
                      </p>
                      <p className="mt-0.5 flex flex-col">
                        <span className="font-medium text-zinc-700 [data-theme=dark]:text-zinc-200">
                          {formatNumber(level.fontSizePx, 2)}
                          px
                        </span>
                        <span>{formatNumber(level.rem, 3)} rem</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {variant === "full" && (
            <div className="space-y-2">
              <div
                className="rounded-lg border border-zinc-100 px-4 py-5 sm:px-6 sm:py-6 [data-theme=dark]:border-zinc-700"
                style={{ backgroundColor }}
              >
                <div className="flex items-center justify-between pb-4">
                  <p className="text-[11px] font-medium text-zinc-700 [data-theme=dark]:text-zinc-100">
                    Page preview
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTitleToBodySpacing(16);
                      setBodyToButtonsSpacing(40);
                      setButtonsToCaptionSpacing(8);
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-semibold text-red-600 shadow-sm hover:border-red-300 hover:bg-red-100 hover:text-red-700"
                  >
                    <Image
                      src="/icons/reset.svg"
                      alt=""
                      width={12}
                      height={12}
                      className="h-3 w-3"
                    />
                    <span>Reset spacing</span>
                  </button>
                </div>
                <div className="h-px w-full bg-zinc-300 [data-theme=dark]:bg-zinc-700" />
                <div className="space-y-0 pt-4">
                  <div className="group relative inline-block">
                    <p
                      className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 [data-theme=dark]:text-zinc-400"
                      style={{
                        fontSize: `${Math.min(smallBodyLevel.fontSizePx, 12)}px`,
                        fontFamily: selectedFont.stack,
                        letterSpacing: letterSpacingValue,
                      }}
                    >
                      Design system
                    </p>
                    <div className="pointer-events-none absolute -top-5 right-0 hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-600 shadow-sm group-hover:inline-flex [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-zinc-900 [data-theme=dark]:text-zinc-300">
                      <span className="font-medium">{smallBodyLevel.label}</span>
                      <span className="mx-1 text-zinc-400">·</span>
                      <span>{Math.round(Math.min(smallBodyLevel.fontSizePx, 13))} px</span>
                    </div>
                  </div>

                  <div className="group relative mt-2">
                    <h2
                      className="max-w-sm text-balance break-words"
                      style={{
                        fontSize: `${Math.min(headingLevel.fontSizePx, 40)}px`,
                        lineHeight: numericLineHeight,
                        fontFamily: selectedFont.stack,
                        fontWeight: getWeightValue(weightId),
                        letterSpacing: letterSpacingValue,
                        color: foregroundColor,
                      }}
                    >
                      Design better interfaces with a clear type scale
                    </h2>
                    <div className="pointer-events-none absolute -top-5 right-0 hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-600 shadow-sm group-hover:inline-flex [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-zinc-900 [data-theme=dark]:text-zinc-300">
                      <span className="font-medium">{headingLevel.label}</span>
                      <span className="mx-1 text-zinc-400">·</span>
                      <span>{Math.round(Math.min(headingLevel.fontSizePx, 40))} px</span>
                    </div>
                  </div>

                  <div className="relative mt-3">
                    <div className="absolute left-0 right-0 top-0 h-px w-full bg-[repeating-linear-gradient(to_right,_#e5e7eb_0,_#e5e7eb_4px,_transparent_4px,_transparent_8px)]" />
                    <div
                      className="pointer-events-none absolute right-6 top-0"
                      style={{ height: Math.max(titleToBodySpacing, 0) }}
                    >
                      <div className="h-full w-px bg-[repeating-linear-gradient(to_bottom,_#e5e7eb_0,_#e5e7eb_4px,_transparent_4px,_transparent_8px)]" />
                    </div>
                    <div
                      className="pointer-events-auto absolute right-0 z-10"
                      style={{ top: Math.max(titleToBodySpacing, 0) / 2 }}
                    >
                      <div
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-red-200 bg-red-50/90 px-2 py-0.5 text-[10px] text-red-600 shadow-sm cursor-row-resize"
                        onPointerDown={(event) => handleDragStart(event, "title-body")}
                        onPointerMove={handleDragMove}
                        onPointerUp={handleDragEnd}
                      >
                        <span className="text-xs">↕</span>
                        <span>{Math.round(titleToBodySpacing)} px</span>
                      </div>
                    </div>
                    <div className="group relative">
                      <p
                        className="max-w-md break-words"
                        style={{
                          marginTop: titleToBodySpacing,
                          fontSize: `${Math.min(bodyLevel.fontSizePx, 16)}px`,
                          lineHeight: numericLineHeight,
                          fontFamily: selectedFont.stack,
                          fontWeight: getWeightValue(weightId),
                          letterSpacing: letterSpacingValue,
                          color: foregroundColor,
                        }}
                      >
                        Use this type scale to design typography systems for product interfaces.
                        Adjust the sizes here, then reuse the tokens in Figma, code, or design
                        handoff.
                      </p>
                      <div className="pointer-events-none absolute -top-5 right-0 hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-600 shadow-sm group-hover:inline-flex [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-zinc-900 [data-theme=dark]:text-zinc-300">
                        <span className="font-medium">{bodyLevel.label}</span>
                        <span className="mx-1 text-zinc-400">·</span>
                        <span>{Math.round(Math.min(bodyLevel.fontSizePx, 16))} px</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-3">
                    <div className="absolute left-0 right-0 top-0 h-px w-full bg-[repeating-linear-gradient(to_right,_#e5e7eb_0,_#e5e7eb_4px,_transparent_4px,_transparent_8px)]" />
                    <div
                      className="pointer-events-none absolute right-6 top-0"
                      style={{ height: Math.max(bodyToButtonsSpacing, 0) }}
                    >
                      <div className="h-full w-px bg-[repeating-linear-gradient(to_bottom,_#e5e7eb_0,_#e5e7eb_4px,_transparent_4px,_transparent_8px)]" />
                    </div>
                    <div
                      className="pointer-events-auto absolute right-0 z-10"
                      style={{ top: Math.max(bodyToButtonsSpacing, 0) / 2 }}
                    >
                      <div
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-red-200 bg-red-50/90 px-2 py-0.5 text-[10px] text-red-600 shadow-sm cursor-row-resize"
                        onPointerDown={(event) => handleDragStart(event, "body-buttons")}
                        onPointerMove={handleDragMove}
                        onPointerUp={handleDragEnd}
                      >
                        <span className="text-xs">↕</span>
                        <span>{Math.round(bodyToButtonsSpacing)} px</span>
                      </div>
                    </div>
                    <div
                      className="flex flex-wrap gap-2 pt-1"
                      style={{ marginTop: bodyToButtonsSpacing }}
                    >
                      <div className="group relative">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-3 text-white shadow-sm [data-theme=dark]:bg-red-400"
                          style={{
                            fontSize: `${bodyLevel.fontSizePx}px`,
                            lineHeight: 1.2,
                            fontFamily: selectedFont.stack,
                            fontWeight: getWeightValue(weightId),
                            letterSpacing: letterSpacingValue,
                          }}
                        >
                          Explore features
                        </button>
                        <div className="pointer-events-none absolute -top-5 right-0 hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-600 shadow-sm group-hover:inline-flex">
                          <span className="font-medium">{bodyLevel.label}</span>
                          <span className="mx-1 text-zinc-400">·</span>
                          <span>{Math.round(bodyLevel.fontSizePx)} px</span>
                        </div>
                      </div>
                      <div className="group relative">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-zinc-800 [data-theme=dark]:border-zinc-600 [data-theme=dark]:bg-transparent [data-theme=dark]:text-zinc-200"
                          style={{
                            fontSize: `${bodyLevel.fontSizePx}px`,
                            lineHeight: 1.2,
                            fontFamily: selectedFont.stack,
                            fontWeight: getWeightValue(weightId),
                            letterSpacing: letterSpacingValue,
                          }}
                        >
                          Get started
                        </button>
                        <div className="pointer-events-none absolute -top-5 right-0 hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-600 shadow-sm group-hover:inline-flex">
                          <span className="font-medium">{bodyLevel.label}</span>
                          <span className="mx-1 text-zinc-400">·</span>
                          <span>{Math.round(bodyLevel.fontSizePx)} px</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative mt-3">
                    <div className="absolute left-0 right-0 top-0 h-px w-full bg-[repeating-linear-gradient(to_right,_#e5e7eb_0,_#e5e7eb_4px,_transparent_4px,_transparent_8px)]" />
                    <div
                      className="pointer-events-none absolute right-6 top-0"
                      style={{ height: Math.max(buttonsToCaptionSpacing, 0) }}
                    >
                      <div className="h-full w-px bg-[repeating-linear-gradient(to_bottom,_#e5e7eb_0,_#e5e7eb_4px,_transparent_4px,_transparent_8px)]" />
                    </div>
                    <div
                      className="pointer-events-auto absolute right-0 z-10"
                      style={{ top: Math.max(buttonsToCaptionSpacing, 0) / 2 }}
                    >
                      <div
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-red-200 bg-red-50/90 px-2 py-0.5 text-[10px] text-red-600 shadow-sm cursor-row-resize"
                        onPointerDown={(event) => handleDragStart(event, "buttons-caption")}
                        onPointerMove={handleDragMove}
                        onPointerUp={handleDragEnd}
                      >
                        <span className="text-xs">↕</span>
                        <span>{Math.round(buttonsToCaptionSpacing)} px</span>
                      </div>
                    </div>
                    <div className="group relative">
                      <p
                        className="pt-1 text-zinc-500 [data-theme=dark]:text-zinc-400"
                        style={{
                          marginTop: buttonsToCaptionSpacing,
                          fontSize: `${Math.min(smallBodyLevel.fontSizePx, 12)}px`,
                          lineHeight: numericLineHeight,
                          fontFamily: selectedFont.stack,
                          fontWeight: getWeightValue(weightId),
                          letterSpacing: letterSpacingValue,
                          color: foregroundColor,
                        }}
                      >
                        No credit card required. Adjust sizes here and copy the tokens into your
                        design.
                      </p>
                      <div className="pointer-events-none absolute -top-5 right-0 hidden rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-600 shadow-sm group-hover:inline-flex [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-zinc-900 [data-theme=dark]:text-zinc-300">
                        <span className="font-medium">{smallBodyLevel.label}</span>
                        <span className="mx-1 text-zinc-400">·</span>
                        <span>{Math.round(Math.min(smallBodyLevel.fontSizePx, 13))} px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
