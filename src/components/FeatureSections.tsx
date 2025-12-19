const personas = [
  {
    title: "Designers",
    description:
      "Experiment with palettes while contrast, ratios, and real UI previews stay visible the whole time.",
    items: [
      "Hero previews with AA / AAA status at a glance",
      "Color contrast checker embedded on the homepage",
      "Pinned tools so your favorite checks are always open",
    ],
  },
  {
    title: "Developers",
    description:
      "Turn color specs into shippable code with predictable ratios, sizes, and states already verified.",
    items: [
      "Ratio calculator for viewports and component dimensions",
      "EM ↔ percent converter for responsive typography",
      "Copy-ready values for hex, RGB, and HSL tokens",
    ],
  },
  {
    title: "Teams",
    description:
      "Keep everyone using the same, accessible defaults across projects and devices.",
    items: [
      "Appearance settings that travel with each browser",
      "Local-only settings and analytics toggles in one place",
      "Upcoming tools roadmap focused on color-first workflows",
    ],
  },
];

export function FeatureSections() {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
            Built around your daily interface work
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            From quick checks on a color pair to exploring whole font families, YOU-I keeps the most
            useful tools one pin away.
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
