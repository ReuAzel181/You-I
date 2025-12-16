const tools = [
  {
    name: "Color contrast checker",
    description: "Quickly validate WCAG ratios for any text and background pair.",
  },
  {
    name: "Ratio calculator",
    description: "See pass/fail states for AA and AAA across font sizes.",
  },
  {
    name: "Palette comparisons",
    description: "Compare multiple brand colors against shared backgrounds.",
  },
  {
    name: "Theme explorer",
    description: "Preview light and dark themes with real interface samples.",
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

export function ToolGrid() {
  return (
    <section className="border-b border-zinc-200 bg-white">
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
          <p className="text-xs text-zinc-500">
            More tools are coming soon as the platform grows.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-red-200 hover:bg-red-50"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-xs font-semibold text-white">
                  UI
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  {tool.name}
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-zinc-600">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

