import { memo } from "react";
import { Instagram, Linkedin, Twitter, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  services: [
    { name: "Website Development", href: "#services" },
    { name: "Social Media", href: "#services" },
    { name: "Video Production", href: "#services" },
    { name: "Paid Advertising", href: "#services" },
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "Our Process", href: "#process" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61587007410997", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

const FooterComponent = () => {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="container px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="text-2xl font-display font-bold inline-block mb-4">
              <span className="text-primary">UR</span>DIGIX
            </a>
            <p className="text-background/70 mb-6 max-w-sm">
              Your full-service digital marketing partner. Transforming businesses through 
              strategic digital solutions.
            </p>
            
            {/* Newsletter */}
            <div>
              <p className="font-semibold mb-3">Subscribe to our newsletter</p>
              <form className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:border-primary max-w-xs"
                />
                <Button variant="hero">Subscribe</Button>
              </form>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-background/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/70">
            © {new Date().getFullYear()} URDIGIX. All rights reserved.
          </p>
          
          {/* Social Links - CSS hover instead of framer-motion scale */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background/70 hover:text-primary hover:bg-primary/10 hover:brightness-110 active:brightness-95 transition-all duration-200"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

FooterComponent.displayName = "Footer";

export const Footer = memo(FooterComponent);