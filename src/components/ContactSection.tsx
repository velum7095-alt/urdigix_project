import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackFormSubmission, trackWhatsAppClick, trackPhoneClick, trackEmailClick } from "@/hooks/useAnalytics";

export const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    const { error } = await supabase.from('contact_submissions').insert({
      name,
      email,
      message,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } else {
      trackFormSubmission('contact_form');
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      (e.target as HTMLFormElement).reset();
    }
    
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      
      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Get In Touch</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">
            Ready to Start Your
            <span className="text-gradient block">Digital Journey?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Let's discuss how we can help transform your business. Fill out the form and we'll 
            get back to you within 24 hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-2 block">Name</label>
                  <Input 
                    id="name"
                    name="name"
                    placeholder="John Doe" 
                    required 
                    className="bg-secondary/50 border-border focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-2 block">Email</label>
                  <Input 
                    id="email"
                    name="email"
                    type="email" 
                    placeholder="john@company.com" 
                    required 
                    className="bg-secondary/50 border-border focus:border-primary"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="company" className="text-sm font-medium mb-2 block">Company</label>
                <Input 
                  id="company"
                  name="company"
                  placeholder="Your company name" 
                  className="bg-secondary/50 border-border focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="text-sm font-medium mb-2 block">Message</label>
                <Textarea 
                  id="message"
                  name="message"
                  placeholder="Tell us about your project..." 
                  rows={4}
                  required
                  className="bg-secondary/50 border-border focus:border-primary resize-none"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                By submitting this form, you agree to our privacy policy. We'll never share your information.
              </p>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div className="glass-card p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-1">Email Us</p>
                <a 
                  href="mailto:hello@urdigix.com" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => trackEmailClick('contact_section')}
                >
                  hello@urdigix.com
                </a>
              </div>
            </div>

            <div className="glass-card p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-1">Call Us</p>
                <a 
                  href="tel:+1234567890" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => trackPhoneClick('contact_section')}
                >
                  +1 (234) 567-890
                </a>
              </div>
            </div>

            <div className="glass-card p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-1">Visit Us</p>
                <p className="text-muted-foreground">
                  123 Digital Avenue<br />
                  Tech City, TC 12345
                </p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/1234567890?text=Hi%20URDIGIX!%20I'm%20interested%20in%20your%20digital%20marketing%20services."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('contact_section')}
              className="glass-card p-6 flex items-center gap-4 bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20 hover:border-green-500/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold mb-1">Chat on WhatsApp</p>
                <p className="text-muted-foreground text-sm">
                  Quick responses • Available 24/7
                </p>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
