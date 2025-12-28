"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useSettings } from "@/providers/SettingsProvider";

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

type HslColor = {
  h: number;
  s: number;
  l: number;
};

type CopyNoticeState = {
  label: string;
  x: number;
  y: number;
};

type ColorContrastCheckerProps = {
  variant?: "simple" | "full";
};

const COLOR_CONTRAST_PRESETS_STORAGE_KEY = "you-i-color-contrast-presets";

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

function rgbToHsl(color: RgbColor): HslColor {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }

    h /= 6;
  }

  return { h, s, l };
}

function hslToRgb(color: HslColor): RgbColor {
  const h = color.h;
  const s = color.s;
  const l = color.l;

  if (s === 0) {
    const value = Math.round(l * 255);

    return { r: value, g: value, b: value };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const hueToRgb = (t: number) => {
    let temp = t;

    if (temp < 0) {
      temp += 1;
    }

    if (temp > 1) {
      temp -= 1;
    }

    if (temp < 1 / 6) {
      return p + (q - p) * 6 * temp;
    }

    if (temp < 1 / 2) {
      return q;
    }

    if (temp < 2 / 3) {
      return p + (q - p) * (2 / 3 - temp) * 6;
    }

    return p;
  };

  const r = Math.round(hueToRgb(h + 1 / 3) * 255);
  const g = Math.round(hueToRgb(h) * 255);
  const b = Math.round(hueToRgb(h - 1 / 3) * 255);

  return { r, g, b };
}

function getHexLightness(value: string, fallback: string): number {
  const rgb = parseHexColor(value) ?? parseHexColor(fallback);

  if (!rgb) {
    return 50;
  }

  const { l } = rgbToHsl(rgb);

  return Math.round(l * 100);
}

function setHexLightness(value: string, fallback: string, lightnessPercent: number): string {
  const clamped = Math.min(100, Math.max(0, lightnessPercent));
  const rgb = parseHexColor(value) ?? parseHexColor(fallback);

  if (!rgb) {
    return fallback;
  }

  const hsl = rgbToHsl(rgb);
  const updated = hslToRgb({
    h: hsl.h,
    s: hsl.s,
    l: clamped / 100,
  });

  return rgbToHex(updated);
}

function hexToRgbString(value: string, fallback: string): string {
  const rgb = parseHexColor(value) ?? parseHexColor(fallback);

  if (!rgb) {
    return "";
  }

  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function hexToHslString(value: string, fallback: string): string {
  const rgb = parseHexColor(value) ?? parseHexColor(fallback);

  if (!rgb) {
    return "";
  }

  const hsl = rgbToHsl(rgb);
  const h = Math.round(hsl.h * 360);
  const s = Math.round(hsl.s * 100);
  const l = Math.round(hsl.l * 100);

  return `hsl(${h}, ${s}%, ${l}%)`;
}

function parseHslInput(value: string): HslColor | null {
  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  const withoutWrapper = trimmed
    .replace(/^hsl\(/, "")
    .replace(/\)$/, "")
    .replace(/,/g, " ");

  const parts = withoutWrapper.split(/\s+/).filter(Boolean);

  if (parts.length < 3) {
    return null;
  }

  const hRaw = parts[0].replace(/deg$/, "");
  const sRaw = parts[1].replace(/%$/, "");
  const lRaw = parts[2].replace(/%$/, "");

  const hDeg = Number.parseFloat(hRaw);
  const sPercent = Number.parseFloat(sRaw);
  const lPercent = Number.parseFloat(lRaw);

  if (!Number.isFinite(hDeg) || !Number.isFinite(sPercent) || !Number.isFinite(lPercent)) {
    return null;
  }

  const h = (((hDeg % 360) + 360) % 360) / 360;
  const s = Math.min(100, Math.max(0, sPercent)) / 100;
  const l = Math.min(100, Math.max(0, lPercent)) / 100;

  return { h, s, l };
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

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(normalized).catch(() => undefined);

    return;
  }

  if (typeof document === "undefined") {
    return;
  }

  const textarea = document.createElement("textarea");

  textarea.value = normalized;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";

  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
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
  const { user, isLoading } = useAuth();
  const { nudgeAmount } = useSettings();
  const effectiveNudgeAmount =
    Number.isFinite(nudgeAmount) && nudgeAmount > 0 ? nudgeAmount : 8;
  const [textColor, setTextColorState] = useState("#111827");
  const [backgroundColor, setBackgroundColorState] = useState("#ffffff");
  const [containerColor, setContainerColorState] = useState("#f4f4f5");
  const [fontSize, setFontSize] = useState("16");
  const [textHue, setTextHue] = useState(() => {
    const hslString = hexToHslString("#111827", "#111827");
    const parts = hslString.match(/\d+/g);

    if (parts && parts.length >= 3) {
      return parts[0];
    }

    return "0";
  });
  const [textSaturation, setTextSaturation] = useState(() => {
    const hslString = hexToHslString("#111827", "#111827");
    const parts = hslString.match(/\d+/g);

    if (parts && parts.length >= 3) {
      return parts[1];
    }

    return "0";
  });
  const [textLightness, setTextLightness] = useState(() => {
    const hslString = hexToHslString("#111827", "#111827");
    const parts = hslString.match(/\d+/g);

    if (parts && parts.length >= 3) {
      return parts[2];
    }

    return "0";
  });
  const [backgroundHue, setBackgroundHue] = useState(() => {
    const hslString = hexToHslString("#ffffff", "#ffffff");
    const parts = hslString.match(/\d+/g);

    if (parts && parts.length >= 3) {
      return parts[0];
    }

    return "0";
  });
  const [backgroundSaturation, setBackgroundSaturation] = useState(() => {
    const hslString = hexToHslString("#ffffff", "#ffffff");
    const parts = hslString.match(/\d+/g);

    if (parts && parts.length >= 3) {
      return parts[1];
    }

    return "0";
  });
  const [backgroundLightness, setBackgroundLightness] = useState(() => {
    const hslString = hexToHslString("#ffffff", "#ffffff");
    const parts = hslString.match(/\d+/g);

    if (parts && parts.length >= 3) {
      return parts[2];
    }

    return "0";
  });
  const [containerHue, setContainerHue] = useState(() => {
    const hslString = hexToHslString("#f4f4f5", "#f4f4f5");
    const parts = hslString.match(/\d+/g);

    if (parts && parts.length >= 3) {
      return parts[0];
    }

    return "0";
  });
  const [containerSaturation, setContainerSaturation] = useState(() => {
    const hslString = hexToHslString("#f4f4f5", "#f4f4f5");
    const parts = hslString.match(/\d+/g);

    if (parts && parts.length >= 3) {
      return parts[1];
    }

    return "0";
  });
  const [containerLightness, setContainerLightness] = useState(() => {
    const hslString = hexToHslString("#f4f4f5", "#f4f4f5");
    const parts = hslString.match(/\d+/g);

    if (parts && parts.length >= 3) {
      return parts[2];
    }

    return "0";
  });
  const [colorMode, setColorMode] = useState<"two" | "three">("two");
  const [presets, setPresets] = useState<
    {
      id: string;
      name: string;
      textColor: string;
      backgroundColor: string;
      containerColor: string;
      fontSize: string;
      mode: "two" | "three";
    }[]
  >(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(COLOR_CONTRAST_PRESETS_STORAGE_KEY);

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored) as unknown;

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const value = item as {
            id?: unknown;
            name?: unknown;
            textColor?: unknown;
            backgroundColor?: unknown;
            containerColor?: unknown;
            fontSize?: unknown;
            mode?: unknown;
          };

          if (
            (typeof value.id !== "string" && typeof value.id !== "number") ||
            typeof value.name !== "string" ||
            typeof value.textColor !== "string" ||
            typeof value.backgroundColor !== "string" ||
            typeof value.containerColor !== "string" ||
            typeof value.fontSize !== "string" ||
            (value.mode !== "two" && value.mode !== "three")
          ) {
            return null;
          }

          return {
            id: String(value.id),
            name: value.name,
            textColor: value.textColor,
            backgroundColor: value.backgroundColor,
            containerColor: value.containerColor,
            fontSize: value.fontSize,
            mode: value.mode,
          };
        })
        .filter((preset): preset is {
          id: string;
          name: string;
          textColor: string;
          backgroundColor: string;
          containerColor: string;
          fontSize: string;
          mode: "two" | "three";
        } => Boolean(preset));
    } catch {
      return [];
    }
  });
  const [presetName, setPresetName] = useState("Preset 1");
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<CopyNoticeState | null>(null);
  const copyNoticeTimeoutRef = useRef<number | null>(null);
  const [copyIconSrc, setCopyIconSrc] = useState("/icons/copy.svg");
  const inputCardRef = useRef<HTMLDivElement | null>(null);
  const [whatIfTarget, setWhatIfTarget] = useState<
    "aa-normal" | "aa-large" | "aaa" | "a-plus"
  >("aa-normal");

  const setTextColor = (valueOrUpdater: string | ((previous: string) => string)) => {
    setTextColorState((previous) => {
      const next =
        typeof valueOrUpdater === "function"
          ? (valueOrUpdater as (value: string) => string)(previous)
          : valueOrUpdater;

      const hslString = hexToHslString(next, "#111827");
      const parts = hslString.match(/\d+/g);

      if (parts && parts.length >= 3) {
        setTextHue(parts[0]);
        setTextSaturation(parts[1]);
        setTextLightness(parts[2]);
      }

      return next;
    });
  };

  const setBackgroundColor = (valueOrUpdater: string | ((previous: string) => string)) => {
    setBackgroundColorState((previous) => {
      const next =
        typeof valueOrUpdater === "function"
          ? (valueOrUpdater as (value: string) => string)(previous)
          : valueOrUpdater;

      const hslString = hexToHslString(next, "#ffffff");
      const parts = hslString.match(/\d+/g);

      if (parts && parts.length >= 3) {
        setBackgroundHue(parts[0]);
        setBackgroundSaturation(parts[1]);
        setBackgroundLightness(parts[2]);
      }

      return next;
    });
  };

  const setContainerColor = (valueOrUpdater: string | ((previous: string) => string)) => {
    setContainerColorState((previous) => {
      const next =
        typeof valueOrUpdater === "function"
          ? (valueOrUpdater as (value: string) => string)(previous)
          : valueOrUpdater;

      const hslString = hexToHslString(next, "#f4f4f5");
      const parts = hslString.match(/\d+/g);

      if (parts && parts.length >= 3) {
        setContainerHue(parts[0]);
        setContainerSaturation(parts[1]);
        setContainerLightness(parts[2]);
      }

      return next;
    });
  };

  const isFull = variant === "full";
  const effectiveMode = isFull ? colorMode : "two";
  const canUsePresets = isFull && Boolean(user);
  const showPresetAuthNotice = isFull && !user && !isLoading;

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
  const passesAPlus = activeRatio !== null && activeRatio >= 12.5;

  const bgContainerPassAA = bgContainerRatio !== null && bgContainerRatio >= 4.5;
  const containerTextPassAA = containerTextRatio !== null && containerTextRatio >= 4.5;

  const whatIfTargetRatio = useMemo(() => {
    if (whatIfTarget === "aa-large") {
      return 3;
    }

    if (whatIfTarget === "aaa") {
      return 7;
    }

    if (whatIfTarget === "a-plus") {
      return 12.5;
    }

    return 4.5;
  }, [whatIfTarget]);

  const whatIfTextSuggestion = useMemo(
    () =>
      activeBackgroundColor && formattedTextColor
        ? suggestAccessibleColor(formattedTextColor, activeBackgroundColor, whatIfTargetRatio)
        : null,
    [formattedTextColor, activeBackgroundColor, whatIfTargetRatio],
  );

  const whatIfBackgroundSuggestion = useMemo(
    () =>
      activeBackgroundColor && formattedTextColor
        ? suggestAccessibleColor(activeBackgroundColor, formattedTextColor, whatIfTargetRatio)
        : null,
    [activeBackgroundColor, formattedTextColor, whatIfTargetRatio],
  );

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
  };

  const previewStyleThreeColorOuter = {
    backgroundColor: formattedBackgroundColor,
  };

  const previewStyleThreeColorInner = {
    backgroundColor: formattedContainerColor,
    color: formattedTextColor,
  };

  const handleSavePreset = () => {
    const trimmedName = presetName.trim();
    const name = trimmedName || `Preset ${presets.length + 1}`;

    setPresets((current) => {
      const nextId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const nextPresets = [
        ...current,
        {
          id: nextId,
          name,
          textColor,
          backgroundColor,
          containerColor,
          fontSize,
          mode: colorMode,
        },
      ];

      if (typeof window !== "undefined") {
        try {
          const storageKey = "you-i-workspace-presets";
          const stored = window.localStorage.getItem(storageKey);
          const parsed = stored ? JSON.parse(stored) : [];
          const safeList = Array.isArray(parsed) ? parsed : [];

          const workspacePreset = {
            id: nextId,
            name,
            toolName: "Color Contrast Checker",
            note: "",
            createdAt: new Date().toISOString(),
          };

          const nextWorkspacePresets = [
            workspacePreset,
            ...safeList.filter(
              (item) =>
                !item ||
                typeof item !== "object" ||
                (item as { id?: unknown }).id !== workspacePreset.id,
            ),
          ];

          window.localStorage.setItem(
            storageKey,
            JSON.stringify(nextWorkspacePresets),
          );
        } catch {
        }
      }

      return nextPresets;
    });

    setPresetName(`Preset ${presets.length + 2}`);
  };

  const handlePresetNameChange = (presetId: string, name: string) => {
    setPresets((current) =>
      current.map((preset) => (preset.id === presetId ? { ...preset, name } : preset)),
    );
  };

  const fontSizeNumberRaw = Number.parseInt(fontSize || "16", 10);
  const fontSizeNumber = Number.isNaN(fontSizeNumberRaw) ? 16 : fontSizeNumberRaw;
  const headingFontSize = fontSizeNumber;
  const supportingFontSize = Math.max(10, fontSizeNumber - 2);
  const bodyFontSize = 14;

  const handleCopy = (value: string, label: string, event: MouseEvent<HTMLElement>) => {
    copyHexToClipboard(value);
    const card = inputCardRef.current;

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
    }, 1400);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        COLOR_CONTRAST_PRESETS_STORAGE_KEY,
        JSON.stringify(presets),
      );
    } catch {
    }
  }, [presets]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;

    const updateIcon = () => {
      const theme = root.getAttribute("data-theme");
      setCopyIconSrc(theme === "dark" ? "/icons/copy-white.svg" : "/icons/copy.svg");
    };

    updateIcon();

    const observer = new MutationObserver(updateIcon);

    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(
    () => () => {
      if (copyNoticeTimeoutRef.current !== null) {
        window.clearTimeout(copyNoticeTimeoutRef.current);
      }
    },
    [],
  );

  const layoutDirectionClass = isFull ? "flex flex-col gap-6 md:flex-row" : "flex flex-col gap-6";

  return (
    <div className="space-y-4">
      <div className={layoutDirectionClass}>
        <div className="space-y-4 md:flex-1 md:basis-0">
        <div
          ref={inputCardRef}
          className="relative rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
        >
          <div className="mb-4 flex items-center">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Input
            </div>
            <div className="ml-auto flex h-9 w-[264px] flex-none items-center justify-end gap-3 whitespace-nowrap">
              {isFull && (
                <div className="relative inline-flex h-8 w-[170px] flex-none items-center overflow-hidden rounded-full border border-zinc-200 bg-white px-1 py-1 text-[11px] font-medium">
                  <span
                    className={`absolute inset-y-1 left-0 w-1/2 rounded-full bg-red-500 transition-transform duration-300 ease-out ${
                      effectiveMode === "two" ? "translate-x-0" : "translate-x-full"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setColorMode("two")}
                    className={`relative z-10 flex-1 rounded-full px-2 py-0.5 text-center transition-colors ${
                      effectiveMode === "two" ? "text-white" : "text-zinc-700"
                    }`}
                  >
                    2 colors
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode("three")}
                    className={`relative z-10 flex-1 rounded-full px-2 py-0.5 text-center transition-colors ${
                      effectiveMode === "three" ? "text-white" : "text-zinc-700"
                    }`}
                  >
                    3 colors
                  </button>
                </div>
              )}
              <p className="text-xs text-zinc-400">Hex values, with or without #</p>
            </div>
          </div>
          {copyNotice && (
            <div
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white shadow-lg"
              style={{ left: copyNotice.x, top: copyNotice.y }}
            >
              Copied 
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
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
                        event.currentTarget.blur();
                      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                        event.preventDefault();
                        const direction = event.key === "ArrowUp" ? 1 : -1;
                        const step = event.shiftKey ? effectiveNudgeAmount : 1;
                        setTextColor((current) => {
                          const lightness = getHexLightness(current, "#111827");
                          const nextLightness = lightness + direction * step;
                          return setHexLightness(current, "#111827", nextLightness);
                        });
                      }
                    }}
                    placeholder="#111827"
                    className="h-full w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-8 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                  />
                  <span className="pointer-events-none absolute inset-y-1 right-8 w-px bg-zinc-200" />
                  <button
                    type="button"
                    onClick={(event) => handleCopy(textColor, "text color", event)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-400 transition-colors hover:text-zinc-600"
                    aria-label="Copy text color value"
                  >
                    <Image
                      src={copyIconSrc}
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5"
                    />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={getHexLightness(textColor, "#111827")}
                onChange={(event) =>
                  setTextColor(setHexLightness(textColor, "#111827", Number(event.target.value)))
                }
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200"
              />
              <div className="mt-1 flex items-center gap-3">
                <div className="flex flex-1 items-center gap-2">
                  <span className="text-[10px] text-zinc-500">H</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={textHue}
                      onChange={(event) => setTextHue(event.target.value)}
                      onBlur={() => {
                        const hslString = `hsl(${textHue || "0"}, ${textSaturation || "0"}%, ${textLightness || "0"}%)`;
                        const parsed = parseHslInput(hslString);

                        if (!parsed) {
                          return;
                        }

                        const rgb = hslToRgb(parsed);
                        const hex = rgbToHex(rgb);

                        setTextColor(hex);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const hslString = `hsl(${textHue || "0"}, ${textSaturation || "0"}%, ${textLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setTextColor(hex);
                          event.currentTarget.blur();
                        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                          event.preventDefault();
                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? effectiveNudgeAmount : 1;
                          const raw = Number.parseFloat(textHue || "0");
                          const base = Number.isFinite(raw) ? raw : 0;
                          const next = Math.min(360, Math.max(0, base + direction * step));
                          const nextHue = String(next);

                          setTextHue(nextHue);

                          const hslString = `hsl(${nextHue}, ${textSaturation || "0"}%, ${textLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setTextColor(hex);
                        }
                      }}
                      className="h-7 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-center text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                      aria-label="Text color hue"
                    />
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-1">
                  <span className="text-[10px] text-zinc-500">S</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={textSaturation}
                      onChange={(event) => setTextSaturation(event.target.value)}
                      onBlur={() => {
                        const hslString = `hsl(${textHue || "0"}, ${textSaturation || "0"}%, ${textLightness || "0"}%)`;
                        const parsed = parseHslInput(hslString);

                        if (!parsed) {
                          return;
                        }

                        const rgb = hslToRgb(parsed);
                        const hex = rgbToHex(rgb);

                        setTextColor(hex);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const hslString = `hsl(${textHue || "0"}, ${textSaturation || "0"}%, ${textLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setTextColor(hex);
                          event.currentTarget.blur();
                        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                          event.preventDefault();
                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? effectiveNudgeAmount : 1;
                          const raw = Number.parseFloat(textSaturation || "0");
                          const base = Number.isFinite(raw) ? raw : 0;
                          const next = Math.min(100, Math.max(0, base + direction * step));
                          const nextValue = String(next);

                          setTextSaturation(nextValue);

                          const hslString = `hsl(${textHue || "0"}, ${nextValue}%, ${textLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setTextColor(hex);
                        }
                      }}
                      className="h-7 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-center text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                      aria-label="Text color saturation"
                    />
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-1">
                  <span className="text-[10px] text-zinc-500">L</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={textLightness}
                      onChange={(event) => setTextLightness(event.target.value)}
                      onBlur={() => {
                        const hslString = `hsl(${textHue || "0"}, ${textSaturation || "0"}%, ${textLightness || "0"}%)`;
                        const parsed = parseHslInput(hslString);

                        if (!parsed) {
                          return;
                        }

                        const rgb = hslToRgb(parsed);
                        const hex = rgbToHex(rgb);

                        setTextColor(hex);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const hslString = `hsl(${textHue || "0"}, ${textSaturation || "0"}%, ${textLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setTextColor(hex);
                          event.currentTarget.blur();
                        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                          event.preventDefault();
                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? effectiveNudgeAmount : 1;
                          const raw = Number.parseFloat(textLightness || "0");
                          const base = Number.isFinite(raw) ? raw : 0;
                          const next = Math.min(100, Math.max(0, base + direction * step));
                          const nextValue = String(next);

                          setTextLightness(nextValue);

                          const hslString = `hsl(${textHue || "0"}, ${textSaturation || "0"}%, ${nextValue}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setTextColor(hex);
                        }
                      }}
                      className="h-7 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-center text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                      aria-label="Text color lightness"
                    />
                  </div>
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
                        event.currentTarget.blur();
                      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                        event.preventDefault();
                        const direction = event.key === "ArrowUp" ? 1 : -1;
                        const step = event.shiftKey ? effectiveNudgeAmount : 1;
                        setBackgroundColor((current) => {
                          const lightness = getHexLightness(current, "#ffffff");
                          const nextLightness = lightness + direction * step;
                          return setHexLightness(current, "#ffffff", nextLightness);
                        });
                      }
                    }}
                    placeholder="#ffffff"
                    className="h-full w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-8 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                  />
                  <span className="pointer-events-none absolute inset-y-1 right-8 w-px bg-zinc-200" />
                  <button
                    type="button"
                    onClick={(event) => handleCopy(backgroundColor, "background color", event)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-400 transition-colors hover:text-zinc-600"
                    aria-label="Copy background color value"
                  >
                    <Image
                      src={copyIconSrc}
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5"
                    />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={getHexLightness(backgroundColor, "#ffffff")}
                onChange={(event) =>
                  setBackgroundColor(
                    setHexLightness(backgroundColor, "#ffffff", Number(event.target.value)),
                  )
                }
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200"
              />
              <div className="mt-1 flex items-center gap-3">
                <div className="flex flex-1 items-center gap-2">
                  <span className="text-[10px] text-zinc-500">H</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={backgroundHue}
                      onChange={(event) => setBackgroundHue(event.target.value)}
                      onBlur={() => {
                        const hslString = `hsl(${backgroundHue || "0"}, ${backgroundSaturation || "0"}%, ${backgroundLightness || "0"}%)`;
                        const parsed = parseHslInput(hslString);

                        if (!parsed) {
                          return;
                        }

                        const rgb = hslToRgb(parsed);
                        const hex = rgbToHex(rgb);

                        setBackgroundColor(hex);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const hslString = `hsl(${backgroundHue || "0"}, ${backgroundSaturation || "0"}%, ${backgroundLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setBackgroundColor(hex);
                          event.currentTarget.blur();
                        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                          event.preventDefault();
                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? 10 : 1;
                          const raw = Number.parseFloat(backgroundHue || "0");
                          const base = Number.isFinite(raw) ? raw : 0;
                          const next = Math.min(360, Math.max(0, base + direction * step));
                          const nextHue = String(next);

                          setBackgroundHue(nextHue);

                          const hslString = `hsl(${nextHue}, ${backgroundSaturation || "0"}%, ${backgroundLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setBackgroundColor(hex);
                        }
                      }}
                      className="h-7 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-center text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                      aria-label="Background color hue"
                    />
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-1">
                  <span className="text-[10px] text-zinc-500">S</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={backgroundSaturation}
                      onChange={(event) => setBackgroundSaturation(event.target.value)}
                      onBlur={() => {
                        const hslString = `hsl(${backgroundHue || "0"}, ${backgroundSaturation || "0"}%, ${backgroundLightness || "0"}%)`;
                        const parsed = parseHslInput(hslString);

                        if (!parsed) {
                          return;
                        }

                        const rgb = hslToRgb(parsed);
                        const hex = rgbToHex(rgb);

                        setBackgroundColor(hex);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const hslString = `hsl(${backgroundHue || "0"}, ${backgroundSaturation || "0"}%, ${backgroundLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setBackgroundColor(hex);
                          event.currentTarget.blur();
                        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                          event.preventDefault();
                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? effectiveNudgeAmount : 1;
                          const raw = Number.parseFloat(backgroundSaturation || "0");
                          const base = Number.isFinite(raw) ? raw : 0;
                          const next = Math.min(100, Math.max(0, base + direction * step));
                          const nextValue = String(next);

                          setBackgroundSaturation(nextValue);

                          const hslString = `hsl(${backgroundHue || "0"}, ${nextValue}%, ${backgroundLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setBackgroundColor(hex);
                        }
                      }}
                      className="h-7 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-center text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                      aria-label="Background color saturation"
                    />
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-1">
                  <span className="text-[10px] text-zinc-500">L</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={backgroundLightness}
                      onChange={(event) => setBackgroundLightness(event.target.value)}
                      onBlur={() => {
                        const hslString = `hsl(${backgroundHue || "0"}, ${backgroundSaturation || "0"}%, ${backgroundLightness || "0"}%)`;
                        const parsed = parseHslInput(hslString);

                        if (!parsed) {
                          return;
                        }

                        const rgb = hslToRgb(parsed);
                        const hex = rgbToHex(rgb);

                        setBackgroundColor(hex);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const hslString = `hsl(${backgroundHue || "0"}, ${backgroundSaturation || "0"}%, ${backgroundLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setBackgroundColor(hex);
                          event.currentTarget.blur();
                        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                          event.preventDefault();
                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? effectiveNudgeAmount : 1;
                          const raw = Number.parseFloat(backgroundLightness || "0");
                          const base = Number.isFinite(raw) ? raw : 0;
                          const next = Math.min(100, Math.max(0, base + direction * step));
                          const nextValue = String(next);

                          setBackgroundLightness(nextValue);

                          const hslString = `hsl(${backgroundHue || "0"}, ${backgroundSaturation || "0"}%, ${nextValue}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setBackgroundColor(hex);
                        }
                      }}
                      className="h-7 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-center text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                      aria-label="Background color lightness"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isFull && effectiveMode === "three" && (
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-medium text-zinc-700">
                Container
              </label>
              <div className="flex h-9 items-center gap-3">
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
                        event.currentTarget.blur();
                      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                        event.preventDefault();
                        const direction = event.key === "ArrowUp" ? 1 : -1;
                        const step = event.shiftKey ? effectiveNudgeAmount : 1;
                        setContainerColor((current) => {
                          const lightness = getHexLightness(current, "#f4f4f5");
                          const nextLightness = lightness + direction * step;
                          return setHexLightness(current, "#f4f4f5", nextLightness);
                        });
                      }
                    }}
                    placeholder="#f4f4f5"
                    className="h-full w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 pr-8 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                  />
                  <span className="pointer-events-none absolute inset-y-1 right-8 w-px bg-zinc-200" />
                  <button
                    type="button"
                    onClick={(event) => handleCopy(containerColor, "container color", event)}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-zinc-400 transition-colors hover:text-zinc-600"
                    aria-label="Copy container color value"
                  >
                    <Image
                      src={copyIconSrc}
                      alt=""
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5"
                    />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={getHexLightness(containerColor, "#f4f4f5")}
                onChange={(event) =>
                  setContainerColor(
                    setHexLightness(containerColor, "#f4f4f5", Number(event.target.value)),
                  )
                }
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200"
              />
              <div className="mt-1 flex items-center gap-3">
                <div className="flex flex-1 items-center gap-2">
                  <span className="text-[10px] text-zinc-500">H</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={containerHue}
                      onChange={(event) => setContainerHue(event.target.value)}
                      onBlur={() => {
                        const hslString = `hsl(${containerHue || "0"}, ${containerSaturation || "0"}%, ${containerLightness || "0"}%)`;
                        const parsed = parseHslInput(hslString);

                        if (!parsed) {
                          return;
                        }

                        const rgb = hslToRgb(parsed);
                        const hex = rgbToHex(rgb);

                        setContainerColor(hex);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const hslString = `hsl(${containerHue || "0"}, ${containerSaturation || "0"}%, ${containerLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setContainerColor(hex);
                          event.currentTarget.blur();
                        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                          event.preventDefault();
                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? effectiveNudgeAmount : 1;
                          const raw = Number.parseFloat(containerHue || "0");
                          const base = Number.isFinite(raw) ? raw : 0;
                          const next = Math.min(360, Math.max(0, base + direction * step));
                          const nextHue = String(next);

                          setContainerHue(nextHue);

                          const hslString = `hsl(${nextHue}, ${containerSaturation || "0"}%, ${containerLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setContainerColor(hex);
                        }
                      }}
                      className="h-7 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-center text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                      aria-label="Container color hue"
                    />
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-1">
                  <span className="text-[10px] text-zinc-500">S</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={containerSaturation}
                      onChange={(event) => setContainerSaturation(event.target.value)}
                      onBlur={() => {
                        const hslString = `hsl(${containerHue || "0"}, ${containerSaturation || "0"}%, ${containerLightness || "0"}%)`;
                        const parsed = parseHslInput(hslString);

                        if (!parsed) {
                          return;
                        }

                        const rgb = hslToRgb(parsed);
                        const hex = rgbToHex(rgb);

                        setContainerColor(hex);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const hslString = `hsl(${containerHue || "0"}, ${containerSaturation || "0"}%, ${containerLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setContainerColor(hex);
                          event.currentTarget.blur();
                        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                          event.preventDefault();
                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? 10 : 1;
                          const raw = Number.parseFloat(containerSaturation || "0");
                          const base = Number.isFinite(raw) ? raw : 0;
                          const next = Math.min(100, Math.max(0, base + direction * step));
                          const nextValue = String(next);

                          setContainerSaturation(nextValue);

                          const hslString = `hsl(${containerHue || "0"}, ${nextValue}%, ${containerLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setContainerColor(hex);
                        }
                      }}
                      className="h-7 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-center text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                      aria-label="Container color saturation"
                    />
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-1">
                  <span className="text-[10px] text-zinc-500">L</span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={containerLightness}
                      onChange={(event) => setContainerLightness(event.target.value)}
                      onBlur={() => {
                        const hslString = `hsl(${containerHue || "0"}, ${containerSaturation || "0"}%, ${containerLightness || "0"}%)`;
                        const parsed = parseHslInput(hslString);

                        if (!parsed) {
                          return;
                        }

                        const rgb = hslToRgb(parsed);
                        const hex = rgbToHex(rgb);

                        setContainerColor(hex);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const hslString = `hsl(${containerHue || "0"}, ${containerSaturation || "0"}%, ${containerLightness || "0"}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setContainerColor(hex);
                          event.currentTarget.blur();
                        } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                          event.preventDefault();
                          const direction = event.key === "ArrowUp" ? 1 : -1;
                          const step = event.shiftKey ? effectiveNudgeAmount : 1;
                          const raw = Number.parseFloat(containerLightness || "0");
                          const base = Number.isFinite(raw) ? raw : 0;
                          const next = Math.min(100, Math.max(0, base + direction * step));
                          const nextValue = String(next);

                          setContainerLightness(nextValue);

                          const hslString = `hsl(${containerHue || "0"}, ${containerSaturation || "0"}%, ${nextValue}%)`;
                          const parsed = parseHslInput(hslString);

                          if (!parsed) {
                            return;
                          }

                          const rgb = hslToRgb(parsed);
                          const hex = rgbToHex(rgb);

                          setContainerColor(hex);
                        }
                      }}
                      className="h-7 w-full rounded-md border border-zinc-200 bg-white px-1.5 text-center text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                      aria-label="Container color lightness"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {isFull && (
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
          )}
          {isFull && roundedActiveRatio !== null && !passesAANormal && recommendedTextColor && (
            <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Recommendation</p>
                  <p>Try this text color to reach AA contrast.</p>
                </div>
                <button
                  type="button"
                  onClick={(event) =>
                    handleCopy(recommendedTextColor, "recommended text color", event)
                  }
                  className="rounded-md bg-amber-500 px-2 py-1 text-[11px] font-mono font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-amber-600"
                >
                  {recommendedTextColor}
                </button>
              </div>
            </div>
          )}
          {isFull && (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-[11px] leading-snug text-zinc-800">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">What-if contrast simulator</p>
                <div className="relative inline-flex h-7 w-[260px] flex-none items-center overflow-hidden rounded-full border border-zinc-200 bg-white px-1 py-0.5 text-[10px]">
                  <span
                    className={`absolute inset-y-1 left-0 w-1/4 rounded-full bg-zinc-900 transition-transform duration-300 ease-out what-if-indicator ${
                      whatIfTarget === "aa-normal"
                        ? "translate-x-0"
                        : whatIfTarget === "aa-large"
                          ? "translate-x-full"
                          : whatIfTarget === "aaa"
                            ? "translate-x-[200%]"
                            : "translate-x-[300%]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setWhatIfTarget("aa-normal")}
                    className={`relative z-10 flex-1 rounded-full px-2 py-0.5 text-center transition-colors whitespace-nowrap ${
                      whatIfTarget === "aa-normal" ? "text-white" : "text-zinc-600"
                    }`}
                  >
                    AA
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatIfTarget("aa-large")}
                    className={`relative z-10 flex-1 rounded-full px-2 py-0.5 text-center transition-colors whitespace-nowrap ${
                      whatIfTarget === "aa-large" ? "text-white" : "text-zinc-600"
                    }`}
                  >
                    AA large
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatIfTarget("aaa")}
                    className={`relative z-10 flex-1 rounded-full px-2 py-0.5 text-center transition-colors whitespace-nowrap ${
                      whatIfTarget === "aaa" ? "text-white" : "text-zinc-600"
                    }`}
                  >
                    AAA
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatIfTarget("a-plus")}
                    className={`relative z-10 flex-1 rounded-full px-2 py-0.5 text-center transition-colors whitespace-nowrap ${
                      whatIfTarget === "a-plus" ? "text-white" : "text-zinc-600"
                    }`}
                  >
                    A+
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                    Suggested text color
                  </p>
                  {whatIfTextSuggestion ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: whatIfTextSuggestion }}
                      />
                      <button
                        type="button"
                        onClick={() => setTextColor(whatIfTextSuggestion)}
                        className="rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[10px] text-zinc-800 hover:border-red-200 hover:bg-red-50"
                      >
                        {whatIfTextSuggestion}
                      </button>
                      <button
                        type="button"
                        onClick={(event) =>
                          handleCopy(whatIfTextSuggestion, "what-if text color", event)
                        }
                        className="text-zinc-400 transition-colors hover:text-zinc-700"
                        aria-label="Copy suggested text color"
                      >
                        <Image
                          src={copyIconSrc}
                          alt=""
                          width={14}
                          height={14}
                          className="h-3.5 w-3.5"
                        />
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-500">
                      Enter valid colors to see suggestions.
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                    Suggested background
                  </p>
                  {whatIfBackgroundSuggestion ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: whatIfBackgroundSuggestion }}
                      />
                      <button
                        type="button"
                        onClick={() => setBackgroundColor(whatIfBackgroundSuggestion)}
                        className="rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[10px] text-zinc-800 hover:border-red-200 hover:bg-red-50"
                      >
                        {whatIfBackgroundSuggestion}
                      </button>
                      <button
                        type="button"
                        onClick={(event) =>
                          handleCopy(whatIfBackgroundSuggestion, "what-if background color", event)
                        }
                        className="text-zinc-400 transition-colors hover:text-zinc-700"
                        aria-label="Copy suggested background color"
                      >
                        <Image
                          src={copyIconSrc}
                          alt=""
                          width={14}
                          height={14}
                          className="h-3.5 w-3.5"
                        />
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-500">
                      Enter valid colors to see suggestions.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        <div className="space-y-4 md:flex-1 md:basis-0">
        <div className="hero-preview rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Preview</p>
            {roundedActiveRatio !== null ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-mono text-zinc-500">
                  {roundedActiveRatio.toFixed(2)} : 1
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    passesAPlus ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {passesAPlus ? "Pass A+" : "Fail A+"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    passesAAA ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {passesAAA ? "Pass AAA" : "Fail AAA"}
                </span>
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
          {effectiveMode === "two" && (
            <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <div
                className="rounded-lg border border-zinc-200 px-3 py-3 text-xs leading-relaxed"
                style={previewStyleTwoColor}
              >
                <p
                  className="font-semibold"
                  style={{ fontSize: `${headingFontSize}px` }}
                >
                  Sample interface heading
                </p>
                <p
                  className="font-medium"
                  style={{ fontSize: `${supportingFontSize}px` }}
                >
                  Supporting line with medium emphasis for short descriptions.
                </p>
                <p
                  className="mt-1 opacity-80"
                  style={{ fontSize: `${bodyFontSize}px` }}
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
                  className="rounded-md px-3 py-3"
                  style={previewStyleThreeColorInner}
                >
                  <p
                    className="font-semibold"
                    style={{ fontSize: `${headingFontSize}px` }}
                  >
                    Container heading example
                  </p>
                  <p
                    className="font-medium"
                    style={{ fontSize: `${supportingFontSize}px` }}
                  >
                    Medium-emphasis copy tested against the container surface.
                  </p>
                  <p
                    className="mt-1 opacity-80"
                    style={{ fontSize: `${bodyFontSize}px` }}
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
    {isFull && (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500">Presets</p>
          {canUsePresets && presets.length > 0 && (
            <p className="text-[11px] text-zinc-400">{presets.length} saved</p>
          )}
        </div>
        {showPresetAuthNotice && (
          <div className="mb-3 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600">
            Sign in to save and reuse presets.
          </div>
        )}
        {canUsePresets && (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
                placeholder={`Preset ${presets.length + 1}`}
                className="h-8 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
              />
              <button
                type="button"
                onClick={handleSavePreset}
                className="inline-flex h-8 items-center justify-center rounded-lg bg-red-500 px-3 text-[11px] font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
              >
                Save preset
              </button>
            </div>
            {presets.length > 0 && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {presets.map((preset) => {
                  const formattedText = formatHex(preset.textColor) || "#111827";
                  const formattedBackground = formatHex(preset.backgroundColor) || "#ffffff";
                  const formattedContainer = formatHex(preset.containerColor) || "#f4f4f5";

                  return (
                    <div
                      key={preset.id}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[11px] text-zinc-800"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {editingPresetId === preset.id ? (
                            <input
                              autoFocus
                              value={preset.name}
                              onChange={(event) =>
                                handlePresetNameChange(preset.id, event.target.value)
                              }
                              onBlur={() => setEditingPresetId(null)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === "Escape") {
                                  event.preventDefault();
                                  setEditingPresetId(null);
                                }
                              }}
                              className="h-6 rounded border border-zinc-200 bg-white px-2 text-[11px] text-zinc-900 outline-none ring-red-100 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                            />
                          ) : (
                            <p className="font-medium">{preset.name}</p>
                          )}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingPresetId(preset.id)}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-[10px] text-zinc-400 transition-colors hover:border-zinc-200 hover:bg-white hover:text-zinc-700"
                              aria-label="Edit preset name"
                            >
                              <Image
                                src="/icons/pen.svg"
                                alt=""
                                width={14}
                                height={14}
                                className="h-3.5 w-3.5"
                              />
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPresets((current) =>
                              current.filter((item) => item.id !== preset.id),
                            );
                            if (editingPresetId === preset.id) {
                              setEditingPresetId(null);
                            }
                            if (typeof window !== "undefined") {
                              try {
                                const storageKey = "you-i-workspace-presets";
                                const stored = window.localStorage.getItem(storageKey);
                                if (stored) {
                                  const parsed = JSON.parse(stored);
                                  if (Array.isArray(parsed)) {
                                    const nextWorkspacePresets = parsed.filter((item) => {
                                      if (!item || typeof item !== "object") {
                                        return true;
                                      }
                                      const value = item as {
                                        id?: unknown;
                                        toolName?: unknown;
                                      };
                                      if (
                                        value.toolName === "Color Contrast Checker" &&
                                        value.id === preset.id
                                      ) {
                                        return false;
                                      }
                                      return true;
                                    });
                                    window.localStorage.setItem(
                                      storageKey,
                                      JSON.stringify(nextWorkspacePresets),
                                    );
                                  }
                                }
                              } catch {
                              }
                            }
                          }}
                          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-[10px] font-medium text-zinc-700 hover:border-red-200 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="flex items-start gap-2">
                          <span
                            className="mt-0.5 h-3 w-3 rounded-full"
                            style={{ backgroundColor: formattedText }}
                          />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                              Text
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(event) =>
                                  handleCopy(preset.textColor, "preset text color", event)
                                }
                                className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-800 hover:border-red-200 hover:bg-red-50"
                              >
                                {formattedText}
                              </button>
                            </div>
                            <p className="text-[10px] text-zinc-500">
                              {hexToRgbString(formattedText, "#111827")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span
                            className="mt-0.5 h-3 w-3 rounded-full"
                            style={{ backgroundColor: formattedBackground }}
                          />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                              Background
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(event) =>
                                  handleCopy(
                                    preset.backgroundColor,
                                    "preset background color",
                                    event,
                                  )
                                }
                                className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-800 hover:border-red-200 hover:bg-red-50"
                              >
                                {formattedBackground}
                              </button>
                            </div>
                            <p className="text-[10px] text-zinc-500">
                              {hexToRgbString(formattedBackground, "#ffffff")}
                            </p>
                          </div>
                        </div>
                        {preset.mode === "three" && (
                          <div className="flex items-start gap-2">
                            <span
                              className="mt-0.5 h-3 w-3 rounded-full"
                              style={{ backgroundColor: formattedContainer }}
                            />
                            <div>
                              <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                                Container
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(event) =>
                                    handleCopy(
                                      preset.containerColor,
                                      "preset container color",
                                      event,
                                    )
                                  }
                                  className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-800 hover:border-red-200 hover:bg-red-50"
                                >
                                  {formattedContainer}
                                </button>
                              </div>
                              <p className="text-[10px] text-zinc-500">
                                {hexToRgbString(formattedContainer, "#f4f4f5")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    )}
  </div>
  );
}
