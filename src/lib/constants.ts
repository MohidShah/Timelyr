// Application constants
export const APP_CONFIG = {
  NAME: 'Timelyr',
  VERSION: '1.0.0',
  DESCRIPTION: 'Timezone Link Sharing App',
  URL: import.meta.env.VITE_APP_URL || 'https://timelyr.com',
  SUPPORT_EMAIL: 'support@timelyr.com',
  PRIVACY_EMAIL: 'privacy@timelyr.com',
  LEGAL_EMAIL: 'legal@timelyr.com',
  
  // Social links
  SOCIAL: {
    TWITTER: 'https://twitter.com/timelyr',
    GITHUB: 'https://github.com/timelyr',
    LINKEDIN: 'https://linkedin.com/company/timelyr'
  },
  
  // Feature flags
  FEATURES: {
    REGISTRATION_ENABLED: import.meta.env.VITE_ENABLE_REGISTRATION !== 'false',
    ANALYTICS_ENABLED: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    MAINTENANCE_MODE: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
    RATE_LIMITING: import.meta.env.VITE_RATE_LIMIT_ENABLED !== 'false'
  },
  
  // Limits
  LIMITS: {
    MAX_LINKS_PER_USER_STARTER: 50,
    MAX_LINKS_PER_USER_PRO: null, // unlimited
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_BIO_LENGTH: 500,
    LINK_EXPIRY_STARTER_DAYS: 30,
    LINK_EXPIRY_PRO_DAYS: 365
  },
  
  // API endpoints
  API: {
    QR_CODE_SERVICE: 'https://api.qrserver.com/v1/create-qr-code/',
    TIMEZONE_SERVICE: 'https://worldtimeapi.org/api'
  }
};

export const STORAGE_KEYS = {
  THEME: 'timelyr-theme',
  COOKIE_CONSENT: 'cookie-consent',
  USER_PREFERENCES: 'user-preferences',
  LAST_VISIT: 'last-visit',
  ONBOARDING_COMPLETED: 'onboarding-completed'
};

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to be logged in to perform this action.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Our team has been notified.'
};

export const SUCCESS_MESSAGES = {
  LINK_CREATED: 'Timezone link created successfully!',
  LINK_UPDATED: 'Link updated successfully!',
  LINK_DELETED: 'Link deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!'
};