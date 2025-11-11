// Security utilities for BudgetWise application

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (basic)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Validate currency amount
export const isValidAmount = (amount) => {
  const amountRegex = /^\d+(\.\d{1,2})?$/;
  return amountRegex.test(amount.toString());
};

// Generate secure random ID
export const generateSecureId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Check for potential XSS in user input
export const containsPotentialXSS = (input) => {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

// Validate file upload (for future receipt scanning)
export const isValidFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (file, maxSizeInMB = 5) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Rate limiting helper (client-side)
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  isAllowed() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

// Content Security Policy helpers
export const getCSPNonce = () => {
  return document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content') || '';
};

// Local storage security
export const secureLocalStorage = {
  setItem: (key, value) => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : JSON.stringify(value);
      localStorage.setItem(sanitizedKey, sanitizedValue);
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
    }
  },
  
  getItem: (key) => {
    try {
      const sanitizedKey = sanitizeInput(key);
      return localStorage.getItem(sanitizedKey);
    } catch (error) {
      console.error('Failed to get localStorage item:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      const sanitizedKey = sanitizeInput(key);
      localStorage.removeItem(sanitizedKey);
    } catch (error) {
      console.error('Failed to remove localStorage item:', error);
    }
  }
};

// GDPR compliance helpers
export const gdprCompliance = {
  // Check if user has consented to data processing
  hasConsent: () => {
    return localStorage.getItem('gdpr-consent') === 'true';
  },
  
  // Set user consent
  setConsent: (consent) => {
    localStorage.setItem('gdpr-consent', consent.toString());
    localStorage.setItem('gdpr-consent-date', new Date().toISOString());
  },
  
  // Export user data (placeholder)
  exportUserData: async () => {
    // In a real implementation, this would call an API to export user data
    return {
      message: 'Data export functionality would be implemented here',
      timestamp: new Date().toISOString()
    };
  },
  
  // Delete user data (placeholder)
  deleteUserData: async () => {
    // In a real implementation, this would call an API to delete user data
    return {
      message: 'Data deletion functionality would be implemented here',
      timestamp: new Date().toISOString()
    };
  }
};

export default {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidAmount,
  generateSecureId,
  containsPotentialXSS,
  isValidFileType,
  isValidFileSize,
  RateLimiter,
  getCSPNonce,
  secureLocalStorage,
  gdprCompliance
};