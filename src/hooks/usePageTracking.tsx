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

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        await supabase.from('page_views').insert({
          page_path: location.pathname,
          visitor_id: getVisitorId(),
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        // Silently fail - don't break the app for analytics
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};
