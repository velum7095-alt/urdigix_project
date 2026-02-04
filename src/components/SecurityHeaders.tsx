/**
 * Security Headers Component
 * ==========================
 * Adds security-related meta tags that can be controlled client-side.
 * 
 * Note: For full security, these should also be set as HTTP headers
 * via server configuration or edge functions.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SecurityHeaders = () => {
    const location = useLocation();

    useEffect(() => {
        // Check if we're on an admin route
        const isAdminRoute = location.pathname.startsWith('/admin') || 
                             location.pathname === '/auth';

        if (isAdminRoute) {
            // Block search engine indexing for admin pages
            let robotsMeta = document.querySelector('meta[name="robots"]');
            if (!robotsMeta) {
                robotsMeta = document.createElement('meta');
                robotsMeta.setAttribute('name', 'robots');
                document.head.appendChild(robotsMeta);
            }
            robotsMeta.setAttribute('content', 'noindex, nofollow, noarchive, nosnippet');

            // Update document title to not leak admin info
            document.title = 'URDIGIX | Login';
        }

        // Cleanup function to restore original robots meta on route change
        return () => {
            if (isAdminRoute) {
                const robotsMeta = document.querySelector('meta[name="robots"]');
                if (robotsMeta) {
                    robotsMeta.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
                }
            }
        };
    }, [location.pathname]);

    return null;
};

/**
 * CSP Meta Tag (for reference - best set via HTTP header)
 * 
 * The following CSP should be set via your hosting provider's HTTP headers:
 * 
 * Content-Security-Policy: 
 *   default-src 'self';
 *   script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;
 *   style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
 *   font-src 'self' https://fonts.gstatic.com;
 *   img-src 'self' data: https: blob:;
 *   connect-src 'self' https://*.supabase.co https://www.google-analytics.com;
 *   frame-ancestors 'self';
 *   form-action 'self';
 *   base-uri 'self';
 * 
 * Additional recommended headers:
 * - X-Frame-Options: DENY
 * - X-Content-Type-Options: nosniff
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Strict-Transport-Security: max-age=31536000; includeSubDomains
 */
