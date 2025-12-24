import Image from "next/image";
import { useState } from "react";
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
  const [dropTargetName, setDropTargetName] = useState<string | null>(null);

  function handleDragStart(toolName: string) {
    setDragToolName(toolName);
    setDropTargetName(toolName);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>, targetName: string) {
    event.preventDefault();

    if (!dragToolName || dragToolName === targetName) {
      return;
    }

    setDropTargetName(targetName);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>, targetName: string) {
    event.preventDefault();

    if (!dragToolName || dragToolName === targetName) {
      setDragToolName(null);
      setDropTargetName(null);
      return;
    }

    setOrderedTools((current) => {
      const fromIndex = current.findIndex((tool) => tool.name === dragToolName);
      const toIndex = current.findIndex((tool) => tool.name === targetName);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    setDragToolName(null);
    setDropTargetName(null);
  }

  function handleDragEnd() {
    setDragToolName(null);
    setDropTargetName(null);
  }

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orderedTools.map((tool) => {
            const isPinned = pinnedToolNames?.includes(tool.name) ?? false;
            const hasHref = Boolean(tool.href) && !tool.isLocked;
            const isDragging = dragToolName === tool.name;
            const isDropTarget =
              dropTargetName === tool.name && dragToolName !== null && dragToolName !== tool.name;

            return (
                <div
                  key={tool.name}
                  draggable
                  onDragStart={() => handleDragStart(tool.name)}
                  onDragOver={(event) => handleDragOver(event, tool.name)}
                  onDrop={(event) => handleDrop(event, tool.name)}
                  onDragEnd={handleDragEnd}
                  className={`flex flex-col rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-transform transition-colors transition-shadow hover:-translate-y-1 hover:border-red-200 hover:bg-red-50 hover:shadow-sm cursor-move [data-theme=dark]:border-zinc-700 [data-theme=dark]:bg-zinc-900/40 [data-theme=dark]:hover:border-red-400 [data-theme=dark]:hover:bg-red-500/20 ${
                    isDragging ? "z-10 scale-[1.03] shadow-lg ring-1 ring-red-200" : ""
                  }`}
                >
                {isDropTarget && (
                  <div className="mb-2 h-0.5 w-full rounded-full bg-gradient-to-r from-red-200 via-red-400 to-red-200 opacity-80 animate-pulse" />
                )}
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-xs font-semibold text-white">
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
