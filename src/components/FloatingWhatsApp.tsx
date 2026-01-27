import { memo, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { trackWhatsAppClick } from "@/hooks/useAnalytics";

const WHATSAPP_NUMBER = "1234567890";
const WHATSAPP_MESSAGE = "Hi URDIGIX! I'm interested in your digital marketing services.";

/**
 * PERFORMANCE: Delayed rendering for non-critical floating element
 * - Removed framer-motion to eliminate transform: scale() blur
 * - Uses CSS transitions instead (no subpixel rendering issues)
 * - Delayed load to prioritize FCP/LCP critical content
 */
const FloatingWhatsAppComponent = () => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // PERFORMANCE: Delay rendering until after initial paint
    const renderTimer = setTimeout(() => setShouldRender(true), 2000);
    const visibilityTimer = setTimeout(() => setIsVisible(true), 2100);
    return () => {
      clearTimeout(renderTimer);
      clearTimeout(visibilityTimer);
    };
  }, []);

  if (!shouldRender) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick('floating_button')}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 group transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label="Chat on WhatsApp"
    >
      {/* Tooltip - no scale transform */}
      <span className="hidden md:block bg-foreground text-background text-sm font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
        Chat with us
      </span>
      
      {/* Button - uses CSS hover effects instead of framer-motion scale */}
      <div className="relative">
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />
        
        {/* Main button - removed scale transforms */}
        <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:brightness-110 active:brightness-95 transition-all duration-200">
          <MessageCircle className="w-7 h-7 text-white" />
        </div>
      </div>
    </a>
  );
};

export const FloatingWhatsApp = memo(FloatingWhatsAppComponent);
