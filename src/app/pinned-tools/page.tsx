"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { tools as allTools } from "@/components/ToolGrid";
import { PageTransitionLink } from "@/components/PageTransitionLink";
import { useAuth } from "@/providers/AuthProvider";

type WorkspacePreset = {
  id: string;
  name: string;
  toolName: string;
  note: string;
  createdAt: string;
};

type FontFavorite = {
  family: string;
  category: string;
  addedAt: string;
};

type WaveFavorite = {
  id: string;
  position: "top" | "bottom";
  shape: "smooth" | "peaks";
  heightValue: string;
  intensityValue: string;
  fillColor: string;
  backgroundColor: string;
  createdAt: string;
};

type WorkspaceClearTarget = "presets" | "fonts" | "waves";

function buildUserScopedStorageKey(baseKey: string, userId: string | null): string {
  if (!userId) {
    return baseKey;
  }

  return `${baseKey}::${userId}`;
}

function loadWorkspacePresetsFromStorage(storageKey: string): WorkspacePreset[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const mapped = parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const value = item as {
          id?: unknown;
          name?: unknown;
          toolName?: unknown;
          note?: unknown;
          createdAt?: unknown;
        };

        if (
          typeof value.id !== "string" ||
          typeof value.name !== "string" ||
          typeof value.toolName !== "string"
        ) {
          return null;
        }

        const base = {
          id: value.id,
          name: value.name,
          toolName: value.toolName,
          note: typeof value.note === "string" ? value.note : "",
          createdAt:
            typeof value.createdAt === "string"
              ? value.createdAt
              : new Date().toISOString(),
        } satisfies WorkspacePreset;
        return base;
      })
      .filter((preset): preset is WorkspacePreset => Boolean(preset));

    const seen = new Set<string>();

    return mapped.filter((preset) => {
      if (seen.has(preset.id)) {
        return false;
      }
      seen.add(preset.id);
      return true;
    });
  } catch {
    return [];
  }
}

function loadFontFavoritesFromStorage(storageKey: string): FontFavorite[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const mapped = parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const value = item as {
          family?: unknown;
          category?: unknown;
          addedAt?: unknown;
        };

        if (typeof value.family !== "string" || typeof value.category !== "string") {
          return null;
        }

        const base = {
          family: value.family,
          category: value.category,
          addedAt:
            typeof value.addedAt === "string" ? value.addedAt : new Date().toISOString(),
        } satisfies FontFavorite;

        return base;
      })
      .filter((item): item is FontFavorite => Boolean(item));

    const seen = new Set<string>();

    return mapped.filter((item) => {
      if (seen.has(item.family)) {
        return false;
      }
      seen.add(item.family);
      return true;
    });
  } catch {
    return [];
  }
}

function loadWaveFavoritesFromStorage(storageKey: string): WaveFavorite[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const mapped = parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const value = item as {
          id?: unknown;
          position?: unknown;
          shape?: unknown;
          heightValue?: unknown;
          intensityValue?: unknown;
          fillColor?: unknown;
          backgroundColor?: unknown;
          createdAt?: unknown;
        };

        if (
          typeof value.position !== "string" ||
          (value.position !== "top" && value.position !== "bottom")
        ) {
          return null;
        }

        if (
          typeof value.shape !== "string" ||
          (value.shape !== "smooth" && value.shape !== "peaks")
        ) {
          return null;
        }

        if (typeof value.heightValue !== "string" || typeof value.intensityValue !== "string") {
          return null;
        }

        if (typeof value.fillColor !== "string" || typeof value.backgroundColor !== "string") {
          return null;
        }

        const base = {
          id:
            typeof value.id === "string"
              ? value.id
              : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          position: value.position === "top" ? "top" : "bottom",
          shape: value.shape === "peaks" ? "peaks" : "smooth",
          heightValue: value.heightValue,
          intensityValue: value.intensityValue,
          fillColor: value.fillColor,
          backgroundColor: value.backgroundColor,
          createdAt:
            typeof value.createdAt === "string" ? value.createdAt : new Date().toISOString(),
        } satisfies WaveFavorite;

        return base;
      })
      .filter((item): item is WaveFavorite => Boolean(item));

    return mapped;
  } catch {
    return [];
  }
}

