// Security utilities and configurations
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    LINK_CREATION: { requests: 10, window: 60000 }, // 10 requests per minute
    LOGIN_ATTEMPTS: { requests: 5, window: 300000 }, // 5 attempts per 5 minutes
    API_CALLS: { requests: 100, window: 60000 }, // 100 requests per minute
  },
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': ["'self'", 'https://*.supabase.co', 'https://api.qrserver.com'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
  
  // Input validation
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    USERNAME_REGEX: /^[a-zA-Z0-9_-]{3,50}$/,
    SLUG_REGEX: /^[a-z0-9-]+$/,
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_BIO_LENGTH: 500,
  }
};

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, limit: { requests: number; window: number }): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.window });
    return true;
  }
  
  if (record.count >= limit.requests) {
    return false;
  }
  
  record.count++;
  return true;
};

// Input sanitization
export const sanitizeInput = (input: string, maxLength?: number): string => {
  let sanitized = input.trim();
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>\"'&]/g, '');
  
  // Limit length
  if (maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

// Validate email
export const validateEmail = (email: string): boolean => {
  return SECURITY_CONFIG.VALIDATION.EMAIL_REGEX.test(email);
};

// Validate username
export const validateUsername = (username: string): boolean => {
  return SECURITY_CONFIG.VALIDATION.USERNAME_REGEX.test(username);
};

// Generate secure random string
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  
  return result;
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 25;
  else feedback.push('Password must be at least 8 characters long');
  
  if (/[A-Z]/.test(password)) score += 25;
  else feedback.push('Add uppercase letters');
  
  if (/[a-z]/.test(password)) score += 25;
  else feedback.push('Add lowercase letters');
  
  if (/[0-9]/.test(password)) score += 25;
  else feedback.push('Add numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 25;
  else feedback.push('Add special characters');
  
  return {
    isValid: score >= 75,
    score: Math.min(score, 100),
    feedback
  };
};

// XSS Protection
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// CSRF Token management
export const generateCSRFToken = (): string => {
  return generateSecureToken(32);
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length === 32;
};