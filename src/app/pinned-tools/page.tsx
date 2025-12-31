"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { tools as allTools } from "@/components/ToolGrid";
import { PageTransitionLink } from "@/components/PageTransitionLink";
import { useSettings } from "@/providers/SettingsProvider";

type WorkspacePreset = {
  id: string;
  name: string;
  toolName: string;
  note: string;
  createdAt: string;
};

const WORKSPACE_PRESETS_STORAGE_KEY = "you-i-workspace-presets";

function getChevronIcon(accent: string) {
  switch (accent) {
    case "sky":
      return "/icons/chevron/chevron_sky.svg";
    case "emerald":
      return "/icons/chevron/chevron_emerald.svg";
    case "violet":
      return "/icons/chevron/chevron_violet.svg";
    case "amber":
      return "/icons/chevron/chevron_amber.svg";
    case "red":
    default:
      return "/icons/chevron/chevron_red.svg";
  }
}

export default function PinnedToolsPage() {
  const { profileBannerColor } = useSettings();
  const chevronIconSrc = getChevronIcon(profileBannerColor);
  const [presets, setPresets] = useState<WorkspacePreset[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = window.localStorage.getItem(WORKSPACE_PRESETS_STORAGE_KEY);

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
  });

  const [hasHydrated, setHasHydrated] = useState(false);
  const [removingPresetIds, setRemovingPresetIds] = useState<string[]>([]);
  const [confirmingPresetId, setConfirmingPresetId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [toolNameInput, setToolNameInput] = useState(
    allTools[0]?.name ?? "",
  );
  const [noteInput, setNoteInput] = useState("");
  const toolMenuRef = useRef<HTMLDivElement | null>(null);
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setHasHydrated(true);
    }, 0);

    return () => {
      clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (!isToolMenuOpen) {
      return;
    }

    if (typeof document === "undefined") {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (!toolMenuRef.current) {
        return;
      }

      if (!toolMenuRef.current.contains(event.target as Node)) {
        setIsToolMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isToolMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      WORKSPACE_PRESETS_STORAGE_KEY,
      JSON.stringify(presets),
    );
  }, [presets]);

  const handleCreatePreset = () => {
    const trimmedName = nameInput.trim();

    if (!trimmedName || !toolNameInput) {
      return;
    }

    const newPreset: WorkspacePreset = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      toolName: toolNameInput,
      note: noteInput.trim(),
      createdAt: new Date().toISOString(),
    };

    setPresets((current) => [newPreset, ...current]);
    setNameInput("");
    setNoteInput("");
  };

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
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
          <div className="mx-auto max-w-6xl px-4 md:px-8 space-y-8">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr),minmax(0,2fr)] md:items-start">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 space-y-1">
                  <p className="text-xs font-medium text-zinc-500">
                    New workspace preset
                  </p>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Capture a starting point
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    Give your preset a name, choose a tool, and add a short
                    note about how you use it in your design work.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="workspace-name"
                      className="text-[11px] font-medium text-zinc-600"
                    >
                      Preset name
                    </label>
                    <input
                      id="workspace-name"
                      value={nameInput}
                      onChange={(event) => setNameInput(event.target.value)}
                      placeholder="Example: Large body text on warm backgrounds"
                      className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="workspace-tool"
                      className="text-[11px] font-medium text-zinc-600"
                    >
                      Tool
                    </label>
                    <div ref={toolMenuRef} className="relative">
                      <button
                        type="button"
                        id="workspace-tool"
                        aria-haspopup="listbox"
                        aria-expanded={isToolMenuOpen}
                        onClick={() => setIsToolMenuOpen((open) => !open)}
                        className="flex w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition-colors hover:border-red-300 hover:bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                      >
                        <span className="truncate">{toolNameInput || "Select a tool"}</span>
                        <span className="ml-2 flex h-4 w-4 items-center justify-center">
                          <Image
                            src={chevronIconSrc}
                            alt=""
                            width={12}
                            height={12}
                            className={`h-3 w-3 transition-transform ${
                              isToolMenuOpen ? "rotate-90" : "rotate-270"
                            }`}
                          />
                        </span>
                      </button>
                      {isToolMenuOpen && (
                        <div
                          role="listbox"
                          aria-label="Workspace tool"
                          className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-md border border-zinc-200 bg-white py-1 text-sm shadow-lg"
                        >
                          {allTools.map((tool) => {
                            const isActive = toolNameInput === tool.name;

                            return (
                              <button
                                key={tool.name}
                                type="button"
                                onClick={() => {
                                  setToolNameInput(tool.name);
                                  setIsToolMenuOpen(false);
                                }}
                                className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] ${
                                  isActive
                                    ? "bg-red-50 text-red-700"
                                    : "text-zinc-700 hover:bg-red-50 hover:text-red-700"
                                }`}
                                role="option"
                                aria-selected={isActive}
                              >
                                <span className="truncate">{tool.name}</span>
                                {isActive && (
                                  <span className="ml-2 h-1.5 w-1.5 rounded-full bg-red-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="workspace-note"
                      className="text-[11px] font-medium text-zinc-600"
                    >
                      Notes (optional)
                    </label>
                    <textarea
                      id="workspace-note"
                      value={noteInput}
                      onChange={(event) => setNoteInput(event.target.value)}
                      placeholder="For example: use AA large as a minimum and keep headings slightly darker."
                      rows={3}
                      className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleCreatePreset}
                      className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
                    >
                      Save to workspace
                    </button>
                    <p className="text-[10px] text-zinc-500">
                      Presets are stored in this browser only and can be cleared
                      from your settings.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-[11px] text-zinc-600 sm:p-6">
                <p className="text-xs font-medium text-zinc-800">How to use workspace</p>
                <ul className="mt-2 space-y-1.5">
                  <li>
                    Save contrast pairs you check often so you can quickly
                    compare new colors against them.
                  </li>
                  <li>
                    Capture ratios and sizes that work well in your product to
                    reuse across pages.
                  </li>
                  <li>
                    Keep a short note on why something passes accessibility so
                    you can explain it later to teammates.
                  </li>
                </ul>
              </div>
            </div>
            <div>
              {hasHydrated && presets.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {presets.map((preset) => {
                    const tool = allTools.find(
                      (item) => item.name === preset.toolName,
                    );
                    const isRemoving = removingPresetIds.includes(preset.id);
                    const createdDate = new Date(
                      preset.createdAt,
                    ).toLocaleDateString();
                    const iconSource = tool ? tool.name : preset.toolName;
                    const iconInitial =
                      iconSource.trim().length > 0
                        ? iconSource.trim().charAt(0).toUpperCase()
                        : "U";

                    return (
                      <div
                        key={preset.id}
                        className={`flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 ease-out ${
                          isRemoving
                            ? "opacity-0 -translate-y-1"
                            : "opacity-100 translate-y-0"
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-xs font-semibold text-white">
                              {iconInitial}
                            </div>
                            <div className="flex-1">
                              <h2 className="text-sm font-semibold text-zinc-900">
                                {preset.name}
                              </h2>
                              <p className="text-[11px] text-zinc-500">
                                {tool ? tool.name : preset.toolName}
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-400">
                            {createdDate}
                          </p>
                        </div>
                        {preset.note ? (
                          <p className="mb-3 flex-1 text-xs leading-relaxed text-zinc-600">
                            {preset.note}
                          </p>
                        ) : tool ? (
                          <p className="mb-3 flex-1 text-xs leading-relaxed text-zinc-600">
                            {tool.description}
                          </p>
                        ) : (
                          <p className="mb-3 flex-1 text-xs leading-relaxed text-zinc-600">
                            Saved workspace preset.
                          </p>
                        )}
                        <div className="flex items-center justify-end gap-2">
                          {confirmingPresetId === preset.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setConfirmingPresetId(null)}
                                className="inline-flex h-7 items-center justify-center rounded-full border border-zinc-200 px-3 text-[11px] font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRemovingPresetIds((current) =>
                                    current.includes(preset.id)
                                      ? current
                                      : [...current, preset.id],
                                  );

                                  window.setTimeout(() => {
                                    setPresets((current) =>
                                      current.filter(
                                        (item) => item.id !== preset.id,
                                      ),
                                    );
                                    setRemovingPresetIds((current) =>
                                      current.filter(
                                        (id) => id !== preset.id,
                                      ),
                                    );
                                    setConfirmingPresetId((current) =>
                                      current === preset.id ? null : current,
                                    );
                                  }, 180);
                                }}
                                className="inline-flex h-7 items-center justify-center rounded-full border border-red-200 px-3 text-[11px] font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmingPresetId(preset.id)}
                              className="inline-flex h-7 items-center justify-center rounded-full border border-zinc-200 px-3 text-[11px] font-medium text-zinc-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-600 sm:px-6 sm:py-8">
                  <p className="text-sm font-medium text-zinc-800">
                    No workspace presets yet
                  </p>
                  <p className="mt-1 text-[13px] text-zinc-600">
                    Start by saving a preset for one of the tools on the main
                    page. Each item stays in this browser so you can return to
                    the same setup whenever you need it.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
