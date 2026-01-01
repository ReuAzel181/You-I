"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSettings } from "@/providers/SettingsProvider";

type FontItem = {
  family: string;
  category: string;
};

type CategoryFilterId = "all" | "sans-serif" | "serif" | "monospace" | "display" | "handwriting";

type FeelingId = "all" | "neutral" | "friendly" | "elegant" | "playful" | "tech";

type PreviewWeightId = "regular" | "medium" | "semibold" | "bold" | "extrabold" | "black";

const pageSize = 40;
const defaultSampleText = "ABCDEFG abcdefg 1234567890 !@#$%^&*()";

const loadedFontFamilies = new Set<string>();

type FontFavorite = {
  family: string;
  category: string;
  addedAt: string;
};

const FONT_FAVORITES_STORAGE_KEY = "zanari-font-favorites";

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

function getPreviewWeightValue(weight: PreviewWeightId): number {
  if (weight === "medium") {
    return 500;
  }

  if (weight === "semibold") {
    return 600;
  }

  if (weight === "bold") {
    return 700;
  }

  if (weight === "extrabold") {
    return 800;
  }

  if (weight === "black") {
    return 900;
  }

  return 400;
}

function getFontFeeling(family: string): FeelingId {
  const name = family.toLowerCase();

  if (name.includes("rounded") || name.includes("comic") || name.includes("poppins")) {
    return "friendly";
  }

  if (
    name.includes("garamond") ||
    name.includes("bodoni") ||
    name.includes("playfair") ||
    name.includes("merriweather")
  ) {
    return "elegant";
  }

  if (
    name.includes("mono") ||
    name.includes("code") ||
    name.includes("space") ||
    name.includes("tech")
  ) {
    return "tech";
  }

  if (
    name.includes("comic") ||
    name.includes("hand") ||
    name.includes("script") ||
    name.includes("fun")
  ) {
    return "playful";
  }

  return "neutral";
}

type GoogleFontExplorerProps = {
  variant?: "full" | "preview";
};

