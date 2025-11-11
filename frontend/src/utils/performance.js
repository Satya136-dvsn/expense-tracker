// Performance Optimization Utilities

// Debounce function to limit API calls
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle function to limit function execution frequency
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization for expensive calculations
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Cache with expiration
class CacheWithExpiration {
  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    // Clean expired items first
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

// Global cache instance
export const cache = new CacheWithExpiration();

// Performance monitoring
export const performanceMonitor = {
  marks: new Map(),
  
  mark(name) {
    if (performance.mark) {
      performance.mark(name);
      this.marks.set(name, performance.now());
    }
  },
  
  measure(name, startMark, endMark) {
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
      return measure.duration;
    }
  },
  
  measureFromMark(name, startMark) {
    const startTime = this.marks.get(startMark);
    if (startTime) {
      const duration = performance.now() - startTime;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
  },
  
  clearMarks() {
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    this.marks.clear();
  }
};

// Bundle size analyzer (development only)
export const bundleAnalyzer = {
  logComponentSize(componentName, component) {
    if (process.env.NODE_ENV === 'development') {
      const size = JSON.stringify(component).length;
      console.log(`Component ${componentName} size: ${size} bytes`);
    }
  },
  
  logBundleInfo() {
    if (process.env.NODE_ENV === 'development' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      console.log('Bundle load time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
      console.log('DOM content loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
    }
  }
};

// Memory usage monitoring
export const memoryMonitor = {
  logMemoryUsage() {
    if (performance.memory) {
      const memory = performance.memory;
      console.log('Memory usage:', {
        used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
      });
    }
  },
  
  startMonitoring(interval = 30000) { // 30 seconds
    return setInterval(() => {
      this.logMemoryUsage();
    }, interval);
  }
};

// Optimize chart rendering
export const chartOptimizations = {
  // Reduce data points for better performance
  downsampleData(data, maxPoints = 100) {
    if (data.length <= maxPoints) return data;
    
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  },
  
  // Aggregate data by time periods
  aggregateByPeriod(data, period = 'day') {
    const aggregated = new Map();
    
    data.forEach(item => {
      let key;
      const date = new Date(item.date);
      
      switch (period) {
        case 'day':
          key = date.toDateString();
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toDateString();
          break;
        case 'month':
          key = `${date.getFullYear()}-${date.getMonth()}`;
          break;
        default:
          key = date.toDateString();
      }
      
      if (!aggregated.has(key)) {
        aggregated.set(key, { ...item, count: 1 });
      } else {
        const existing = aggregated.get(key);
        existing.value += item.value;
        existing.count += 1;
      }
    });
    
    return Array.from(aggregated.values());
  }
};

// Network optimization
export const networkOptimizations = {
  // Batch API requests
  batchRequests(requests, batchSize = 5) {
    const batches = [];
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }
    
    return batches.map(batch => 
      Promise.all(batch.map(request => request()))
    );
  },
  
  // Request deduplication
  createRequestDeduplicator() {
    const pendingRequests = new Map();
    
    return (key, requestFn) => {
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key);
      }
      
      const promise = requestFn().finally(() => {
        pendingRequests.delete(key);
      });
      
      pendingRequests.set(key, promise);
      return promise;
    };
  }
};

// Simple debounce hook (without React dependencies)
export const createDebouncedFunction = (func, delay) => {
  return debounce(func, delay);
};

// Simple throttle hook (without React dependencies)  
export const createThrottledFunction = (func, limit) => {
  return throttle(func, limit);
};