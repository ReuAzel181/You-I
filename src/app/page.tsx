import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ToolGrid } from "@/components/ToolGrid";
import { FeatureSections } from "@/components/FeatureSections";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Header />
      <main>
        <Hero />
        <ToolGrid />
        <FeatureSections />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
