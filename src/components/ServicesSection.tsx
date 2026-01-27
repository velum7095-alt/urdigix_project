import { forwardRef } from "react";
import { motion } from "framer-motion";
import { 
  Globe, 
  Video, 
  Target, 
  Mail, 
  MessageCircle, 
  TrendingUp, 
  Palette,
  FileText
} from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Website Development",
    description: "Stunning, conversion-focused websites that establish your digital presence and drive results.",
  },
  {
    icon: TrendingUp,
    title: "Social Media Management",
    description: "Strategic content creation and community management across all major platforms.",
  },
  {
    icon: Video,
    title: "Video Editing & Reels",
    description: "Scroll-stopping video content and viral reels that capture attention and boost engagement.",
  },
  {
    icon: FileText,
    title: "Content & Scripting",
    description: "Compelling scripts and editorial content that tells your brand story effectively.",
  },
  {
    icon: Target,
    title: "Meta & Google Ads",
    description: "Data-driven advertising campaigns that maximize ROI across Meta and Google platforms.",
  },
  {
    icon: Mail,
    title: "Email Marketing",
    description: "Personalized email campaigns that nurture leads and drive conversions at scale.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Marketing",
    description: "Direct engagement through WhatsApp business solutions for higher response rates.",
  },
  {
    icon: Palette,
    title: "Brand Identity",
    description: "Cohesive visual identity systems that make your brand memorable and recognizable.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// PERFORMANCE: forwardRef to prevent React warnings with lazy loading
export const ServicesSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} id="services" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      
      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Our Services</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">
            Everything You Need to
            <span className="text-gradient block">Dominate Digital</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive digital solutions tailored to elevate your brand and drive measurable growth.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className="group glass-card p-6 hover:border-primary/30 transition-all duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

ServicesSection.displayName = "ServicesSection";
