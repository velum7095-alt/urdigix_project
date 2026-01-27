import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Search, Lightbulb, Rocket, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Discovery",
    description: "We dive deep into your business, understanding your goals, audience, and competitive landscape.",
  },
  {
    icon: Lightbulb,
    number: "02", 
    title: "Strategy",
    description: "Our experts craft a tailored digital strategy aligned with your objectives and market opportunities.",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Execution",
    description: "We bring the strategy to life with precision, creativity, and attention to every detail.",
  },
  {
    icon: BarChart3,
    number: "04",
    title: "Reporting",
    description: "Transparent reporting and continuous optimization ensure measurable, sustainable growth.",
  },
];

// PERFORMANCE: forwardRef to prevent React warnings with lazy loading
export const ProcessSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} id="process" className="py-24 bg-gradient-to-b from-secondary/50 to-background">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Our Process</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">
            How We Deliver
            <span className="text-gradient block">Results</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A proven methodology that transforms your vision into digital success.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}
              
              <div className="glass-card p-8 relative z-10 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-4xl font-display font-bold text-foreground">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

ProcessSection.displayName = "ProcessSection";