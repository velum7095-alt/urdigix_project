import { memo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Zap,
  Infinity as InfinityIcon,
  Award,
  Users,
  Image as ImageIcon,
  Calendar,
  FileText,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Palette,
  Layers,
  Megaphone,
  Clock,
  ShieldCheck,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import posterShowcase from "@/assets/poster-showcase.png";

const WHATSAPP_URL =
  "https://wa.me/918142908550?text=Hi!%20I'm%20interested%20in%20your%20poster%20design%20packages.%20Please%20share%20pricing.";

const features = [
  { icon: ImageIcon, title: "Social Media Posters", desc: "Scroll-stopping creatives built for engagement" },
  { icon: Sparkles, title: "Unique & Creative", desc: "Every design tailored to your brand voice" },
  { icon: Award, title: "Premium Quality", desc: "Pixel-perfect, print & web-ready output" },
  { icon: Zap, title: "Fast Delivery", desc: "Quick turnaround without compromise" },
  { icon: InfinityIcon, title: "Unlimited Impact", desc: "Designs crafted to convert viewers" },
  { icon: Users, title: "100% Client Satisfaction", desc: "Loved by brands across India" },
];

const deliverables = [
  "High-resolution JPG & PNG files",
  "Source files (PSD / Figma) on request",
  "Optimized sizes for Instagram, Facebook, LinkedIn, X",
  "Story & Reel cover variants (9:16)",
  "Editable text layers for future updates",
  "Brand-consistent color & typography",
  "Up to 2 revision rounds per design",
  "Commercial usage rights included",
];

const packages = [
  {
    name: "Starter",
    tag: "For new brands",
    icon: FileText,
    posters: "8 posters / month",
    perks: [
      "2 design concepts",
      "Up to 2 revisions per poster",
      "Square + Story formats",
      "Delivery within 48 hrs",
      "WhatsApp support",
    ],
    cta: "Start with Starter",
  },
  {
    name: "Growth",
    tag: "Most popular",
    highlight: true,
    icon: Layers,
    posters: "16 posters / month",
    perks: [
      "3 design concepts",
      "Unlimited revisions",
      "All social formats included",
      "Festival & event posters",
      "Priority delivery (24 hrs)",
      "Dedicated designer",
    ],
    cta: "Choose Growth",
  },
  {
    name: "Scale",
    tag: "For active brands",
    icon: Megaphone,
    posters: "30 posters / month",
    perks: [
      "Custom concepts every week",
      "Unlimited revisions",
      "Carousel & motion posters",
      "Ad creatives included",
      "Same-day urgent delivery",
      "Brand strategy consult",
    ],
    cta: "Go Scale",
  },
];

const single = [
  { icon: Palette, title: "Single Poster", desc: "One premium custom design" },
  { icon: Megaphone, title: "Festival / Event Poster", desc: "Topical & timely creatives" },
  { icon: Layers, title: "Carousel (3–5 slides)", desc: "Story-driven Instagram set" },
];

const process = [
  { step: "01", title: "Share Your Brief", desc: "Tell us your brand, goal & message via WhatsApp or form." },
  { step: "02", title: "Concept & Design", desc: "Our designers craft a unique, on-brand poster." },
  { step: "03", title: "Review & Refine", desc: "Share feedback — we revise until you love it." },
  { step: "04", title: "Final Delivery", desc: "Get high-res files ready to post & grow." },
];

const faqs = [
  {
    q: "How fast will I receive my posters?",
    a: "Single posters are delivered within 48 hours. Monthly packages follow a content calendar with most designs ready in 24–48 hours.",
  },
  {
    q: "Do you provide source files?",
    a: "Yes — editable PSD or Figma files are available on request with every package.",
  },
  {
    q: "Can you match my existing brand style?",
    a: "Absolutely. Share your logo, colors, and brand guide — we'll align every poster to your identity.",
  },
  {
    q: "What if I need more posters than the package?",
    a: "You can top up additional posters anytime, or upgrade to a higher package.",
  },
];

const PosterDesignComponent = () => {
  const navigate = useNavigate();
  const goLead = () => navigate("/start-project?service=brand");

  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Premium Poster Design Services | URDIGIX";
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content") ?? "";
    meta?.setAttribute(
      "content",
      "Eye-catching social media poster design packages by URDIGIX. Monthly plans, single posters, fast delivery, and unlimited impact for growing brands.",
    );
    return () => {
      document.title = prevTitle;
      meta?.setAttribute("content", prevDesc);
    };
  }, []);
  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-40" />
        <div className="container relative z-10 px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">
                Poster Design Service
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold mt-4 mb-6 leading-tight">
                Powerful Posters.
                <span className="text-gradient block">Stronger Brands.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                We design eye-catching social media posters that grab attention, build trust, and turn scrollers into
                customers. Built for businesses serious about growth.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="hero" className="gap-2">
                    <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                  </Button>
                </a>
                <Button size="lg" variant="outline" onClick={goLead} className="gap-2">
                  Get a Custom Quote <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 mt-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> 24–48 hr delivery</span>
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> 100% original</span>
                <span className="flex items-center gap-2"><Repeat className="w-4 h-4 text-primary" /> Unlimited revisions</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
              <img
                src={posterShowcase}
                alt="Premium poster design samples by URDIGIX"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-16 border-t border-border/40">
        <div className="container px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Why brands choose URDIGIX</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Designs that don't just look good — they perform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="glass-card p-6 hover:border-primary/40 transition-all">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MONTHLY PACKAGES */}
      <section className="py-20 relative">
        <div className="container px-6">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Monthly Packages</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 mb-3">
              Consistent designs. Continuous growth.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pick a plan that fits your brand's posting rhythm. All packages include strategy, design, and revisions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`glass-card p-7 relative flex flex-col ${
                  pkg.highlight ? "border-primary/60 shadow-xl shadow-primary/10" : ""
                }`}
              >
                {pkg.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {pkg.tag}
                  </span>
                )}
                <pkg.icon className="w-9 h-9 text-primary mb-3" />
                <h3 className="text-xl font-display font-bold">{pkg.name}</h3>
                {!pkg.highlight && <p className="text-xs text-muted-foreground mb-1">{pkg.tag}</p>}
                <p className="text-2xl font-display font-bold text-primary mt-3">{pkg.posters}</p>
                <ul className="space-y-2 mt-5 mb-6 flex-1">
                  {pkg.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Button onClick={goLead} variant={pkg.highlight ? "default" : "outline"} className="w-full">
                  {pkg.cta}
                </Button>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            All packages: <span className="text-foreground font-semibold">Contact for pricing</span> — tailored to your
            scale.
          </p>
        </div>
      </section>

      {/* SINGLE POSTER OPTIONS */}
      <section className="py-16 border-t border-border/40">
        <div className="container px-6">
          <div className="text-center mb-10">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">One-time Designs</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-3">Single Poster Options</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {single.map((s) => (
              <div key={s.title} className="glass-card p-6 text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{s.desc}</p>
                <Button onClick={goLead} variant="outline" size="sm" className="w-full">
                  Request Quote
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className="py-20">
        <div className="container px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">What You Get</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 mb-5">
                Every package, fully loaded
              </h2>
              <p className="text-muted-foreground mb-6">
                We don't just hand over a JPG. You get a full design kit — ready to post, ready to print, ready to scale.
              </p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="hero" className="gap-2">
                  <MessageCircle className="w-4 h-4" /> Discuss Your Brand
                </Button>
              </a>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {deliverables.map((d) => (
                <div key={d} className="flex items-start gap-3 glass-card p-4">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-16 border-t border-border/40">
        <div className="container px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground">From brief to brilliant — in 4 simple steps.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((p) => (
              <div key={p.step} className="glass-card p-6">
                <div className="w-10 h-10 rounded-lg bg-foreground text-background font-bold flex items-center justify-center mb-4">
                  {p.step}
                </div>
                <h3 className="font-display font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="glass-card p-5 group cursor-pointer [&[open]>summary>svg]:rotate-180"
              >
                <summary className="flex items-center justify-between font-display font-semibold list-none">
                  {f.q}
                  <ArrowRight className="w-4 h-4 transition-transform rotate-90" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20">
        <div className="container px-6">
          <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
                Let's design your success story
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                DM us today on WhatsApp or send your brief — we'll get back within an hour.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="hero" className="gap-2">
                    <MessageCircle className="w-5 h-5" /> WhatsApp Us Now
                  </Button>
                </a>
                <Button size="lg" variant="outline" onClick={goLead} className="gap-2">
                  Send a Brief <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                Prefer browsing first?{" "}
                <Link to="/" className="text-primary hover:underline">
                  See all our services
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

PosterDesignComponent.displayName = "PosterDesign";
export default memo(PosterDesignComponent);
