import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PageTransitionLink } from "@/components/PageTransitionLink";

export type Tool = {
  name: string;
  description: string;
  href?: string;
  isLocked?: boolean;
};

export const tools: Tool[] = [
  {
    name: "Color Contrast Checker",
    description: "Quickly validate WCAG ratios for any text and background pair.",
    href: "/tools/color-contrast-checker",
  },
  {
    name: "Ratio Calculator",
    description: "See pass/fail states for AA and AAA across font sizes.",
    href: "/tools/ratio-calculator",
  },
  {
    name: "Unit Converter",
    description: "Convert px, rem, em, and percentage values with a custom base size.",
    href: "/tools/em-to-percent-converter",
  },
  {
    name: "Google Font Explorer",
    description: "Browse Google Fonts with live previews focused on English text.",
    href: "/tools/google-font-explorer",
  },
  {
    name: "Placeholder Generator",
    description: "Create lorem ipsum placeholders with adjustable length and casing.",
    href: "/tools/lorem-placeholder-generator",
  },
  {
    name: "Type Scale",
    description: "Generate a typography scale from a base size and ratio.",
    href: "/tools/type-scale",
  },
  {
    name: "SVG Wave Generator",
    description: "Create responsive SVG wave backgrounds for hero sections and page breaks.",
    href: "/tools/svg-wave-generator",
  },
  {
    name: "Gradient color",
    description: "Stay tuned for gradient presets designed for accessible interface work.",
    isLocked: true,
  },
  {
    name: "Background pattern",
    description: "Stay tuned for background patterns that work with your color system.",
    isLocked: true,
  },
];

type ToolGridProps = {
  pinnedToolNames?: string[] | null;
  onPinTool?: (tool: Tool) => void;
};

