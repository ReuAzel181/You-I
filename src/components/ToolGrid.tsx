import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { PageTransitionLink } from "@/components/PageTransitionLink";

export type Tool = {
  name: string;
  description: string;
  href?: string;
  isLocked?: boolean;
};

export const tools: Tool[] = [
  {
    name: "Color contrast checker",
    description: "Quickly validate WCAG ratios for any text and background pair.",
    href: "/tools/color-contrast-checker",
  },
  {
    name: "Ratio calculator",
    description: "See pass/fail states for AA and AAA across font sizes.",
    href: "/tools/ratio-calculator",
  },
  {
    name: "EM to percent converter",
    description: "Convert px, rem, em, and percentage values with a custom base size.",
    href: "/tools/em-to-percent-converter",
  },
  {
    name: "Google font explorer",
    description: "Browse Google Fonts with live previews focused on English text.",
    href: "/tools/google-font-explorer",
  },
  {
    name: "Placeholder Generator",
    description: "Create lorem ipsum placeholders with adjustable length and casing.",
    href: "/tools/lorem-placeholder-generator",
  },
  {
    name: "Type scale",
    description: "Generate a typography scale from a base size and ratio.",
    href: "/tools/type-scale",
  },
  {
    name: "SVG wave generator",
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
  const [orderedTools, setOrderedTools] = useState(tools);
  const [dragToolName, setDragToolName] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [separatorPosition, setSeparatorPosition] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    isAfter: boolean;
    showHorizontal: boolean;
    showVertical: boolean;
    isVerticalAfter: boolean;
  } | null>(null);
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
    const proximityY = rect.height * 0.25;
    const proximityX = rect.width * 0.25;

    let isAfter = false;
    let showHorizontal = false;

    if (offsetY < proximityY) {
      isAfter = false;
      showHorizontal = true;
    } else if (rect.height - offsetY < proximityY) {
      isAfter = true;
      showHorizontal = true;
    }

    let showVertical = false;
    let isVerticalAfter = false;

    if (offsetX < proximityX) {
      showVertical = true;
      isVerticalAfter = false;
    } else if (rect.width - offsetX < proximityX) {
      showVertical = true;
      isVerticalAfter = true;
    }

    if (!showHorizontal && !showVertical) {
      setSeparatorPosition(null);
      return;
    }

    const dragged = orderedTools.find((tool) => tool.name === dragToolName);

    if (!dragged) {
      return;
    }

    const withoutDragged = orderedTools.filter((tool) => tool.name !== dragToolName);

    const layoutItems: {
      type: "card" | "ghost";
      tool?: Tool;
      centerX: number;
      centerY: number;
    }[] = [];

    withoutDragged.forEach((tool) => {
      const element = cardRefs.current[tool.name];
      if (!element) {
        return;
      }
      const cardRect = element.getBoundingClientRect();
      layoutItems.push({
        type: "card",
        tool,
        centerX: cardRect.left + cardRect.width / 2,
        centerY: cardRect.top + cardRect.height / 2,
      });
    });

    layoutItems.push({
      type: "ghost",
      centerX: event.clientX,
      centerY: event.clientY,
    });

    layoutItems.sort((a, b) => {
      if (a.centerY === b.centerY) {
        return a.centerX - b.centerX;
      }
      return a.centerY - b.centerY;
    });

    const next: Tool[] = [];

    layoutItems.forEach((item) => {
      if (item.type === "ghost") {
        next.push(dragged);
      } else if (item.tool) {
        next.push(item.tool);
      }
    });

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

    setSeparatorPosition({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      isAfter,
      showHorizontal,
      showVertical,
      isVerticalAfter,
    });
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    setDragToolName(null);
    setDragPosition(null);
    setSeparatorPosition(null);
  }

  function handleDragEnd() {
    setDragToolName(null);
    setDragPosition(null);
    setSeparatorPosition(null);
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
          <p className="text-xs text-zinc-500">More tools are coming soon as the platform grows.</p>
        </div>
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orderedTools.map((tool) => {
            const isPinned = pinnedToolNames?.includes(tool.name) ?? false;
            const hasHref = Boolean(tool.href) && !tool.isLocked;
            const isDragging = dragToolName === tool.name;
            return (
              <div
                key={tool.name}
                ref={(element) => {
                  cardRefs.current[tool.name] = element;
                }}
                onDragOver={(event) => handleDragOver(event, tool.name)}
                onDrop={(event) => handleDrop(event)}
                className={`flex flex-col rounded-xl border p-4 transition-colors transition-shadow hover:border-red-200 hover:bg-red-50 hover:shadow-sm [data-theme=dark]:hover:border-red-400 [data-theme=dark]:hover:bg-red-500/20 ${
                  isDragging
                    ? "border-red-300 bg-red-50"
                    : "border-zinc-200 bg-zinc-50 [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-zinc-900/40"
                }`}
              >
                <div className={isDragging ? "opacity-0" : ""}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-xs font-semibold text-white cursor-move"
                        draggable
                        onDragStart={(event) => handleDragStart(event, tool.name)}
                        onDragEnd={handleDragEnd}
                        onDrag={handleDrag}
                      >
                        {tool.isLocked ? (
                          <Image
                            src="/icons/lock.svg"
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
                          {tool.name}
                          {tool.isLocked && (
                            <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
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
              </div>
            );
          })}
          {separatorPosition && (
            <>
              {separatorPosition.showHorizontal && (
                <div
                  className="pointer-events-none fixed z-10 h-0.5 rounded-full bg-gradient-to-r from-red-100 via-red-300 to-red-100 opacity-80"
                  style={{
                    left: separatorPosition.left,
                    top:
                      separatorPosition.isAfter
                        ? separatorPosition.top + separatorPosition.height + 6
                        : separatorPosition.top - 6,
                    width: separatorPosition.width,
                  }}
                />
              )}
              {separatorPosition.showVertical && (
                <div
                  className="pointer-events-none fixed z-10 w-0.5 rounded-full bg-gradient-to-b from-red-100 via-red-300 to-red-100 opacity-80"
                  style={{
                    left: separatorPosition.isVerticalAfter
                      ? separatorPosition.left + separatorPosition.width + 6
                      : separatorPosition.left - 6,
                    top:
                      separatorPosition.top +
                      separatorPosition.height / 2 -
                      separatorPosition.height / 4,
                    height: separatorPosition.height / 2,
                  }}
                />
              )}
            </>
          )}
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
                        src="/icons/lock.svg"
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
                        <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
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
