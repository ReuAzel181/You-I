import Link from "next/link";

const columns = [
  {
    title: "Tools",
    links: [
      { label: "Color Contrast Checker", href: "/tools/color-contrast-checker" },
      { label: "Ratio Calculator", href: "/tools/ratio-calculator" },
      { label: "Unit Converter", href: "/tools/em-to-percent-converter" },
      { label: "Google Font Explorer", href: "/tools/google-font-explorer" },
      { label: "Type Scale", href: "/tools/type-scale" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/" },
      { label: "Workspace", href: "/pinned-tools" },
      { label: "Settings", href: "/settings" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "WCAG contrast basics", href: "/learn#contrast-basics" },
      { label: "Design handoff tips", href: "/learn#design-handoff" },
      { label: "Release notes", href: "/learn#release-notes" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="mb-8 grid gap-8 md:grid-cols-[1.6fr,2fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-sm font-semibold text-white">
                UI
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-900">
                YOU-I
              </span>
            </div>
            <p className="max-w-sm text-xs text-zinc-600">
              YOU-I is a focused toolkit for checking color contrast, exploring ratios, and trying
              fonts in real interface contexts. Pin the tools you use most and they will follow you
              each time you return.
            </p>
          </div>
          <div className="grid gap-6 text-sm text-zinc-600 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {column.title}
                </p>
                <ul className="space-y-2 text-xs">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-red-500"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="hidden items-start justify-end gap-2 text-[10px] text-zinc-500 md:flex">
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-medium">
              v0.1 · Early access
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} YOU-I. Built for accessible interface work.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              No ads · no tracking walls
            </span>
            <button className="text-xs text-zinc-500 transition-colors hover:text-red-500">
              Terms
            </button>
            <button className="text-xs text-zinc-500 transition-colors hover:text-red-500">
              Privacy
            </button>
            <button className="text-xs text-zinc-500 transition-colors hover:text-red-500">
              Accessibility
            </button>
            <span className="hidden text-[11px] text-zinc-400 sm:inline">
              Preferences, analytics, and pinned tools stay in your browser.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
