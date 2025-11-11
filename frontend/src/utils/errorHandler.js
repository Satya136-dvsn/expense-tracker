// Global Error Handler Utility

class ErrorHandler {
  constructor() {
    this.setupGlobalErrorHandlers();
  }

  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      // Log error silently for debugging
      this.reportError(event.reason, 'unhandledrejection');
      
      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      // Log error silently for debugging
      this.reportError(event.error, 'javascript');
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        // Log resource error silently for debugging
        this.reportError(new Error(`Failed to load resource: ${event.target.src || event.target.href}`), 'resource');
      }
    }, true);
  }

  reportError(error, type = 'unknown', context = {}) {
    const errorReport = {
      id: this.generateErrorId(),
      type,
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || 'anonymous',
      context
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', errorReport);
    }

    // Store locally for potential later reporting
    this.storeErrorLocally(errorReport);

    // In production, you would send this to an error reporting service
    // this.sendToErrorService(errorReport);

    return errorReport.id;
  }

  generateErrorId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  storeErrorLocally(errorReport) {
    try {
      const existingErrors = JSON.parse(localStorage.getItem('errorReports') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only the last 20 errors to prevent localStorage bloat
      const recentErrors = existingErrors.slice(-20);
      localStorage.setItem('errorReports', JSON.stringify(recentErrors));
    } catch (e) {
      console.error('Failed to store error report locally:', e);
    }
  }

  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('errorReports') || '[]');
    } catch (e) {
      console.error('Failed to retrieve stored errors:', e);
      return [];
    }
  }

  clearStoredErrors() {
    try {
      localStorage.removeItem('errorReports');
    } catch (e) {
      console.error('Failed to clear stored errors:', e);
    }
  }

  // API Error Handler
  handleApiError(error, context = {}) {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          errorMessage = data?.message || 'Bad request - please check your input';
          errorCode = 'BAD_REQUEST';
          break;
        case 401:
          errorMessage = 'Authentication required - please log in again';
          errorCode = 'UNAUTHORIZED';
          // Redirect to login
          this.handleAuthError();
          break;
        case 403:
          errorMessage = 'Access denied - you don\'t have permission for this action';
          errorCode = 'FORBIDDEN';
          break;
        case 404:
          errorMessage = 'Resource not found';
          errorCode = 'NOT_FOUND';
          break;
        case 422:
          errorMessage = data?.message || 'Validation error - please check your input';
          errorCode = 'VALIDATION_ERROR';
          break;
        case 429:
          errorMessage = 'Too many requests - please try again later';
          errorCode = 'RATE_LIMITED';
          break;
        case 500:
          errorMessage = 'Server error - please try again later';
          errorCode = 'SERVER_ERROR';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable - please try again later';
          errorCode = 'SERVICE_UNAVAILABLE';
          break;
        default:
          errorMessage = data?.message || `Server error (${status})`;
          errorCode = `HTTP_${status}`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error - please check your internet connection';
      errorCode = 'NETWORK_ERROR';
    } else {
      // Other error
      errorMessage = error.message || 'An unexpected error occurred';
      errorCode = 'CLIENT_ERROR';
    }

    const errorId = this.reportError(error, 'api', {
      ...context,
      errorCode,
      status: error.response?.status,
      url: error.config?.url
    });

    return {
      message: errorMessage,
      code: errorCode,
      errorId,
      originalError: error
    };
  }

  handleAuthError() {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    
    // Redirect to login page
    if (window.location.pathname !== '/signin') {
      window.location.href = '/signin';
    }
  }

  // Validation Error Handler
  handleValidationError(errors) {
    if (Array.isArray(errors)) {
      return errors.map(error => ({
        field: error.field || 'unknown',
        message: error.message || 'Validation error'
      }));
    }

    if (typeof errors === 'object') {
      return Object.entries(errors).map(([field, message]) => ({
        field,
        message: Array.isArray(message) ? message[0] : message
      }));
    }

    return [{
      field: 'general',
      message: errors || 'Validation error'
    }];
  }

  // User-friendly error messages
  getUserFriendlyMessage(error) {
    const commonErrors = {
      'NETWORK_ERROR': 'Please check your internet connection and try again.',
      'UNAUTHORIZED': 'Your session has expired. Please log in again.',
      'FORBIDDEN': 'You don\'t have permission to perform this action.',
      'NOT_FOUND': 'The requested information could not be found.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'RATE_LIMITED': 'You\'re doing that too often. Please wait a moment and try again.',
      'SERVER_ERROR': 'We\'re experiencing technical difficulties. Please try again later.',
      'SERVICE_UNAVAILABLE': 'The service is temporarily unavailable. Please try again later.'
    };

    return commonErrors[error.code] || error.message || 'An unexpected error occurred.';
  }

  // Retry mechanism
  async retryOperation(operation, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Don't retry certain types of errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError;
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;