export function ToolGrid({ pinnedToolNames, onPinTool }: ToolGridProps) {
  const [orderedTools, setOrderedTools] = useState<Tool[]>(tools);
  const [dragToolName, setDragToolName] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastRectsRef = useRef<Record<string, DOMRect | null>>({});

  const draggedTool =
    dragToolName != null ? orderedTools.find((tool) => tool.name === dragToolName) ?? null : null;

  function handleDragStart(event: React.DragEvent<HTMLDivElement>, toolName: string) {
    setDragToolName(toolName);
    if (event.dataTransfer && typeof document !== "undefined") {
      const img = document.createElement("img");
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      event.dataTransfer.setDragImage(img, 0, 0);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>, targetName: string) {
    event.preventDefault();

    if (!dragToolName) {
      return;
    }

    const target = cardRefs.current[targetName];

    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const offsetX = event.clientX - rect.left;
    const proximityY = rect.height * 0.3;
    const proximityX = rect.width * 0.3;

    let isAfter = false;

    if (offsetY < proximityY) {
      isAfter = false;
    } else if (rect.height - offsetY < proximityY) {
      isAfter = true;
    } else {
      isAfter = offsetY >= rect.height / 2;
    }

    let isVerticalAfter = false;
    let showVertical = false;

    if (offsetX < proximityX) {
      isVerticalAfter = false;
      showVertical = true;
    } else if (rect.width - offsetX < proximityX) {
      isVerticalAfter = true;
      showVertical = true;
    } else {
      isVerticalAfter = offsetX >= rect.width / 2;
    }

    const dragged = orderedTools.find((tool) => tool.name === dragToolName);

    if (!dragged) {
      return;
    }

    const withoutDragged = orderedTools.filter((tool) => tool.name !== dragToolName);
    const targetIndex = withoutDragged.findIndex((tool) => tool.name === targetName);

    if (targetIndex === -1) {
      return;
    }

    let insertIndex = targetIndex;

    if (showVertical) {
      insertIndex = isVerticalAfter ? targetIndex + 1 : targetIndex;
    } else {
      insertIndex = isAfter ? targetIndex + 1 : targetIndex;
    }

    if (insertIndex < 0) {
      insertIndex = 0;
    } else if (insertIndex > withoutDragged.length) {
      insertIndex = withoutDragged.length;
    }

    const next = [...withoutDragged];
    next.splice(insertIndex, 0, dragged);

    if (next.length !== orderedTools.length) {
      return;
    }

    let changed = false;
    for (let index = 0; index < next.length; index += 1) {
      if (next[index].name !== orderedTools[index].name) {
        changed = true;
        break;
      }
    }

    if (changed) {
      setOrderedTools(next);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    setDragToolName(null);
    setDragPosition(null);
  }

  function handleDragEnd() {
    setDragToolName(null);
    setDragPosition(null);
  }

  function handleDrag(event: React.DragEvent<HTMLDivElement>) {
    if (!dragToolName) {
      return;
    }

    setDragPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem("youi-tools-order");

      if (!stored) {
        return;
      }

      const names = JSON.parse(stored) as unknown;

      if (!Array.isArray(names)) {
        return;
      }

      const orderedFromStorage: Tool[] = [];

      names.forEach((name) => {
        if (typeof name !== "string") {
          return;
        }
        const tool = tools.find((item) => item.name === name);
        if (tool) {
          orderedFromStorage.push(tool);
        }
      });

      const remaining = tools.filter(
        (tool) => !orderedFromStorage.some((item) => item.name === tool.name),
      );

      if (orderedFromStorage.length === 0 && remaining.length === tools.length) {
        return;
      }

      window.setTimeout(() => {
        setOrderedTools([...orderedFromStorage, ...remaining]);
      }, 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const names = orderedTools.map((tool) => tool.name);

    try {
      window.localStorage.setItem("youi-tools-order", JSON.stringify(names));
    } catch {}
  }, [orderedTools]);

  useLayoutEffect(() => {
    const currentRects: Record<string, DOMRect | null> = {};

    orderedTools.forEach((tool) => {
      const element = cardRefs.current[tool.name];
      if (!element) {
        currentRects[tool.name] = null;
        return;
      }
      currentRects[tool.name] = element.getBoundingClientRect();
    });

    const maxDistance = 400;

    orderedTools.forEach((tool) => {
      const element = cardRefs.current[tool.name];
      const previousRect = lastRectsRef.current[tool.name];
      const currentRect = currentRects[tool.name];

      if (!element || !previousRect || !currentRect) {
        return;
      }

      const deltaX = previousRect.left - currentRect.left;
      const deltaY = previousRect.top - currentRect.top;

      if (deltaX === 0 && deltaY === 0) {
        return;
      }

      if (Math.abs(deltaX) > maxDistance || Math.abs(deltaY) > maxDistance) {
        return;
      }

      if (typeof element.getAnimations === "function") {
        element.getAnimations().forEach((animation) => animation.cancel());
      }

      element.animate(
        [
          { transform: `translate(${deltaX}px, ${deltaY}px)` },
          { transform: "translate(0, 0)" },
        ],
        {
          duration: 260,
          easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        },
      );
    });

    lastRectsRef.current = currentRects;
  }, [orderedTools]);

  const nonLockedTools = orderedTools.filter((tool) => !tool.isLocked);
  const pinnedNonLockedCount = nonLockedTools.filter(
    (tool) => pinnedToolNames?.includes(tool.name) ?? false,
  ).length;

  const canPinAll = Boolean(onPinTool) && pinnedNonLockedCount < nonLockedTools.length;
  const canUnpinAll = Boolean(onPinTool) && pinnedNonLockedCount > 0;

  const handlePinAll = () => {
    if (!onPinTool) {
      return;
    }

    orderedTools.forEach((tool) => {
      if (tool.isLocked) {
        return;
      }

      const isPinned = pinnedToolNames?.includes(tool.name) ?? false;

      if (!isPinned) {
        onPinTool(tool);
      }
    });
  };

  const handleUnpinAll = () => {
    if (!onPinTool) {
      return;
    }

    orderedTools.forEach((tool) => {
      if (tool.isLocked) {
        return;
      }

      const isPinned = pinnedToolNames?.includes(tool.name) ?? false;

      if (isPinned) {
        onPinTool(tool);
      }
    });
  };

  return (
    <section id="tools" className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
              Tools that feel familiar and fast
            </h2>
            <p className="max-w-xl text-sm text-zinc-600">
              Inspired by the simplicity of iLovePDF, YOU-I focuses on clean
              layouts, clear labels, and workflows you can understand at a
              glance.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 text-xs text-zinc-500 md:items-end">
            <p>More tools are coming soon as the platform grows.</p>
            {onPinTool && (
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canPinAll}
                  onClick={handlePinAll}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
                >
                  Pin all tools
                </button>
                <button
                  type="button"
                  disabled={!canUnpinAll}
                  onClick={handleUnpinAll}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400"
                >
                  Remove all
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orderedTools.map((tool) => {
            const isPinned = pinnedToolNames?.includes(tool.name) ?? false;
            const hasHref = Boolean(tool.href) && !tool.isLocked;
            const isDragging = dragToolName === tool.name;
            const initial =
              tool.name.trim().length > 0
                ? tool.name.trim().charAt(0).toUpperCase()
                : "U";
            const isColorContrastChecker = tool.href === "/tools/color-contrast-checker";
            const isGoogleFontExplorer = tool.href === "/tools/google-font-explorer";
            const isRatioCalculator = tool.href === "/tools/ratio-calculator";
            const isTypeScale = tool.href === "/tools/type-scale";
            const isUnitConverter = tool.href === "/tools/em-to-percent-converter";
            const isPlaceholderGenerator =
              tool.href === "/tools/lorem-placeholder-generator";
            const isSvgWaveGenerator = tool.href === "/tools/svg-wave-generator";
            return (
              <div
                key={tool.name}
                ref={(element) => {
                  cardRefs.current[tool.name] = element;
                }}
                onDragOver={(event) => handleDragOver(event, tool.name)}
                onDrop={(event) => handleDrop(event)}
                onClick={(event) => {
                  if (!hasHref) {
                    return;
                  }
                  const target = event.target as HTMLElement;
                  if (target.closest("button")) {
                    return;
                  }
                  window.location.href = tool.href as string;
                }}
                className={`relative flex flex-col overflow-hidden rounded-xl border p-4 transition-colors transition-shadow ${
                  tool.isLocked
                    ? "cursor-not-allowed border-zinc-200 bg-zinc-50"
                    : "hover:border-red-200 hover:bg-red-50 hover:shadow-sm [data-theme=dark]:hover:border-red-400 [data-theme=dark]:hover:bg-red-500/20"
                } ${
                  isDragging
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-200 bg-zinc-50 [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-zinc-900/40"
                }`}
              >
                <div className={isDragging ? "opacity-0" : ""}>
                  <div className="relative z-10">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold text-white ${
                            tool.isLocked
                              ? "bg-zinc-300 cursor-not-allowed"
                              : "bg-red-500 cursor-move"
                          }`}
                          draggable={!tool.isLocked}
                          onDragStart={
                            tool.isLocked
                              ? undefined
                              : (event) => handleDragStart(event, tool.name)
                          }
                          onDragEnd={tool.isLocked ? undefined : handleDragEnd}
                          onDrag={tool.isLocked ? undefined : handleDrag}
                        >
                          {tool.isLocked ? (
                            <Image
                              src="/icons/lock-black.svg"
                              alt=""
                              width={14}
                              height={14}
                              className="h-3.5 w-3.5"
                            />
                          ) : (
                            initial
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-zinc-900">
                            {tool.name}
                            {isColorContrastChecker && !tool.isLocked && (
                              <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                New
                              </span>
                            )}
                            {tool.isLocked && (
                              <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 border border-green-200">
                                Coming soon
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>
                      {onPinTool && !tool.isLocked && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onPinTool(tool);
                          }}
                          aria-pressed={isPinned}
                          className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors transition-transform duration-200 ${
                            isPinned
                              ? "border-red-500 bg-red-500 text-white scale-105"
                              : "border-zinc-200 bg-white text-zinc-500 hover:border-red-200 hover:text-red-500"
                          }`}
                        >
                          <Image
                            src={isPinned ? "/icons/pin-alt.svg" : "/icons/pin.svg"}
                            alt=""
                            width={14}
                            height={14}
                            className={`pin-icon-light h-3.5 w-3.5 transition-transform duration-200 ${
                              isPinned ? "-rotate-12 scale-110" : "rotate-0 scale-100"
                            }`}
                          />
                          <Image
                            src="/icons/pin-alt.svg"
                            alt=""
                            width={14}
                            height={14}
                            className={`pin-icon-dark h-3.5 w-3.5 transition-transform duration-200 ${
                              isPinned ? "-rotate-12 scale-110" : "rotate-0 scale-100"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    {hasHref ? (
                      <PageTransitionLink
                        href={tool.href as string}
                        className="mt-1 flex-1 text-left text-xs leading-relaxed text-zinc-600"
                      >
                        {tool.description}
                      </PageTransitionLink>
                    ) : (
                      <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                        {tool.description}
                      </p>
                    )}
                  </div>
                  {isColorContrastChecker && (
                    <Image
                      src="/images/tools/color-contrast-checker.svg"
                      alt=""
                      width={260}
                      height={260}
                      className="pointer-events-none absolute right-[-28px] top-1/2 h-32 w-auto -translate-y-1/2 opacity-[0.135] z-0"
                    />
                  )}
                  {isGoogleFontExplorer && (
                    <Image
                      src="/images/tools/google-font-explorer.svg"
                      alt=""
                      width={260}
                      height={260}
                      className="pointer-events-none absolute right-[-28px] top-1/2 h-32 w-auto -translate-y-1/2 opacity-[0.162] z-0"
                    />
                  )}
                  {isRatioCalculator && (
                    <Image
                      src="/images/tools/ratio-calculator.svg"
                      alt=""
                      width={260}
                      height={260}
                      className="pointer-events-none absolute right-[-28px] top-1/2 h-32 w-auto -translate-y-1/2 opacity-[0.135] z-0"
                    />
                  )}
                  {isTypeScale && (
                    <Image
                      src="/images/tools/type-scale.svg"
                      alt=""
                      width={260}
                      height={260}
                      className="pointer-events-none absolute right-[-28px] top-1/2 h-[9.6rem] w-auto -translate-y-1/2 opacity-[0.135] z-0"
                    />
                  )}
                  {isUnitConverter && (
                    <Image
                      src="/images/tools/unitcontverter.svg"
                      alt=""
                      width={260}
                      height={260}
                      className="pointer-events-none absolute right-[-28px] top-1/2 h-32 w-auto -translate-y-1/2 opacity-[0.135] z-0"
                    />
                  )}
                  {isPlaceholderGenerator && (
                    <Image
                      src="/images/tools/placeholder-generator.svg"
                      alt=""
                      width={260}
                      height={260}
                      className="pointer-events-none absolute right-[-28px] top-1/2 h-32 w-auto -translate-y-1/2 opacity-[0.135] z-0"
                    />
                  )}
                  {isSvgWaveGenerator && (
                    <Image
                      src="/images/tools/svg-wave.svg"
                      alt=""
                      width={260}
                      height={260}
                      className="pointer-events-none absolute right-[-28px] top-1/2 h-32 w-auto -translate-y-1/2 opacity-[0.135] z-0"
                    />
                  )}
                </div>
              </div>
            );
          })}
          {dragToolName && dragPosition && draggedTool && (
            <div
              className="pointer-events-none fixed z-20 max-w-xs rounded-xl border border-red-200 bg-white p-4 shadow-xl ring-1 ring-red-200"
              style={{
                left: dragPosition.x + 8,
                top: dragPosition.y + 8,
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-xs font-semibold text-white">
                    {draggedTool.isLocked ? (
                      <Image
                        src="/icons/lock-black.svg"
                        alt=""
                        width={14}
                        height={14}
                        className="h-3.5 w-3.5"
                      />
                    ) : (
                      "UI"
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {draggedTool.name}
                      {draggedTool.isLocked && (
                        <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 border border-green-200">
                          Coming soon
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                {draggedTool.description}
              </p>
            </div>
          )}
      </div>
      </div>
    </section>
  );
}
