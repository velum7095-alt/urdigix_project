import { memo } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [{
  name: "Divakar Reddy",
  role: "CEO, TechStart Inc.",
  content: "URDIGIX transformed our online presence completely. Our website traffic increased by 340% and lead generation skyrocketed within 3 months.",
  rating: 5
}, {
  name: "Michael Chen",
  role: "Founder, GrowthLabs",
  content: "The Meta Ads campaigns they designed brought us a 5x ROAS. Their strategic approach and attention to detail is unmatched in the industry.",
  rating: 5
}, {
  name: "Chandra Sekhar",
  role: "Marketing Director, BrandFlow",
  content: "Their video content went viral on multiple occasions. The reels they created helped us gain 10K+ followers in just two months.",
  rating: 5
}];

const TestimonialsSectionComponent = () => {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial opacity-20" />
      
      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">
            What Our Clients
            <span className="text-gradient block">Say About Us</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="glass-card p-8 relative group hover:border-primary/30 transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20 group-hover:text-primary/40 transition-colors" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-display font-bold text-gradient">50+</p>
            <p className="text-sm text-muted-foreground mt-1">Projects Completed</p>
          </div>
          <div className="w-px h-12 bg-border hidden md:block" />
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-display font-bold text-gradient">48+</p>
            <p className="text-sm text-muted-foreground mt-1">Happy Clients</p>
          </div>
          <div className="w-px h-12 bg-border hidden md:block" />
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-display font-bold text-gradient">5x</p>
            <p className="text-sm text-muted-foreground mt-1">Average ROAS</p>
          </div>
          <div className="w-px h-12 bg-border hidden md:block" />
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-display font-bold text-gradient">98%</p>
            <p className="text-sm text-muted-foreground mt-1">Client Retention</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

TestimonialsSectionComponent.displayName = "TestimonialsSection";

export const TestimonialsSection = memo(TestimonialsSectionComponent);