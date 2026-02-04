import { memo } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ExternalLink, Sparkles, Award, CheckCircle } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  projectLink?: string;
  projectType?: string;
  isVerified?: boolean;
}

const testimonials: Testimonial[] = [
  {
    name: "Navya",
    role: "Founder",
    company: "Navya Studio (Beauty Parlour & Hairstyle)",
    content: "URDIGIX built our beauty parlour and hairstyle website exactly how we imagined. The design looks premium, loads fast, and our customers can easily find our services online. After launching the website, our brand visibility and customer enquiries increased significantly.",
    rating: 5,
    projectLink: "https://www.navyastudio.in",
    projectType: "Website Development",
    isVerified: true
  },
  {
    name: "Hareesh",
    role: "Business Owner",
    company: "Local Business",
    content: "URDIGIX understood our business needs clearly and delivered a professional website with great attention to design and user experience. Their support and guidance throughout the project were excellent.",
    rating: 5,
    isVerified: true
  }
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: rating }).map((_, i) => (
      <Star 
        key={i} 
        className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm" 
      />
    ))}
  </div>
);

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ 
      duration: 0.6, 
      delay: index * 0.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}
    className="group relative"
  >
    {/* Card Container */}
    <div className="relative h-full bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 
      border border-orange-100/50 shadow-[0_8px_40px_-12px_rgba(251,146,60,0.15)]
      hover:shadow-[0_20px_60px_-15px_rgba(251,146,60,0.25)] hover:border-orange-200/70
      transition-all duration-500 ease-out hover:-translate-y-2">
      
      {/* Decorative gradient orb */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-400/20 to-amber-300/10 
        rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Quote Icon */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8">
        <div className="relative">
          <Quote className="w-10 h-10 md:w-12 md:h-12 text-orange-100 group-hover:text-orange-200 
            transition-colors duration-300 rotate-180" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 opacity-0 
            group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Project Badge */}
      {testimonial.projectType && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 + 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
            bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100/50 mb-6"
        >
          <Award className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
            {testimonial.projectType}
          </span>
        </motion.div>
      )}

      {/* Star Rating */}
      <div className="mb-6">
        <StarRating rating={testimonial.rating} />
      </div>

      {/* Testimonial Content */}
      <blockquote className="relative">
        <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8 font-medium">
          "{testimonial.content}"
        </p>
      </blockquote>

      {/* Author Info */}
      <div className="flex items-center gap-4 pt-6 border-t border-orange-100/50">
        {/* Avatar */}
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 
            flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-200/50
            group-hover:shadow-orange-300/60 transition-shadow duration-300">
            {testimonial.name.charAt(0)}
          </div>
          {testimonial.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle className="w-4 h-4 text-green-500 fill-green-500" />
            </div>
          )}
        </div>

        {/* Author Details */}
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
            {testimonial.name}
          </p>
          <p className="text-orange-600 font-medium text-sm">{testimonial.role}</p>
          <p className="text-gray-500 text-sm">{testimonial.company}</p>
        </div>
      </div>

      {/* Project Link */}
      {testimonial.projectLink && (
        <motion.a
          href={testimonial.projectLink}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.2 + 0.4 }}
          className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl 
            bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600
            text-white font-semibold text-sm shadow-lg shadow-orange-200/50
            hover:shadow-orange-300/60 hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-300 group/link"
        >
          <span>View Live Project</span>
          <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </motion.a>
      )}
    </div>
  </motion.div>
);

const TrustBadge = ({ value, label, delay }: { value: string; label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="text-center group cursor-default"
  >
    <p className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-orange-500 to-amber-500 
      bg-clip-text text-transparent group-hover:from-orange-600 group-hover:to-amber-600 transition-all duration-300">
      {value}
    </p>
    <p className="text-sm md:text-base text-gray-500 mt-2 font-medium">{label}</p>
  </motion.div>
);

const TestimonialsSectionComponent = () => {
  return (
    <section id="testimonials" className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-orange-50/30 via-white to-amber-50/20">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16 md:mb-20"
        >
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
              bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200/50 mb-6"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">
              Client Results
            </span>
          </motion.div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Client Success Stories
            <span className="block mt-2 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 
              bg-clip-text text-transparent">
              & Projects
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real results from real businesses we've helped grow digitally.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 mb-20 md:mb-24">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          {/* Badge Container */}
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 
            border border-orange-100/50 shadow-[0_8px_40px_-12px_rgba(251,146,60,0.1)]">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <TrustBadge value="50+" label="Projects Completed" delay={0.1} />
              
              <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-orange-200 to-transparent" />
              
              <TrustBadge value="48+" label="Happy Clients" delay={0.2} />
              
              <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-orange-200 to-transparent" />
              
              <TrustBadge value="5x" label="Average ROAS" delay={0.3} />
              
              <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-orange-200 to-transparent" />
              
              <TrustBadge value="98%" label="Client Retention" delay={0.4} />
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-500 mb-6 text-lg">
            Ready to become our next success story?
          </p>
          <a 
            href="#contact" 
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl 
              bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600
              text-white font-bold text-lg shadow-xl shadow-orange-200/50
              hover:shadow-orange-300/60 hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-300"
          >
            Start Your Project
            <Sparkles className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

TestimonialsSectionComponent.displayName = "TestimonialsSection";

export const TestimonialsSection = memo(TestimonialsSectionComponent);