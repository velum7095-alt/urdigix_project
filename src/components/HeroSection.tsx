import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// PERFORMANCE: Import WebP for optimal compression, eager load for LCP
import heroBg from "@/assets/hero-bg-light.webp";

const clientLogos = [
  "TechCorp",
  "StartupX", 
  "GrowthLabs",
  "MediaPro",
  "BrandFlow",
];

/**
 * PERFORMANCE: Hero Section Component - Critical for LCP
 * - Memoized to prevent unnecessary re-renders
 * - Hero image uses eager loading with high fetch priority
 * - Explicit width/height prevent CLS
 * - WebP format for optimal compression
 */
const HeroSectionComponent = () => {
  const navigate = useNavigate();
  
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
      aria-label="Hero section"
    >
      {/* 
        PERFORMANCE: LCP Element - Hero Background Image
        - loading="eager" ensures immediate loading (above-the-fold)
        - fetchPriority="high" prioritizes this as critical resource
        - decoding="async" prevents blocking main thread
        - Explicit width/height prevent layout shift
        - opacity-70 instead of 60 for better clarity
      */}
      <img
        src={heroBg}
        alt="Digital marketing abstract background with gradient colors representing innovation and technology"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        style={{ 
          willChange: 'auto',
          imageRendering: 'auto',
          transform: 'translateZ(0)'
        }}
        aria-hidden="true"
      />
      
      {/* Overlay Gradient - CSS only, no performance impact */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-background/30 via-transparent to-background" />
      
      {/* Animated Gradient Orb - CSS only */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial opacity-40 pointer-events-none" />

      <div className="container relative z-10 px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge - PERFORMANCE: Reduced animation complexity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Digital Marketing Excellence</span>
          </motion.div>

          {/* 
            Main Headline - PERFORMANCE: Critical for FCP
            Reduced animation delay for faster perceived load
          */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6"
          >
            Elevate Your Brand With
            <span className="block text-gradient">Digital Mastery</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            From stunning websites to viral social campaigns, we transform businesses 
            into digital powerhouses. Meta Ads, SEO, Video Production — all under one roof.
          </motion.p>

          {/* CTA Buttons - PERFORMANCE: Reduced delay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button 
              variant="hero" 
              size="xl" 
              className="group"
              onClick={() => navigate("/start-project")}
            >
              Start Your Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="heroOutline" 
              size="xl"
              onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Our Work
            </Button>
          </motion.div>

          {/* Client Logos - PERFORMANCE: Simplified animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">Trusted by industry leaders</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {clientLogos.map((logo) => (
                <div
                  key={logo}
                  className="text-muted-foreground/50 font-display font-semibold text-lg hover:text-primary transition-colors cursor-pointer"
                >
                  {logo}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator - PERFORMANCE: Delay until content visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

HeroSectionComponent.displayName = "HeroSection";

// PERFORMANCE: Export memoized component to prevent unnecessary re-renders
export const HeroSection = memo(HeroSectionComponent);