function loadColorContrastPresetsFromStorage(
  storageKey: string,
): Record<
  string,
  {
    textColor: string;
    backgroundColor: string;
    containerColor: string;
    mode: "two" | "three";
  }
> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored) as unknown;

    if (!Array.isArray(parsed)) {
      return {};
    }

    const mapped: Record<
      string,
      {
        textColor: string;
        backgroundColor: string;
        containerColor: string;
        mode: "two" | "three";
      }
    > = {};

    parsed.forEach((item) => {
      if (!item || typeof item !== "object") {
        return;
      }

      const value = item as {
        id?: unknown;
        textColor?: unknown;
        backgroundColor?: unknown;
        containerColor?: unknown;
        mode?: unknown;
      };

      if (
        (typeof value.id !== "string" && typeof value.id !== "number") ||
        typeof value.textColor !== "string" ||
        typeof value.backgroundColor !== "string" ||
        typeof value.containerColor !== "string" ||
        (value.mode !== "two" && value.mode !== "three")
      ) {
        return;
      }

      const id = String(value.id);

      mapped[id] = {
        textColor: value.textColor,
        backgroundColor: value.backgroundColor,
        containerColor: value.containerColor,
        mode: value.mode,
      };
    });

    return mapped;
  } catch {
    return {};
  }
}

function buildWavePathForFavorite(
  favorite: WaveFavorite,
  width: number,
  height: number,
): string {
  const parsedHeight = Number.parseFloat(favorite.heightValue);
  const normalizedHeight =
    !Number.isFinite(parsedHeight) || parsedHeight <= 0 ? height / 2 : parsedHeight;
  const clampedHeight = Math.min(height - 6, Math.max(6, (normalizedHeight / 320) * height));
  const parsedIntensity = Number.parseFloat(favorite.intensityValue);
  const intensity =
    !Number.isFinite(parsedIntensity) || parsedIntensity < 0
      ? 0.3
      : Math.min(1, parsedIntensity);
  const baseHeight = favorite.position === "bottom" ? height - clampedHeight : clampedHeight;
  const points: { x: number; y: number }[] = [];

  if (favorite.shape === "smooth") {
    const segmentCount = 32;
    const step = width / segmentCount;
    const amplitude = 6 + intensity * 10;

    for (let index = 0; index <= segmentCount; index += 1) {
      const x = step * index;
      const t = index / segmentCount;
      const angle = t * Math.PI * 2;
      const offset = Math.sin(angle) * amplitude;
      const y = baseHeight + offset;
      points.push({ x, y });
    }
  } else {
    const peakCount = 8;
    const segmentCount = peakCount;
    const step = width / segmentCount;
    const amplitude = 6 + intensity * 12;

    for (let index = 0; index <= segmentCount; index += 1) {
      const x = step * index;
      let offset = 0;

      if (index !== 0 && index !== segmentCount) {
        const direction = index % 2 === 0 ? 1 : -1;
        offset = direction * amplitude;
      }

      const y = baseHeight + offset;
      points.push({ x, y });
    }
  }

  const topEdgeY = 0;
  const bottomEdgeY = height;
  const startY = favorite.position === "top" ? topEdgeY : bottomEdgeY;

  if (points.length === 0) {
    return `M 0 ${startY} L ${width} ${startY} Z`;
  }

  let path = `M 0 ${startY}`;
  const firstPoint = points[0];
  path += ` L ${firstPoint.x} ${firstPoint.y}`;

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    path += ` L ${point.x} ${point.y}`;
  }

  if (favorite.position === "top") {
    path += ` L ${width} ${topEdgeY}`;
  } else {
    path += ` L ${width} ${bottomEdgeY}`;
  }

  path += " Z";

  return path;
}

