const personas = [
  {
    title: "For designers",
    description:
      "Audit palettes, experiment with themes, and keep accessibility in view while you explore.",
    items: [
      "Live preview on sample UI blocks",
      "WCAG-aware color suggestions",
      "Export to your design system",
    ],
  },
  {
    title: "For developers",
    description:
      "Turn color specs into tokens you can ship, with ratios and states already verified.",
    items: [
      "Token-friendly color outputs",
      "Quick AA / AAA status checks",
      "Ready for handoff notes",
    ],
  },
  {
    title: "For teams",
    description:
      "Create a shared source of truth for colors so every screen feels consistent.",
    items: [
      "Centralized palette overview",
      "Accessible defaults for new projects",
      "Clear review checklists",
    ],
  },
];

export function FeatureSections() {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
            Built for everyday workflows
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Whether you sketch in Figma or ship React components, YOU-I keeps
            accessibility close without slowing you down.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {personas.map((persona) => (
            <article
              key={persona.title}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left"
            >
              <h3 className="mb-1 text-sm font-semibold text-zinc-900">
                {persona.title}
              </h3>
              <p className="mb-4 text-xs leading-relaxed text-zinc-600">
                {persona.description}
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-700">
                {persona.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

