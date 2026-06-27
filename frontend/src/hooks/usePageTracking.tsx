import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const getVisitorId = () => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

/**
 * Parse user agent to extract only essential components
 * This reduces privacy concerns by not storing full browser fingerprinting data
 */
const parseUserAgent = (userAgent: string): string => {
  // Extract browser family
  let browser = 'Unknown';
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';

  // Extract OS family
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  // Extract device type
  let device = 'Desktop';
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    device = /iPad/i.test(userAgent) ? 'Tablet' : 'Mobile';
  }

  return `${browser}/${os}/${device}`;
};

/**
 * Sanitize referrer URL to remove sensitive query parameters
 * This prevents leaking session tokens or sensitive data from referrer URLs
 */
const sanitizeReferrer = (referrer: string | null): string | null => {
  if (!referrer) return null;
  
  try {
    const url = new URL(referrer);
    // Remove all query parameters to prevent leaking sensitive data
    // Keep only the origin and pathname
    return `${url.origin}${url.pathname}`;
  } catch {
    // If URL parsing fails, return null to be safe
    return null;
  }
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await supabase.from('page_views').insert({
          page_path: location.pathname,
          visitor_id: getVisitorId(),
          referrer: sanitizeReferrer(document.referrer),
          user_agent: parseUserAgent(navigator.userAgent),
        });
      } catch (error) {
        // Silently fail - don't break the app for analytics
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};
