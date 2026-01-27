import { Suspense, memo } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import {
  LazySection,
  LazyServicesSection,
  LazyProcessSection,
  LazyTestimonialsSection,
  LazyAboutSection,
  LazyContactSection,
  LazyFooter,
} from "@/components/LazySection";

/**
 * PERFORMANCE OPTIMIZATIONS:
 * 1. HeroSection and Navbar load immediately (above-the-fold, critical for FCP/LCP)
 * 2. All other sections are lazy-loaded (code-splitting)
 * 3. Suspense boundaries prevent blocking during chunk loads
 * 4. Memoized to prevent unnecessary re-renders
 */

const Index = memo(() => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Critical path - loads immediately */}
      <Navbar />
      <HeroSection />
      
      {/* Below-the-fold sections - lazy loaded for faster initial paint */}
      <Suspense fallback={null}>
        <LazySection component={LazyServicesSection} />
        <LazySection component={LazyProcessSection} />
        <LazySection component={LazyTestimonialsSection} />
        <LazySection component={LazyAboutSection} />
        <LazySection component={LazyContactSection} />
        <LazySection component={LazyFooter} />
      </Suspense>
    </main>
  );
});

Index.displayName = "Index";

export default Index;
