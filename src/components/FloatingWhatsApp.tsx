import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { trackWhatsAppClick } from "@/hooks/useAnalytics";

const WHATSAPP_NUMBER = "1234567890";
const WHATSAPP_MESSAGE = "Hi URDIGIX! I'm interested in your digital marketing services.";

/**
 * PERFORMANCE: Delayed rendering for non-critical floating element
 * This component is not part of initial viewport, so we delay its load
 * to prioritize FCP/LCP critical content
 */
const FloatingWhatsAppComponent = () => {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    // PERFORMANCE: Delay rendering until after initial paint
    const timer = setTimeout(() => setShouldRender(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick('floating_button')}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Chat on WhatsApp"
    >
      {/* Tooltip */}
      <span className="hidden md:block bg-foreground text-background text-sm font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
        Chat with us
      </span>
      
      {/* Button */}
      <div className="relative">
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
        
        {/* Main button */}
        <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-shadow">
          <MessageCircle className="w-7 h-7 text-white" />
        </div>
      </div>
    </motion.a>
  );
};

export const FloatingWhatsApp = memo(FloatingWhatsAppComponent);
