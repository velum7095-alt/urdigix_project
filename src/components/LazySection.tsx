import { Suspense, lazy, memo } from "react";

/**
 * PERFORMANCE: Lazy loading wrapper for below-the-fold sections
 * Reduces initial bundle size and improves FCP/LCP
 */

// Loading skeleton for sections while they load
export const SectionSkeleton = memo(() => (
  <div className="py-24 px-6">
    <div className="container mx-auto">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mx-auto mb-4" />
        <div className="h-12 bg-muted rounded w-1/2 mx-auto mb-8" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
));

SectionSkeleton.displayName = "SectionSkeleton";

// PERFORMANCE: Lazy-loaded section exports
export const LazyServicesSection = lazy(() => 
  import("@/components/ServicesSection").then(m => ({ default: m.ServicesSection }))
);

export const LazyProcessSection = lazy(() => 
  import("@/components/ProcessSection").then(m => ({ default: m.ProcessSection }))
);

export const LazyTestimonialsSection = lazy(() => 
  import("@/components/TestimonialsSection").then(m => ({ default: m.TestimonialsSection }))
);

export const LazyAboutSection = lazy(() => 
  import("@/components/AboutSection").then(m => ({ default: m.AboutSection }))
);

export const LazyContactSection = lazy(() => 
  import("@/components/ContactSection").then(m => ({ default: m.ContactSection }))
);

export const LazyFooter = lazy(() => 
  import("@/components/Footer").then(m => ({ default: m.Footer }))
);
