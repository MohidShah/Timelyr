import { useEffect } from 'react';
import { SECURITY_CONFIG } from '../lib/security';

export const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Set Content Security Policy
    const csp = Object.entries(SECURITY_CONFIG.CSP_DIRECTIVES)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
    
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);

    // Set other security headers via meta tags
    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
    ];

    securityHeaders.forEach(header => {
      const meta = document.createElement('meta');
      meta.httpEquiv = header.name;
      meta.content = header.content;
      document.head.appendChild(meta);
    });

    return () => {
      // Cleanup on unmount
      document.querySelectorAll('meta[http-equiv]').forEach(meta => {
        if (meta.getAttribute('http-equiv')?.startsWith('X-') || 
            meta.getAttribute('http-equiv') === 'Content-Security-Policy' ||
            meta.getAttribute('http-equiv') === 'Referrer-Policy' ||
            meta.getAttribute('http-equiv') === 'Permissions-Policy') {
          meta.remove();
        }
      });
    };
  }, []);

  return null;
};