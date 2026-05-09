import { memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Infinity as InfinityIcon, Award, Users, Image as ImageIcon, Calendar, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import posterShowcase from "@/assets/poster-showcase.png";

const features = [
  { icon: ImageIcon, title: "Social Media Posters", desc: "Scroll-stopping creatives" },
  { icon: Sparkles, title: "Unique & Creative", desc: "Tailored to your brand" },
  { icon: Award, title: "Premium Quality", desc: "Pixel-perfect design" },
  { icon: Zap, title: "Fast Delivery", desc: "Quick turnaround" },
  { icon: InfinityIcon, title: "Unlimited Impact", desc: "Designs that convert" },
  { icon: Users, title: "100% Client Satisfaction", desc: "Loved by brands" },
];

const PosterDesignSectionComponent = () => {
  const navigate = useNavigate();
  const whatsappUrl = "https://wa.me/918142908550?text=Hi!%20I'm%20interested%20in%20your%20poster%20design%20service.";

  return (
    <section id="poster-design" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial opacity-40" />

      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Featured Service</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">
            Powerful Designs.
            <span className="text-gradient block">Strong Brands. Real Growth.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We create eye-catching social media posters that attract attention, build trust, and convert viewers into customers.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
            <img
              src={posterShowcase}
              alt="Premium social media poster design samples by URDIGIX"
              loading="lazy"
              className="relative rounded-2xl shadow-2xl w-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((f) => (
              <div key={f.title} className="glass-card p-5 hover:border-primary/40 transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Pricing options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12"
        >
          <div className="glass-card p-8 text-center">
            <Calendar className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold mb-2">Monthly Packages</h3>
            <p className="text-muted-foreground mb-6">Consistent designs. Continuous growth.</p>
            <Button onClick={() => navigate("/start-project?service=brand")} className="w-full">
              Contact for Pricing
            </Button>
          </div>
          <div className="glass-card p-8 text-center">
            <FileText className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold mb-2">Single Poster</h3>
            <p className="text-muted-foreground mb-6">One design. Maximum impact.</p>
            <Button onClick={() => navigate("/start-project?service=brand")} variant="outline" className="w-full">
              Contact for Pricing
            </Button>
          </div>
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 md:p-8 max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="text-center md:text-left">
            <h3 className="text-xl font-display font-bold mb-1">Let's design your success story!</h3>
            <p className="text-sm text-muted-foreground">DM us today &amp; let's grow together.</p>
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2">
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

PosterDesignSectionComponent.displayName = "PosterDesignSection";
export const PosterDesignSection = memo(PosterDesignSectionComponent);