export function GoogleFontExplorer({ variant = "full" }: GoogleFontExplorerProps) {
  const [fontFavorites, setFontFavorites] = useState<FontFavorite[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(FONT_FAVORITES_STORAGE_KEY);

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
  });
  const [fonts, setFonts] = useState<FontItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterId>("all");
  const [feelingFilter, setFeelingFilter] = useState<FeelingId>("all");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [sampleText, setSampleText] = useState(defaultSampleText);
  const { nudgeAmount } = useSettings();
  const effectiveNudgeAmount =
    Number.isFinite(nudgeAmount) && nudgeAmount > 0 ? nudgeAmount : 8;
  const [previewSize, setPreviewSize] = useState(26);
  const [sliderValue, setSliderValue] = useState(26);
  const [sizeInput, setSizeInput] = useState("26");
  const [previewWeight, setPreviewWeight] = useState<PreviewWeightId>("regular");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      FONT_FAVORITES_STORAGE_KEY,
      JSON.stringify(fontFavorites),
    );
  }, [fontFavorites]);

  useEffect(() => {
    let cancelled = false;

    async function loadFonts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/google-fonts");

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const message =
            typeof payload?.error === "string"
              ? payload.error
              : "Unable to load Google Fonts. Check your configuration.";

          if (!cancelled) {
            setError(message);
          }

          return;
        }

        const payload = await response.json();
        const items = (payload?.fonts ?? []) as FontItem[];

        if (!cancelled) {
          setFonts(items);
          setVisibleCount(pageSize);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to reach the Google Fonts service. Try again in a moment.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFonts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [searchQuery, categoryFilter, feelingFilter]);

  const favoriteFamilies = useMemo(() => {
    const set = new Set<string>();

    fontFavorites.forEach((favorite) => {
      set.add(favorite.family);
    });

    return set;
  }, [fontFavorites]);

  function toggleFontFavorite(font: FontItem) {
    setFontFavorites((current) => {
      const exists = current.some((item) => item.family === font.family);

      if (exists) {
        return current.filter((item) => item.family !== font.family);
      }

      const next: FontFavorite = {
        family: font.family,
        category: font.category,
        addedAt: new Date().toISOString(),
      };

      return [next, ...current];
    });
  }

  const filteredFonts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return fonts.filter((font) => {
      const matchesQuery = query.length === 0 || font.family.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "all" || font.category === categoryFilter || font.category === "system-ui";
      const matchesFeeling =
        feelingFilter === "all" || getFontFeeling(font.family) === feelingFilter;

      return matchesQuery && matchesCategory && matchesFeeling;
    });
  }, [fonts, searchQuery, categoryFilter, feelingFilter]);

  const visibleFonts = useMemo(
    () => filteredFonts.slice(0, visibleCount),
    [filteredFonts, visibleCount],
  );

  const clampPreviewSize = useCallback((value: number, fallback: number) => {
    if (Number.isNaN(value)) {
      return fallback;
    }

    if (value < 12) {
      return 12;
    }

    if (value > 120) {
      return 120;
    }

    return value;
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setPreviewSize((current) => clampPreviewSize(sliderValue ?? current, current));
    }, 30);

    return () => {
      window.clearTimeout(handle);
    };
  }, [sliderValue, clampPreviewSize]);

  useEffect(() => {
    if (visibleFonts.length === 0) {
      return;
    }

    visibleFonts.forEach((font) => {
      ensureFontStylesheet(font.family);
    });
  }, [visibleFonts]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    if (visibleFonts.length >= filteredFonts.length) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setVisibleCount((current) => {
            const next = current + pageSize;

            if (next >= filteredFonts.length) {
              return filteredFonts.length;
            }

            return next;
          });
        }
      }
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [filteredFonts.length, visibleFonts.length]);

  const categories: { id: CategoryFilterId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "sans-serif", label: "Sans" },
    { id: "serif", label: "Serif" },
    { id: "monospace", label: "Mono" },
    { id: "display", label: "Display" },
    { id: "handwriting", label: "Handwriting" },
  ];

  const feelings: { id: FeelingId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "neutral", label: "Neutral" },
    { id: "friendly", label: "Friendly" },
    { id: "elegant", label: "Elegant" },
    { id: "playful", label: "Playful" },
    { id: "tech", label: "Technical" },
  ];

  const previewFonts = visibleFonts.slice(0, 4);

  if (variant === "preview") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
          <p className="text-xs font-medium text-zinc-700">Google Font Explorer</p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Search curated families and preview your copy in a few styles without leaving the
            homepage.
          </p>
        </div>
        <div className="flex min-h-[220px] max-h-[260px] flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
            <p className="text-[11px] font-medium text-zinc-600">Sample families</p>
            <p className="text-[10px] text-zinc-400">
              {filteredFonts.length.toLocaleString("en-US")} available
            </p>
          </div>
          <div className="space-y-2 border-b border-zinc-100 px-3 py-2">
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-zinc-600">Search</p>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by family name"
                className="h-7 w-full rounded-md border border-zinc-200 bg-white px-2 text-[10px] text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-offset-0"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-zinc-600">Feeling</p>
              <div className="flex flex-wrap gap-1.5">
                {feelings.map((feeling) => {
                  const isActive = feelingFilter === feeling.id;

                  return (
                    <button
                      key={feeling.id}
                      type="button"
                      onClick={() => setFeelingFilter(feeling.id)}
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-medium transition-colors ${
                        isActive
                          ? "border-red-500 bg-red-500 text-white shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-500 hover:border-red-200 hover:text-red-600"
                      }`}
                    >
                      {feeling.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex h-32 items-center justify-center text-[11px] text-zinc-500">
                Loading Google Fonts…
              </div>
            )}
            {!isLoading && error && (
              <div className="flex h-32 items-center justify-center px-3 text-center text-[11px] text-red-600">
                {error}
              </div>
            )}
            {!isLoading && !error && previewFonts.length === 0 && (
              <div className="flex h-32 items-center justify-center px-3 text-center text-[11px] text-zinc-500">
                Fonts will appear here once loaded.
              </div>
            )}
            {!isLoading && !error && previewFonts.length > 0 && (
              <ul className="divide-y divide-zinc-100 text-xs">
                {previewFonts.map((font) => {
                  const previewFamily = `"${font.family}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
                  const previewFontWeight = getPreviewWeightValue(previewWeight);
                  const isFavorite = favoriteFamilies.has(font.family);

                  return (
                    <li key={font.family} className="px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-zinc-800">
                            {font.family}
                          </p>
                          <p className="text-[10px] lowercase text-zinc-500">
                            {font.category}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleFontFavorite(font)}
                          aria-label={
                            isFavorite
                              ? "Remove from favorite fonts"
                              : "Add to favorite fonts"
                          }
                          className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-zinc-200 text-[11px] text-zinc-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className="h-4 w-4"
                          >
                            <path
                              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4 8.04 4 9.54 4.81 10.35 6.09 11.16 4.81 12.66 4 14.2 4 16.7 4 18.7 6 18.7 8.5c0 3.78-3.4 6.86-8.55 11.54z"
                              fill={isFavorite ? "#ef4444" : "none"}
                              stroke={isFavorite ? "#ef4444" : "currentColor"}
                              strokeWidth="1.6"
                            />
                          </svg>
                        </button>
                      </div>
                      <p
                        style={{
                          fontFamily: previewFamily,
                          fontSize: Math.max(previewSize, 18),
                          lineHeight: 1.25,
                          fontWeight: previewFontWeight,
                        }}
                        className="mt-1 w-full break-words text-[15px] leading-snug text-zinc-900"
                      >
                        {sampleText}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 md:flex-row md:items-start md:gap-6">
        <div className="w-full space-y-4 md:w-64 md:flex-none">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-700">Search fonts</p>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by family name"
              className="h-8 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-700">Sample text</p>
            <textarea
              value={sampleText}
              onChange={(event) => setSampleText(event.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none ring-red-100 placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-offset-0"
            />
            <button
              type="button"
              onClick={() => setSampleText(defaultSampleText)}
              className="mt-1 text-[10px] font-medium text-red-600 hover:text-red-700"
            >
              Reset to default sentence
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-zinc-700">Preview size</p>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={sizeInput}
                  onChange={(event) => {
                    setSizeInput(event.target.value);
                  }}
                  onBlur={(event) => {
                    const rawValue = Number(event.target.value);
                    const clamped = clampPreviewSize(rawValue, sliderValue);
                    setSliderValue(clamped);
                    setSizeInput(String(clamped));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                      event.preventDefault();

                      const currentNumeric = Number(sizeInput);
                      const base = Number.isNaN(currentNumeric) ? sliderValue : currentNumeric;
                      const step = event.shiftKey ? effectiveNudgeAmount : 1;
                      const direction = event.key === "ArrowUp" ? 1 : -1;
                      const nextRaw = base + step * direction;

                      setSizeInput(String(nextRaw));

                      const clamped = clampPreviewSize(nextRaw, sliderValue);
                      setSliderValue(clamped);
                    } else if (event.key === "Enter") {
                      event.preventDefault();
                      const rawValue = Number(sizeInput);
                      const clamped = clampPreviewSize(rawValue, sliderValue);
                      setSliderValue(clamped);
                      setSizeInput(String(clamped));
                      event.currentTarget.blur();
                    }
                  }}
                  className="font-size-input h-6 w-12 rounded border border-zinc-200 bg-white px-1 text-right text-[10px] text-zinc-700 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                />
                <span className="text-[10px] text-zinc-400">px</span>
              </div>
            </div>
            <input
              type="range"
              min={12}
              max={120}
              value={sliderValue}
              onChange={(event) =>
                (() => {
                  const raw = Number(event.target.value);
                  const clamped = clampPreviewSize(raw, sliderValue);
                  setSliderValue(clamped);
                  setSizeInput(String(clamped));
                })()
              }
              className="font-size-slider h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-200"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-700">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = categoryFilter === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryFilter(category.id)}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      isActive
                        ? "border-red-500 bg-red-500 text-white shadow-sm"
                        : "border-zinc-200 bg-white text-zinc-500 hover:border-red-200 hover:text-red-600"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-700">Feeling</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All" },
                { id: "neutral", label: "Neutral" },
                { id: "friendly", label: "Friendly" },
                { id: "elegant", label: "Elegant" },
                { id: "playful", label: "Playful" },
                { id: "tech", label: "Technical" },
              ].map((feeling) => {
                const isActive = feelingFilter === feeling.id;

                return (
                  <button
                    key={feeling.id}
                    type="button"
                    onClick={() => setFeelingFilter(feeling.id as FeelingId)}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      isActive
                        ? "border-red-500 bg-red-500 text-white shadow-sm"
                        : "border-zinc-200 bg-white text-zinc-500 hover:border-red-200 hover:text-red-600"
                    }`}
                  >
                    {feeling.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-700">Weight</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "regular", label: "Regular" },
                { id: "medium", label: "Medium" },
                { id: "semibold", label: "Semibold" },
                { id: "bold", label: "Bold" },
                { id: "extrabold", label: "Extra bold" },
                { id: "black", label: "Black" },
              ].map((weight) => {
                const isActive = previewWeight === weight.id;

                return (
                  <button
                    key={weight.id}
                    type="button"
                    onClick={() => setPreviewWeight(weight.id as PreviewWeightId)}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      isActive
                        ? "border-red-500 bg-red-500 text-white shadow-sm"
                        : "border-zinc-200 bg-white text-zinc-500 hover:border-red-200 hover:text-red-600"
                    }`}
                  >
                    {weight.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-800">
            <span className="mt-[3px] h-1.5 w-1.5 flex-none rounded-full bg-amber-500" />
            <p className="leading-snug">
              Some families only supports certain weight, so options may look similar or identical.
            </p>
          </div>
        </div>
        <div className="flex min-h-[320px] flex-1 flex-col gap-4">
          <div className="flex w-full min-w-0 flex-col gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-700">
                {filteredFonts.length.toLocaleString("en-US")}{" "}
                {filteredFonts.length === 1 ? "font" : "fonts"} available
              </p>
              <p className="text-[11px] text-zinc-500">
                Scroll to load more families. Each row shows your sample text in that font.
              </p>
            </div>
          </div>
    <div className="flex w-full min-w-0 min-h-[260px] flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
              <p className="text-[11px] font-medium text-zinc-600">Font families</p>
              <p className="text-[10px] text-zinc-400">
                Showing {visibleFonts.length} of {filteredFonts.length}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading && (
                <div className="flex h-40 items-center justify-center text-xs text-zinc-500">
                  Loading fonts from Google Fonts…
                </div>
              )}
              {!isLoading && error && (
                <div className="flex h-40 items-center justify-center px-4 text-center text-[11px] text-red-600">
                  {error}
                </div>
              )}
              {!isLoading && !error && visibleFonts.length === 0 && (
                <div className="flex h-40 items-center justify-center px-4 text-center text-[11px] text-zinc-500">
                  No fonts match the current filters.
                </div>
              )}
              {!isLoading && !error && visibleFonts.length > 0 && (
                <>
                  <ul className="divide-y divide-zinc-100 text-xs">
                    {visibleFonts.map((font) => {
                      const previewFamily = `"${font.family}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
                      const previewFontWeight = getPreviewWeightValue(previewWeight);
                      const isFavorite = favoriteFamilies.has(font.family);

                      return (
                        <li key={font.family} className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-medium text-zinc-800">
                                {font.family}
                              </p>
                              <p className="text-[10px] lowercase text-zinc-500">
                                {font.category}
                              </p>
                            </div>
                            <div className="flex flex-none justify-center">
                              <button
                                type="button"
                                onClick={() => toggleFontFavorite(font)}
                                aria-label={
                                  isFavorite
                                    ? "Remove from favorite fonts"
                                    : "Add to favorite fonts"
                                }
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 text-[11px] text-zinc-400 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                  className="h-4 w-4"
                                >
                                  <path
                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4 8.04 4 9.54 4.81 10.35 6.09 11.16 4.81 12.66 4 14.2 4 16.7 4 18.7 6 18.7 8.5c0 3.78-3.4 6.86-8.55 11.54z"
                                    fill={isFavorite ? "#ef4444" : "none"}
                                    stroke={isFavorite ? "#ef4444" : "currentColor"}
                                    strokeWidth="1.6"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p
                            style={{
                              fontFamily: previewFamily,
                              fontSize: previewSize,
                              lineHeight: 1.2,
                              fontWeight: previewFontWeight,
                            }}
                            className="mt-1 break-words text-zinc-900 leading-tight"
                          >
                            {sampleText}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                  <div ref={sentinelRef} className="h-6 w-full" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
