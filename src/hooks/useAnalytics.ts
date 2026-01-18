// Google Analytics 4 event tracking hook

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type GAEventParams = {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
};

export const trackEvent = (
  eventName: string,
  params?: GAEventParams
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// Predefined conversion events
export const trackFormSubmission = (formName: string) => {
  trackEvent('form_submission', {
    event_category: 'engagement',
    event_label: formName,
  });
};

export const trackWhatsAppClick = (source: string) => {
  trackEvent('whatsapp_click', {
    event_category: 'engagement',
    event_label: source,
  });
};

export const trackPhoneClick = (source: string) => {
  trackEvent('phone_click', {
    event_category: 'engagement',
    event_label: source,
  });
};

export const trackEmailClick = (source: string) => {
  trackEvent('email_click', {
    event_category: 'engagement',
    event_label: source,
  });
};

export const trackCTAClick = (ctaName: string, location: string) => {
  trackEvent('cta_click', {
    event_category: 'engagement',
    event_label: ctaName,
    cta_location: location,
  });
};
