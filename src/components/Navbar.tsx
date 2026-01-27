import { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { name: "Services", href: "#services" },
  { name: "Process", href: "#process" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

/**
 * PERFORMANCE: Optimized Navbar
 * - Memoized to prevent unnecessary re-renders
 * - useCallback for event handlers
 * - Minimal animation complexity
 */
const NavbarComponent = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    // PERFORMANCE: Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-lg shadow-sm py-3" : "py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="#" className="text-2xl font-display font-bold text-foreground">
          <span className="text-gradient">UR</span>DIGIX
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-medium"
            >
              {link.name}
            </a>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-medium"
            >
              <Settings size={16} />
              Admin
            </Link>
          )}
          <Button variant="hero" size="lg">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass-card mt-4 mx-4 rounded-xl overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  {link.name}
                </a>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  <Settings size={18} />
                  Admin Panel
                </Link>
              )}
              <Button variant="hero" size="lg" className="mt-4">
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export const Navbar = memo(NavbarComponent);
