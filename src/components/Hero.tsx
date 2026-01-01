import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-200 bg-[radial-gradient(circle_at_top,_var(--primary-100)_0,_transparent_55%),linear-gradient(to_bottom,_#ffffff,_#f4f4f5)]">
      <div className="hero-liquid-bg">
        <div className="hero-liquid-blob" />
        <div className="hero-liquid-blob hero-liquid-blob-secondary" />
      </div>
      <div className="relative min-h-screen mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-6 pb-16 md:flex-row md:items-center md:gap-16 md:px-8">
        <div className="hero-intro flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            New: Color Contrast Checker and Ratio Calculator
          </div>
          <h1 className="text-balance leading-[1.1] text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            Every tool you need to design accessible interfaces in one place.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Zanari brings color contrast checking, Ratio Calculators, and palette
            helpers together so you can design interfaces that look great and
            stay accessible.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/tools/color-contrast-checker"
              className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-red-600"
            >
              Start checking colors
            </Link>
            <Link
              href="#tools"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition-transform hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50"
            >
              Explore all tools
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Color-safe palettes
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Ratio and layout helpers
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Built-in accessibility guardrails
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            No account required for basic tools. Optimized for designers and
            developers.
          </p>
        </div>
        <div className="flex-1">
          <div className="hero-preview rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-100">
                  Live contrast
                </span>
                <span className="hidden rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 sm:inline-flex">
                  Draft workspace
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500">
                    Text color
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded border border-zinc-200 bg-zinc-900" />
                    <span className="text-xs text-zinc-700">
                      #111827 · 17, 24, 39
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500">
                    Background
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded border border-zinc-200 bg-white" />
                    <span className="text-xs text-zinc-700">
                      #FFFFFF · 255, 255, 255
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-gradient-to-r from-emerald-50 to-emerald-100 px-4 py-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-emerald-700">
                    Contrast ratio
                  </p>
                  <p className="text-lg font-semibold text-emerald-900">
                    12.8 : 1
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs font-medium text-emerald-800">
                  <span className="aa-badge rounded-full px-2 py-0.5">
                    AA normal
                  </span>
                  <span className="aa-badge rounded-full px-2 py-0.5">
                    AAA large
                  </span>
                </div>
              </div>
              <div className="space-y-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 upcoming-tools-card">
                <p className="text-xs font-medium text-zinc-700">
                  Upcoming tools
                </p>
                <ul className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
                  <li className="rounded-lg bg-white px-2.5 py-2">
                    Palette generator
                  </li>
                  <li className="rounded-lg bg-white px-2.5 py-2">
                    Brand contrast audit
                  </li>
                  <li className="rounded-lg bg-white px-2.5 py-2">
                    Placeholder Generator
                  </li>
                  <li className="rounded-lg bg-white px-2.5 py-2">
                    Live preview overlays
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-4 py-3 text-[11px]">
                <div className="space-y-0.5">
                  <p className="font-medium text-zinc-800">Pinned tools sidebar</p>
                  <p className="text-[10px] text-zinc-500">
                    Keep your most used checks docked while you move between files.
                  </p>
                </div>
                <div className="inline-flex flex-col items-end gap-1 text-[10px] text-zinc-600">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                    Local only
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

