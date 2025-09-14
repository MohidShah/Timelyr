import { SECURITY_CONFIG } from './security';

// Form validation utilities
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateLinkCreation = (data: {
  title: string;
  description?: string;
  scheduledTime: Date;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > SECURITY_CONFIG.VALIDATION.MAX_TITLE_LENGTH) {
    errors.title = `Title must be less than ${SECURITY_CONFIG.VALIDATION.MAX_TITLE_LENGTH} characters`;
  }

  // Description validation
  if (data.description && data.description.length > SECURITY_CONFIG.VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be less than ${SECURITY_CONFIG.VALIDATION.MAX_DESCRIPTION_LENGTH} characters`;
  }

  // Scheduled time validation
  if (!data.scheduledTime || isNaN(data.scheduledTime.getTime())) {
    errors.scheduledTime = 'Valid scheduled time is required';
  } else if (data.scheduledTime < new Date()) {
    errors.scheduledTime = 'Scheduled time cannot be in the past';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUserProfile = (data: {
  displayName?: string;
  username?: string;
  bio?: string;
  email?: string;
  website?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Display name validation
  if (data.displayName && data.displayName.length > 100) {
    errors.displayName = 'Display name must be less than 100 characters';
  }

  // Username validation
  if (data.username) {
    if (!SECURITY_CONFIG.VALIDATION.USERNAME_REGEX.test(data.username)) {
      errors.username = 'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens';
    }
  }

  // Bio validation
  if (data.bio && data.bio.length > SECURITY_CONFIG.VALIDATION.MAX_BIO_LENGTH) {
    errors.bio = `Bio must be less than ${SECURITY_CONFIG.VALIDATION.MAX_BIO_LENGTH} characters`;
  }

  // Email validation
  if (data.email && !SECURITY_CONFIG.VALIDATION.EMAIL_REGEX.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Website validation
  if (data.website) {
    try {
      new URL(data.website);
    } catch {
      errors.website = 'Please enter a valid website URL';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateAuthCredentials = (data: {
  email: string;
  password: string;
  confirmPassword?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!SECURITY_CONFIG.VALIDATION.EMAIL_REGEX.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  // Confirm password validation (for registration)
  if (data.confirmPassword !== undefined) {
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitize user input
export const sanitizeUserInput = (input: string, maxLength?: number): string => {
  let sanitized = input.trim();
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>\"'&]/g, '');
  
  // Limit length
  if (maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

// Validate timezone
export const validateTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

// Validate slug format
export const validateSlug = (slug: string): boolean => {
  return SECURITY_CONFIG.VALIDATION.SLUG_REGEX.test(slug) && slug.length >= 3 && slug.length <= 100;
};