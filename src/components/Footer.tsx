import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: ["Overview", "Color tools", "Upcoming features"],
  },
  {
    title: "Resources",
    links: ["Guides", "Accessibility basics", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Support", "Contact"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="mb-8 grid gap-8 md:grid-cols-[1.5fr,2fr]">
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
              YOU-I is a small toolkit focused on color contrast checking and
              accessible interface design. More tools are on the way.
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
                    <li key={link}>
                      <Link
                        href="#"
                        className="transition-colors hover:text-red-500"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} YOU-I. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <button className="text-xs text-zinc-500 transition-colors hover:text-red-500">
              Terms
            </button>
            <button className="text-xs text-zinc-500 transition-colors hover:text-red-500">
              Privacy
            </button>
            <button className="text-xs text-zinc-500 transition-colors hover:text-red-500">
              Accessibility
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

