import Link from "next/link";

const columns = [
  {
    title: "Tools",
    links: [
      { label: "Color contrast checker", href: "/tools/color-contrast-checker" },
      { label: "Ratio calculator", href: "/tools/ratio-calculator" },
      { label: "EM to percent converter", href: "/tools/em-to-percent-converter" },
      { label: "Google font explorer", href: "/tools/google-font-explorer" },
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
      { label: "WCAG contrast basics", href: "#" },
      { label: "Design handoff tips", href: "#" },
      { label: "Release notes", href: "#" },
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
        </div>
        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} YOU-I. Built for accessible interface work.</p>
          <div className="flex flex-wrap items-center gap-4">
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
