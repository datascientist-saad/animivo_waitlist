import { FoundingBenefits } from "@/components/founding-benefits";
import { HeroSection } from "@/components/hero-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ValueSection } from "@/components/value-section";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <ValueSection />
        <FoundingBenefits />
      </main>
      <SiteFooter />
    </div>
  );
}
