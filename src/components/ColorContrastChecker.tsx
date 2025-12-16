"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type ColorContrastCheckerProps = {
  variant?: "simple" | "full";
};

function parseHexColor(value: string): RgbColor | null {
  const hex = value.trim().replace(/^#/, "");

  if (hex.length !== 3 && hex.length !== 6) {
    return null;
  }

  const normalized = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;

  const int = Number.parseInt(normalized, 16);

  if (Number.isNaN(int)) {
    return null;
  }

  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return { r, g, b };
}

function srgbChannelToLinear(value: number): number {
  const channel = value / 255;

  if (channel <= 0.03928) {
    return channel / 12.92;
  }

  return ((channel + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: RgbColor): number {
  const r = srgbChannelToLinear(color.r);
  const g = srgbChannelToLinear(color.g);
  const b = srgbChannelToLinear(color.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(foreground: string, background: string): number | null {
  const fg = parseHexColor(foreground);
  const bg = parseHexColor(background);

  if (!fg || !bg) {
    return null;
  }

  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function formatHex(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function normalizeHexInput(value: string): string {
  const trimmed = value.trim().replace(/^#/, "").toLowerCase();

  if (!trimmed) {
    return "";
  }

  let hex = trimmed.replace(/[^0-9a-f]/g, "");

  if (!hex) {
    return "";
  }

  if (hex.length === 1) {
    hex = hex.repeat(6);
  } else if (hex.length === 2) {
    hex = hex.repeat(3);
  } else if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  } else if (hex.length > 6) {
    hex = hex.slice(0, 6);
  }

  return `#${hex}`;
}

function rgbToHex(color: RgbColor): string {
  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");

  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

function mixColors(a: RgbColor, b: RgbColor, t: number): RgbColor {
  const factor = Math.min(1, Math.max(0, t));

  return {
    r: Math.round(a.r + (b.r - a.r) * factor),
    g: Math.round(a.g + (b.g - a.g) * factor),
    b: Math.round(a.b + (b.b - a.b) * factor),
  };
}

function suggestAccessibleColor(
  foregroundHex: string,
  backgroundHex: string,
  targetRatio: number,
): string | null {
  const currentRatio = getContrastRatio(foregroundHex, backgroundHex);

  if (currentRatio !== null && currentRatio >= targetRatio) {
    return null;
  }

  const foreground = parseHexColor(foregroundHex);
  const background = parseHexColor(backgroundHex);

  if (!foreground || !background) {
    return null;
  }

  const blackRatio = getContrastRatio("#000000", backgroundHex) ?? 0;
  const whiteRatio = getContrastRatio("#ffffff", backgroundHex) ?? 0;
  const targetHex = blackRatio >= whiteRatio ? "#000000" : "#ffffff";
  const target = parseHexColor(targetHex);

  if (!target) {
    return null;
  }

  let low = 0;
  let high = 1;
  let best: RgbColor | null = null;

  for (let index = 0; index < 20; index += 1) {
    const mid = (low + high) / 2;
    const mixed = mixColors(foreground, target, mid);
    const mixedHex = rgbToHex(mixed);
    const ratio = getContrastRatio(mixedHex, backgroundHex);

    if (ratio !== null && ratio >= targetRatio) {
      best = mixed;
      high = mid;
    } else {
      low = mid;
    }
  }

  if (!best) {
    return null;
  }

  return rgbToHex(best);
}

function copyHexToClipboard(value: string) {
  const normalized = normalizeHexInput(value);

  if (!normalized) {
    return;
  }

  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return;
  }

  navigator.clipboard.writeText(normalized).catch(() => undefined);
}

type ColorSwatchPickerProps = {
  value: string;
  onChange: (value: string) => void;
  fallback: string;
  label: string;
};

function ColorSwatchPicker({ value, onChange, fallback, label }: ColorSwatchPickerProps) {
  const normalized = formatHex(value) || fallback;

  return (
    <label className="relative inline-flex h-full w-9 cursor-pointer items-center justify-center overflow-hidden rounded border border-zinc-400">
      <span className="sr-only">{label}</span>
      <span
        className="absolute inset-0"
        style={{ backgroundColor: normalized }}
      />
      <input
        type="color"
        value={normalized}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  );
}

export function ColorContrastChecker({ variant = "full" }: ColorContrastCheckerProps) {
  const [textColor, setTextColor] = useState("#111827");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [containerColor, setContainerColor] = useState("#f4f4f5");
  const [fontSize, setFontSize] = useState("16");
  const [colorMode, setColorMode] = useState<"two" | "three">("two");

  const isFull = variant === "full";
  const effectiveMode = isFull ? colorMode : "two";

  const formattedTextColor = formatHex(textColor);
  const formattedBackgroundColor = formatHex(backgroundColor);
  const formattedContainerColor = formatHex(containerColor);

  const twoColorRatio = useMemo(
    () => getContrastRatio(formattedTextColor, formattedBackgroundColor),
    [formattedTextColor, formattedBackgroundColor],
  );

  const bgContainerRatio = useMemo(
    () => getContrastRatio(formattedBackgroundColor, formattedContainerColor),
    [formattedBackgroundColor, formattedContainerColor],
  );

  const containerTextRatio = useMemo(
    () => getContrastRatio(formattedContainerColor, formattedTextColor),
    [formattedContainerColor, formattedTextColor],
  );

  const activeBackgroundColor =
    effectiveMode === "two" ? formattedBackgroundColor : formattedContainerColor;

  const activeRatio = effectiveMode === "two" ? twoColorRatio : containerTextRatio;
  const roundedActiveRatio = activeRatio ? Math.round(activeRatio * 100) / 100 : null;

  const passesAANormal = activeRatio !== null && activeRatio >= 4.5;
  const passesAAALarge = activeRatio !== null && activeRatio >= 3;
  const passesAAA = activeRatio !== null && activeRatio >= 7;

  const bgContainerPassAA = bgContainerRatio !== null && bgContainerRatio >= 4.5;
  const containerTextPassAA = containerTextRatio !== null && containerTextRatio >= 4.5;

  const recommendedTextColor = useMemo(
    () =>
      activeBackgroundColor && formattedTextColor
        ? suggestAccessibleColor(formattedTextColor, activeBackgroundColor, 4.5)
        : null,
    [formattedTextColor, activeBackgroundColor],
  );

  const previewStyleTwoColor = {
    color: formattedTextColor,
    backgroundColor: formattedBackgroundColor,
    fontSize: `${Number.parseInt(fontSize || "16", 10)}px`,
  };

  const previewStyleThreeColorOuter = {
    backgroundColor: formattedBackgroundColor,
  };

  const previewStyleThreeColorInner = {
    backgroundColor: formattedContainerColor,
    color: formattedTextColor,
    fontSize: `${Number.parseInt(fontSize || "16", 10)}px`,
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Input
            </div>
            <div className="flex h-9 items-center gap-3">
              {isFull && (
                <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 p-0.5 text-[11px] font-medium text-zinc-600">
                  <button
                    type="button"
                    onClick={() => setColorMode("two")}
                    className={`rounded-full px-2 py-0.5 ${
                      effectiveMode === "two"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500"
                    }`}
                  >
                    2 colors
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode("three")}
                    className={`rounded-full px-2 py-0.5 ${
                      effectiveMode === "three"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500"
                    }`}
                  >
                    3 colors
                  </button>
                </div>
              )}
              <p className="text-xs text-zinc-400">Hex values, with or without #</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-700">
                Text color
              </label>
              <div className="flex h-9 items-center gap-2">
                <ColorSwatchPicker
                  value={textColor}
                  onChange={setTextColor}
                  fallback="#000000"
                  label="Pick text color"
                />
                <div className="relative h-full flex-1">
                  <input
                    value={textColor}
                    onChange={(event) => setTextColor(event.target.value)}
                    onBlur={() => setTextColor((current) => normalizeHexInput(current))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        setTextColor((current) => normalizeHexInput(current));
                      }
                    }}
                    placeholder="#111827"
                    className="h-full w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-8 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => copyHexToClipboard(textColor)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-400 transition-colors hover:text-zinc-600"
                    aria-label="Copy text color value"
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
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-700">
                Background
              </label>
              <div className="flex h-9 items-center gap-2">
                <ColorSwatchPicker
                  value={backgroundColor}
                  onChange={setBackgroundColor}
                  fallback="#ffffff"
                  label="Pick background color"
                />
                <div className="relative h-full flex-1">
                  <input
                    value={backgroundColor}
                    onChange={(event) => setBackgroundColor(event.target.value)}
                    onBlur={() => setBackgroundColor((current) => normalizeHexInput(current))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        setBackgroundColor((current) => normalizeHexInput(current));
                      }
                    }}
                    placeholder="#ffffff"
                    className="h-full w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-8 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => copyHexToClipboard(backgroundColor)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-400 transition-colors hover:text-zinc-600"
                    aria-label="Copy background color value"
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
          </div>
          {isFull && effectiveMode === "three" && (
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-medium text-zinc-700">
                Container
              </label>
              <div className="flex items-center gap-3">
                <ColorSwatchPicker
                  value={containerColor}
                  onChange={setContainerColor}
                  fallback="#f4f4f5"
                  label="Pick container color"
                />
                <div className="relative flex-1">
                  <input
                    value={containerColor}
                    onChange={(event) => setContainerColor(event.target.value)}
                    onBlur={() => setContainerColor((current) => normalizeHexInput(current))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        setContainerColor((current) => normalizeHexInput(current));
                      }
                    }}
                    placeholder="#f4f4f5"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-8 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => copyHexToClipboard(containerColor)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-400 transition-colors hover:text-zinc-600"
                    aria-label="Copy container color value"
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
          )}
          <div className="mt-4 space-y-2">
            <label className="block text-xs font-medium text-zinc-700">
              Font size (px)
            </label>
            <input
              type="number"
              min={10}
              max={72}
              value={fontSize}
              onChange={(event) => setFontSize(event.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
            />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="hero-preview rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Preview</p>
            {roundedActiveRatio !== null ? (
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-zinc-500">
                  {roundedActiveRatio.toFixed(2)} : 1
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    passesAANormal
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {passesAANormal ? "Pass AA" : "Fail AA"}
                </span>
              </div>
            ) : (
              <p className="text-xs font-mono text-amber-600">Enter valid hex colors</p>
            )}
          </div>
          {isFull && roundedActiveRatio !== null && !passesAANormal && recommendedTextColor && (
            <div className="mb-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-800">
              <p className="font-medium">Recommendation</p>
              <p>
                Try text color{" "}
                <span className="font-mono">{recommendedTextColor}</span> to reach AA contrast.
              </p>
            </div>
          )}
          {effectiveMode === "two" && (
            <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <div
                className="rounded-lg border border-zinc-200 px-3 py-3 text-xs leading-relaxed"
                style={previewStyleTwoColor}
              >
                <p
                  className="font-semibold"
                  style={{ fontSize: "1.05em" }}
                >
                  Sample interface heading
                </p>
                <p
                  className="font-medium"
                  style={{ fontSize: "0.95em" }}
                >
                  Supporting line with medium emphasis for short descriptions.
                </p>
                <p
                  className="mt-1 opacity-80"
                  style={{ fontSize: "0.9em" }}
                >
                  Long-form body copy appears at a regular weight to check comfortable reading.
                </p>
              </div>
              {isFull && (
                <div className="grid gap-2 text-xs">
                  <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-3 py-2">
                    <div>
                      <p className="font-medium text-zinc-800">AA normal</p>
                      <p className="text-[11px] text-zinc-500">4.5 : 1 or higher</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        passesAANormal
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {passesAANormal ? "Pass" : "Fail"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-3 py-2">
                    <div>
                      <p className="font-medium text-zinc-800">AA large</p>
                      <p className="text-[11px] text-zinc-500">3 : 1 or higher</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        passesAAALarge
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {passesAAALarge ? "Pass" : "Fail"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-3 py-2">
                    <div>
                      <p className="font-medium text-zinc-800">AAA normal</p>
                      <p className="text-[11px] text-zinc-500">7 : 1 or higher</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        passesAAA ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {passesAAA ? "Pass" : "Fail"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          {isFull && effectiveMode === "three" && (
            <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <div
                className="rounded-lg border border-zinc-200 p-3 text-xs leading-relaxed"
                style={previewStyleThreeColorOuter}
              >
                <div
                  className="rounded-md border border-zinc-200 px-3 py-3"
                  style={previewStyleThreeColorInner}
                >
                  <p
                    className="font-semibold"
                    style={{ fontSize: "1.05em" }}
                  >
                    Container heading example
                  </p>
                  <p
                    className="font-medium"
                    style={{ fontSize: "0.95em" }}
                  >
                    Medium-emphasis copy tested against the container surface.
                  </p>
                  <p
                    className="mt-1 opacity-80"
                    style={{ fontSize: "0.9em" }}
                  >
                    Background, container, and text are all evaluated separately for clarity.
                  </p>
                </div>
              </div>
              <div className="grid gap-2 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-3 py-2">
                  <div>
                    <p className="font-medium text-zinc-800">Background ↔ Container</p>
                    <p className="text-[11px] text-zinc-500">
                      {bgContainerRatio !== null ? `${bgContainerRatio.toFixed(2)} : 1` : "Enter colors"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      bgContainerPassAA
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {bgContainerPassAA ? "Pass AA" : "Fail AA"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-3 py-2">
                  <div>
                    <p className="font-medium text-zinc-800">Container ↔ Text</p>
                    <p className="text-[11px] text-zinc-500">
                      {containerTextRatio !== null
                        ? `${containerTextRatio.toFixed(2)} : 1`
                        : "Enter colors"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      containerTextPassAA
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {containerTextPassAA ? "Pass AA" : "Fail AA"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
