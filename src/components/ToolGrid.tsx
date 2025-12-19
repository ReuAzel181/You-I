import Image from "next/image";
import { useRouter } from "next/navigation";

export type Tool = {
  name: string;
  description: string;
  href?: string;
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
    name: "Accessible gradients",
    description: "Design gradients that stay readable across sections.",
  },
  {
    name: "Export presets",
    description: "Share color tokens with designers and developers in one click.",
  },
];

type ToolGridProps = {
  pinnedToolNames?: string[] | null;
  onPinTool?: (tool: Tool) => void;
};

export function ToolGrid({ pinnedToolNames, onPinTool }: ToolGridProps) {
  const router = useRouter();

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
          {tools.map((tool) => {
            const isPinned = pinnedToolNames?.includes(tool.name) ?? false;
            const hasHref = Boolean(tool.href);

            const handleCardClick = () => {
              if (hasHref) {
                router.push(tool.href as string);
              }
            };

            return (
              <div
                key={tool.name}
                onClick={handleCardClick}
                className="flex flex-col rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-transform transition-colors hover:-translate-y-1 hover:border-red-200 hover:bg-red-50 hover:shadow-sm cursor-pointer"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-xs font-semibold text-white">
                      UI
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-zinc-900">{tool.name}</h3>
                    </div>
                  </div>
                  {onPinTool && (
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
                        src="/icons/pin-alt.svg"
                        alt=""
                        width={14}
                        height={14}
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isPinned ? "-rotate-12 scale-110" : "rotate-0 scale-100"
                        }`}
                      />
                    </button>
                  )}
                </div>
                {hasHref ? (
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-zinc-600">
                    {tool.description}
                  </p>
                ) : (
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">{tool.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