function buildWaveSvgMarkupFromFavorite(
  favorite: WaveFavorite,
  width: number,
  height: number,
): string {
  const path = buildWavePathForFavorite(favorite, width, height);
  const background =
    favorite.backgroundColor === "transparent" ? "transparent" : favorite.backgroundColor;
  const fill =
    favorite.fillColor === "transparent" || !favorite.fillColor
      ? "#f97373"
      : favorite.fillColor;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
  <rect x="0" y="0" width="${width}" height="${height}" fill="${background}" />
  <path fill="${fill}" d="${path}" />
</svg>`;
}

function downloadWaveFavorite(favorite: WaveFavorite, format: "svg" | "png" | "jpg") {
  if (typeof window === "undefined") {
    return;
  }

  const width = 1200;
  const height = 320;
  const svgMarkup = buildWaveSvgMarkupFromFavorite(favorite, width, height);

  if (format === "svg") {
    try {
      const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = "wave.svg";

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
    }

    return;
  }

  try {
    const svgBlob = new Blob([svgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const image = new window.Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (format === "jpg") {
        const fillColorForJpg =
          favorite.backgroundColor === "transparent" ? "#ffffff" : favorite.backgroundColor;
        context.fillStyle = fillColorForJpg;
        context.fillRect(0, 0, canvas.width, canvas.height);
      } else if (favorite.backgroundColor !== "transparent") {
        context.fillStyle = favorite.backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const mimeType = format === "png" ? "image/png" : "image/jpeg";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return;
          }

          const blobUrl = URL.createObjectURL(blob);
          const anchor = document.createElement("a");

          anchor.href = blobUrl;
          anchor.download = format === "png" ? "wave.png" : "wave.jpg";

          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          URL.revokeObjectURL(blobUrl);
        },
        mimeType,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
    };

    image.src = url;
  } catch {
  }
}

const WORKSPACE_PRESETS_STORAGE_KEY = "zanari-workspace-presets";
const FONT_FAVORITES_STORAGE_KEY = "zanari-font-favorites";
const WAVE_FAVORITES_STORAGE_KEY = "zanari-wave-favorites";
const COLOR_CONTRAST_PRESETS_STORAGE_KEY = "zanari-color-contrast-presets";

export default function PinnedToolsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const workspaceStorageKey = buildUserScopedStorageKey(
    WORKSPACE_PRESETS_STORAGE_KEY,
    userId,
  );
  const fontStorageKey = buildUserScopedStorageKey(FONT_FAVORITES_STORAGE_KEY, userId);
  const waveStorageKey = buildUserScopedStorageKey(WAVE_FAVORITES_STORAGE_KEY, userId);
  const colorStorageKey = buildUserScopedStorageKey(
    COLOR_CONTRAST_PRESETS_STORAGE_KEY,
    userId,
  );

  const [presets, setPresets] = useState<WorkspacePreset[]>(() =>
    loadWorkspacePresetsFromStorage(workspaceStorageKey),
  );
  const [hasHydrated, setHasHydrated] = useState(false);
  const [fontFavorites, setFontFavorites] = useState<FontFavorite[]>(() =>
    loadFontFavoritesFromStorage(fontStorageKey),
  );
  const [clearToast, setClearToast] = useState<{
    id: number;
    target: WorkspaceClearTarget;
    message: string;
  } | null>(null);
  const [waveFavorites, setWaveFavorites] = useState<WaveFavorite[]>(() =>
    loadWaveFavoritesFromStorage(waveStorageKey),
  );
  const [waveDownloadFormats, setWaveDownloadFormats] = useState<
    Record<string, "svg" | "png" | "jpg">
  >({});

  const [workspaceFontSampleText, setWorkspaceFontSampleText] = useState(
    "ABCDEFG abcdefg 1234567890 !@#$%^&*()",
  );

  const [colorContrastPresets, setColorContrastPresets] = useState<
    Record<
      string,
      {
        textColor: string;
        backgroundColor: string;
        containerColor: string;
        mode: "two" | "three";
      }
    >
  >(() => loadColorContrastPresetsFromStorage(colorStorageKey));

  const handleDeletePreset = (presetId: string) => {
    setPresets((current) => {
      const presetToDelete = current.find((preset) => preset.id === presetId);
      const next = current.filter((preset) => preset.id !== presetId);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          workspaceStorageKey,
          JSON.stringify(next),
        );

        if (presetToDelete && presetToDelete.toolName === "Color Contrast Checker") {
          try {
            const storedColor = window.localStorage.getItem(colorStorageKey);

            if (storedColor) {
              const parsedColor = JSON.parse(storedColor);

              if (Array.isArray(parsedColor)) {
                const nextColorPresets = parsedColor.filter((item) => {
                  if (!item || typeof item !== "object") {
                    return true;
                  }

                  const value = item as { id?: unknown };

                  if (value.id === presetId) {
                    return false;
                  }

                  return true;
                });

                window.localStorage.setItem(colorStorageKey, JSON.stringify(nextColorPresets));
              }
            }
          } catch {
          }
        }
      }

      return next;
    });
  };

  const handleDeleteFontFavorite = (family: string) => {
    setFontFavorites((current) => {
      const next = current.filter((favorite) => favorite.family !== family);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          fontStorageKey,
          JSON.stringify(next),
        );
      }

      return next;
    });
  };

  const handleDeleteWaveFavorite = (id: string) => {
    setWaveFavorites((current) => {
      const next = current.filter((favorite) => favorite.id !== id);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          waveStorageKey,
          JSON.stringify(next),
        );
      }

      return next;
    });
  };

  const performClearPresets = () => {
    setPresets(() => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          workspaceStorageKey,
          JSON.stringify([]),
        );
      }

      return [];
    });
  };

  const performClearFontFavorites = () => {
    setFontFavorites(() => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          fontStorageKey,
          JSON.stringify([]),
        );
      }

      return [];
    });
  };

  const performClearWaveFavorites = () => {
    setWaveFavorites(() => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          waveStorageKey,
          JSON.stringify([]),
        );
      }

      return [];
    });
  };

  useEffect(() => {
    const id = setTimeout(() => {
      setHasHydrated(true);
    }, 0);

    return () => {
      clearTimeout(id);
    };
  }, []);

  const handleRequestClearPresets = () => {
    setClearToast({
      id: Date.now() + Math.random(),
      target: "presets",
      message: "Clear all saved workspace presets?",
    });
  };

  const handleRequestClearFontFavorites = () => {
    setClearToast({
      id: Date.now() + Math.random(),
      target: "fonts",
      message: "Clear all favorite fonts on this device?",
    });
  };

  const handleRequestClearWaveFavorites = () => {
    setClearToast({
      id: Date.now() + Math.random(),
      target: "waves",
      message: "Clear all favorite waves on this device?",
    });
  };

  const handleConfirmClear = () => {
    if (!clearToast) {
      return;
    }

    if (clearToast.target === "presets") {
      performClearPresets();
    } else if (clearToast.target === "fonts") {
      performClearFontFavorites();
    } else if (clearToast.target === "waves") {
      performClearWaveFavorites();
    }

    setClearToast(null);
  };

  const handleCancelClear = () => {
    setClearToast(null);
  };

  const visibleWorkspacePresets = presets.filter((preset) => {
    if (preset.toolName !== "Color Contrast Checker") {
      return true;
    }

    const colorPreset = colorContrastPresets[preset.id];

    if (colorPreset) {
      return true;
    }

    if (preset.note && preset.note.trim().length > 0) {
      return true;
    }

    return false;
  });

  const handleCopyColorHex = async (value: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
    } catch {
    }
  };

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        {!hasHydrated ? (
          <PinnedToolsSkeleton />
        ) : (
          <>
            <section className="border-b border-zinc-200 bg-white/80">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8 md:py-8">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Workspace
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                    Your workspace
                  </h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
                    Save presets for the tools you rely on most. Workspace items stay
                    on this device so you can quickly return to the same contrast
                    pairs, ratios, or font setups later.
                  </p>
                </div>
                <PageTransitionLink
                  href="/"
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-red-300 px-3 text-[11px] font-medium text-red-400 whitespace-nowrap transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                >
                  <span>Back</span>
                </PageTransitionLink>
              </div>
            </section>
            <section className="py-8 md:py-10">
              <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-8">
                <div className="space-y-6">
                  {visibleWorkspacePresets.length > 0 && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-[11px] text-zinc-700 sm:p-5">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-zinc-900">
                            Saved workspace presets
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Presets saved from other tools on this device.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 items-center rounded-full bg-red-50 px-3 text-[10px] font-medium text-red-600">
                            {visibleWorkspacePresets.length} saved
                          </span>
                          <button
                            type="button"
                            onClick={handleRequestClearPresets}
                            className="inline-flex h-7 items-center rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {visibleWorkspacePresets.map((preset) => {
                          const tool = allTools.find(
                            (item) => item.name === preset.toolName,
                          );
                          const createdDate = new Date(preset.createdAt).toLocaleDateString(
                            "en-US",
                          );
                          const iconSource = tool ? tool.name : preset.toolName;
                          const iconInitial =
                            iconSource.trim().length > 0
                              ? iconSource.trim().charAt(0).toUpperCase()
                              : "U";

                          const isColorContrastPreset =
                            preset.toolName === "Color Contrast Checker";
                          const colorPreset = isColorContrastPreset
                            ? colorContrastPresets[preset.id]
                            : undefined;

                          if (isColorContrastPreset && !colorPreset) {
                            if (!preset.note || preset.note.trim().length === 0) {
                              return null;
                            }
                          }

                          return (
                            <div
                              key={preset.id}
                              className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500 text-[10px] font-semibold text-white">
                                    {iconInitial}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-[11px] font-medium text-zinc-900">
                                      {preset.name}
                                    </p>
                                    <p className="truncate text-[10px] text-zinc-500">
                                      {tool ? tool.name : preset.toolName}
                                    </p>
                                    <p className="truncate text-[9px] text-zinc-400">
                                      Saved on {createdDate}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePreset(preset.id)}
                                    className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[9px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                              {isColorContrastPreset && colorPreset ? (
                                <div className="flex flex-col gap-2 rounded-lg bg-white/60 p-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] uppercase tracking-wide text-zinc-500">
                                      Colors
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="h-5 w-5 rounded border border-zinc-200"
                                        style={{
                                          backgroundColor:
                                            colorPreset.backgroundColor || "#ffffff",
                                        }}
                                      />
                                      <span
                                        className="h-5 w-5 rounded border border-zinc-200"
                                        style={{
                                          backgroundColor: colorPreset.textColor || "#000000",
                                        }}
                                      />
                                      {colorPreset.mode === "three" && (
                                        <span
                                          className="h-5 w-5 rounded border border-zinc-200"
                                          style={{
                                            backgroundColor:
                                              colorPreset.containerColor || "#f4f4f5",
                                          }}
                                        />
                                      )}
                                    </div>
                                  </div>
                                  <div className="grid gap-1 text-[10px] text-zinc-700">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-16 text-[9px] uppercase tracking-wide text-zinc-500">
                                        Text
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopyColorHex(colorPreset.textColor)
                                        }
                                        className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-800 hover:border-red-200 hover:bg-red-50"
                                      >
                                        <span>{colorPreset.textColor}</span>
                                        <Image
                                          src="/icons/copy.svg"
                                          alt=""
                                          width={10}
                                          height={10}
                                        />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-16 text-[9px] uppercase tracking-wide text-zinc-500">
                                        Background
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopyColorHex(colorPreset.backgroundColor)
                                        }
                                        className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-800 hover:border-red-200 hover:bg-red-50"
                                      >
                                        <span>{colorPreset.backgroundColor}</span>
                                        <Image
                                          src="/icons/copy.svg"
                                          alt=""
                                          width={10}
                                          height={10}
                                        />
                                      </button>
                                    </div>
                                    {colorPreset.mode === "three" && (
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-16 text-[9px] uppercase tracking-wide text-zinc-500">
                                          Container
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleCopyColorHex(colorPreset.containerColor)
                                          }
                                          className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-800 hover:border-red-200 hover:bg-red-50"
                                        >
                                          <span>{colorPreset.containerColor}</span>
                                          <Image
                                            src="/icons/copy.svg"
                                            alt=""
                                            width={10}
                                            height={10}
                                          />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                preset.note && (
                                  <p className="line-clamp-2 text-[10px] leading-relaxed text-zinc-600">
                                    {preset.note}
                                  </p>
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {fontFavorites.length > 0 && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-[11px] text-zinc-700 sm:p-5">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-zinc-900">
                            Favorite fonts
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Saved from Google Font Explorer on this device.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 items-center rounded-full bg-red-50 px-3 text-[10px] font-medium text-red-600">
                            {fontFavorites.length} saved
                          </span>
                          <button
                            type="button"
                            onClick={handleRequestClearFontFavorites}
                            className="inline-flex h-7 items-center rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="mb-3 space-y-1">
                        <p className="text-[10px] font-medium text-zinc-700">
                          Sample text
                        </p>
                        <input
                          value={workspaceFontSampleText}
                          onChange={(event) =>
                            setWorkspaceFontSampleText(event.target.value)
                          }
                          className="h-8 w-full rounded-lg border border-zinc-200 bg-white px-3 text-[11px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
                        />
                      </div>
                      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {fontFavorites.map((favorite) => (
                          <li
                            key={favorite.family}
                            className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[12px] font-medium text-zinc-900">
                                  {favorite.family}
                                </p>
                                <p className="text-[10px] lowercase text-zinc-500">
                                  {favorite.category}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFontFavorite(favorite.family)}
                                  className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[9px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <p
                              className="w-full min-h-[3.5rem] break-words text-[45px] leading-tight text-zinc-700"
                              style={{
                                fontFamily: `"${favorite.family}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
                              }}
                            >
                              {workspaceFontSampleText}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {waveFavorites.length > 0 && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-[11px] text-zinc-700 sm:p-5">
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-zinc-900">
                            Favorite waves
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Saved from SVG Wave Generator with your current settings.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 items-center rounded-full bg-red-50 px-3 text-[10px] font-medium text-red-600">
                            {waveFavorites.length} saved
                          </span>
                          <button
                            type="button"
                            onClick={handleRequestClearWaveFavorites}
                            className="inline-flex h-7 items-center rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {waveFavorites.map((favorite) => {
                          const createdDate = new Date(
                            favorite.createdAt,
                          ).toLocaleDateString("en-US");
                          const previewPath = buildWavePathForFavorite(
                            favorite,
                            160,
                            80,
                          );
                          const downloadFormat =
                            waveDownloadFormats[favorite.id] ?? "svg";

                          return (
                            <li
                              key={favorite.id}
                              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 space-y-0.5">
                                  <p className="text-[11px] font-medium text-zinc-900">
                                    {favorite.position === "top" ? "Top" : "Bottom"} ·{" "}
                                    {favorite.shape === "smooth" ? "Smooth" : "Zigzag"}
                                  </p>
                                  <p className="text-[10px] text-zinc-500">
                                    Height {favorite.heightValue}px · Curvature{" "}
                                    {favorite.intensityValue}
                                  </p>
                                  <p className="text-[10px] text-zinc-500">
                                    Wave {favorite.fillColor} · Background{" "}
                                    {favorite.backgroundColor}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteWaveFavorite(favorite.id)}
                                    className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <span>Remove</span>
                                  </button>
                                </div>
                              </div>
                              <div className="mt-2 flex flex-col gap-2">
                                <div className="relative h-28 w-full overflow-hidden rounded-md border border-zinc-200 bg-white">
                                  <svg
                                    viewBox="0 0 160 80"
                                    preserveAspectRatio="none"
                                    className="h-full w-full"
                                  >
                                    <rect
                                      x={0}
                                      y={0}
                                      width={160}
                                      height={80}
                                      fill={
                                        favorite.backgroundColor === "transparent"
                                          ? "#ffffff"
                                          : favorite.backgroundColor
                                      }
                                    />
                                    <path
                                      d={previewPath}
                                      fill={
                                        favorite.fillColor === "transparent"
                                          ? "#f97373"
                                          : favorite.fillColor
                                      }
                                      />
                                    </svg>
                                  </div>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="inline-flex rounded-full border border-zinc-200 bg-white p-0.5 text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setWaveDownloadFormats((current) => ({
                                          ...current,
                                          [favorite.id]: "svg",
                                        }))
                                      }
                                      className={`rounded-full px-2.5 py-0.5 transition-colors duration-150 ${
                                        downloadFormat === "svg"
                                          ? "bg-red-500 text-white"
                                          : "text-zinc-600 hover:text-zinc-800"
                                      }`}
                                    >
                                      SVG
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setWaveDownloadFormats((current) => ({
                                          ...current,
                                          [favorite.id]: "png",
                                        }))
                                      }
                                      className={`rounded-full px-2.5 py-0.5 transition-colors duration-150 ${
                                        downloadFormat === "png"
                                          ? "bg-red-500 text-white"
                                          : "text-zinc-600 hover:text-zinc-800"
                                      }`}
                                    >
                                      PNG
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setWaveDownloadFormats((current) => ({
                                          ...current,
                                          [favorite.id]: "jpg",
                                        }))
                                      }
                                      className={`rounded-full px-2.5 py-0.5 transition-colors duration-150 ${
                                        downloadFormat === "jpg"
                                          ? "bg-red-500 text-white"
                                          : "text-zinc-600 hover:text-zinc-800"
                                      }`}
                                    >
                                      JPG
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      downloadWaveFavorite(
                                        favorite,
                                        downloadFormat,
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-zinc-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <span>Download</span>
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      {clearToast && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-end justify-center px-4 pb-6 sm:items-center sm:pb-0">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-zinc-200 bg-white/95 px-4 py-3 text-[12px] text-zinc-900 shadow-lg ring-1 ring-black/5 sm:px-5 sm:py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Confirm clear
            </p>
            <p className="mt-1 text-[13px] font-medium leading-snug">{clearToast.message}</p>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelClear}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="inline-flex items-center justify-center rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
              >
                Yes, clear
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

function PinnedToolsSkeleton() {
  return (
    <>
      <section className="border-b border-zinc-200 bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-8 md:py-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-medium text-zinc-400 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
              <span className="h-3 w-32 rounded-full bg-zinc-200" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-48 rounded-full bg-zinc-200 animate-pulse" />
              <div className="h-3 w-64 rounded-full bg-zinc-200 animate-pulse" />
              <div className="h-3 w-56 rounded-full bg-zinc-200 animate-pulse" />
            </div>
          </div>
          <div className="inline-flex h-8 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 text-[11px] text-zinc-400">
            <span className="h-3 w-3 rounded-full bg-zinc-200 animate-pulse" />
            <span className="h-3 w-16 rounded-full bg-zinc-200 animate-pulse" />
          </div>
        </div>
      </section>
      <section className="py-8 md:py-10">
        <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-8">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr),minmax(0,2fr)] md:items-start">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="space-y-2">
                <div className="h-3 w-32 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-4 w-40 rounded-full bg-zinc-200 animate-pulse" />
                <div className="h-3 w-56 rounded-full bg-zinc-200 animate-pulse" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="space-y-1">
                  <div className="h-3 w-24 rounded-full bg-zinc-200 animate-pulse" />
                  <div className="h-8 w-full rounded-md bg-zinc-100 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 rounded-full bg-zinc-200 animate-pulse" />
                  <div className="h-8 w-full rounded-md bg-zinc-100 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-32 rounded-full bg-zinc-200 animate-pulse" />
                  <div className="h-16 w-full rounded-md bg-zinc-100 animate-pulse" />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="h-7 w-32 rounded-full bg-zinc-200 animate-pulse" />
                  <div className="h-3 w-40 rounded-full bg-zinc-100 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-[11px] text-zinc-600 sm:p-6">
              <div className="space-y-2">
                <div className="h-3 w-32 rounded-full bg-zinc-200 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-48 rounded-full bg-zinc-100 animate-pulse" />
                  <div className="h-3 w-40 rounded-full bg-zinc-100 animate-pulse" />
                  <div className="h-3 w-44 rounded-full bg-zinc-100 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-zinc-200 animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-4 w-32 rounded-full bg-zinc-200 animate-pulse" />
                        <div className="h-3 w-24 rounded-full bg-zinc-100 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-3 w-16 rounded-full bg-zinc-100 animate-pulse" />
                  </div>
                  <div className="mb-3 space-y-1">
                    <div className="h-3 w-full rounded-full bg-zinc-100 animate-pulse" />
                    <div className="h-3 w-4/5 rounded-full bg-zinc-100 animate-pulse" />
                  </div>
                  <div className="mt-auto flex items-center justify-end">
                    <div className="h-7 w-20 rounded-full bg-zinc-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
