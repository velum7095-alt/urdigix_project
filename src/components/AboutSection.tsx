import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Award, Users, Zap, Shield } from "lucide-react";

const highlights = [{
  icon: Award,
  title: "Award-Winning Work",
  description: "Recognized for excellence in digital marketing and creative execution."
}, {
  icon: Users,
  title: "Expert Team",
  description: "Specialists across SEO, paid media, content, and development."
}, {
  icon: Zap,
  title: "Fast Turnaround",
  description: "Agile processes that deliver quality results quickly."
}, {
  icon: Shield,
  title: "Transparent Reporting",
  description: "Clear metrics and honest communication at every step."
}];

// PERFORMANCE: forwardRef to prevent React warnings with lazy loading
export const AboutSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} id="about" className="py-24 bg-gradient-to-b from-background to-secondary/50">
      <div className="container px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">About URDIGIX</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">
              Your Partner in
              <span className="text-gradient block">Digital Growth</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Founded with a passion for digital excellence, URDIGIX is a full-service digital 
              marketing agency dedicated to helping businesses thrive in the digital age. We 
              combine creativity with data-driven strategies to deliver measurable results.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Our team of experts brings together years of experience across social media, 
              paid advertising, web development, and content creation. We don't just execute 
              campaigns — we build lasting partnerships focused on your success.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="glass-card p-8 md:p-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="glass-card p-6 text-center">
                  <p className="text-4xl md:text-5xl font-display font-bold text-gradient">2+</p>
                  <p className="text-sm text-muted-foreground mt-2">Years Experience</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <p className="text-4xl md:text-5xl font-display font-bold text-gradient">24/7</p>
                  <p className="text-sm text-muted-foreground mt-2">Support Available</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <p className="text-4xl md:text-5xl font-display font-bold text-gradient">5+</p>
                  <p className="text-sm text-muted-foreground mt-2">Team Members</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <p className="text-4xl md:text-5xl font-display font-bold text-gradient">∞</p>
                  <p className="text-sm text-muted-foreground mt-2">Creative Ideas</p>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = "AboutSection";