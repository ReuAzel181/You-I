import Image from "next/image";

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
        <div className="mb-8 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
              Built around your daily interface work
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              From quick checks on a color pair to exploring whole font families, YOU-I keeps the
              most useful tools one pin away.
            </p>
          </div>
          <div className="mx-auto max-w-5xl rounded-2xl border border-zinc-200 bg-white/90 px-5 py-4 text-left shadow-sm ring-1 ring-zinc-900/5 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  NO ADS · NO LOGIN
                </p>
                <p className="text-[13px] font-semibold leading-snug text-zinc-900 sm:text-sm">
                  Looking for a place to run quick checks without banners or paywalls in the way?
                </p>
                <p className="text-[11px] leading-relaxed text-zinc-600">
                  YOU-I keeps contrast, ratio, and type tools open in a clean surface so you can
                  focus on interface decisions—not dismissing prompts.
                </p>
              </div>
              <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
                <div className="flex flex-col gap-2 text-[9px] text-zinc-700">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    No banners
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    No tracking walls
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Tools first, every time
                  </div>
                </div>
                <Image
                  src="/images/no-ads.png"
                  alt="No ads badge"
                  width={96}
                  height={96}
                  className="no-ads-slide hidden h-24 w-24 object-contain sm:block"
                />
              </div>
            </div>
          </div>
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
