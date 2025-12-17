import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RatioCalculator } from "@/components/RatioCalculator";

export default function RatioCalculatorPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Header />
      <main>
        <section>
          <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-8">
            <div className="hero-intro space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Tool
              </div>
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                Ratio calculator
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                Calculate matching dimensions for any aspect ratio. Pick presets like 16:9, 1:1,
                4:5, or 9:16, or set your own, enter either width or height, and get the other
                value instantly.
              </p>
            </div>
          </div>
        </section>
        <section className="bg-zinc-50">
          <div className="mx-auto max-w-6xl px-4 pb-12 md:px-8">
            <RatioCalculator variant="full" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
