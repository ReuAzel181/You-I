"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoogleFontExplorer } from "@/components/GoogleFontExplorer";

export default function GoogleFontExplorerPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <section>
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-8">
            <div className="flex items-start justify-between gap-4">
              <div className="hero-intro space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Tool
                </div>
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                  Google Font Explorer
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                  Browse Google Fonts with live previews that focus on regular weights and English
                  text.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    router.back();
                  } else {
                    router.push("/");
                  }
                }}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-red-300 px-3 text-[11px] font-medium text-red-400 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Back to main page"
              >
                <Image
                  src="/icons/chevron.svg"
                  alt=""
                  width={10}
                  height={10}
                  className="h-3 w-3"
                />
                <span>Back</span>
              </button>
            </div>
          </div>
        </section>
        <section className="bg-[var(--background)]">
          <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8">
            <GoogleFontExplorer variant="full" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
