/**
 * Professional Animation Utilities
 * Advanced animation helpers for portfolio-quality interactions
 */

// Intersection Observer for scroll animations
export const createScrollReveal = (options = {}) => {
  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        if (options.once !== false) {
          observer.unobserve(entry.target);
        }
      } else if (options.once === false) {
        entry.target.classList.remove('revealed');
      }
    });
  }, defaultOptions);

  return observer;
};

// Initialize scroll reveal for elements
export const initScrollReveal = (selector = '.scroll-reveal', options = {}) => {
  const elements = document.querySelectorAll(selector);
  const observer = createScrollReveal(options);
  
  elements.forEach(el => observer.observe(el));
  
  return observer;
};

// Stagger animation utility
export const staggerAnimation = (elements, delay = 100, animationClass = 'animate-fade-in') => {
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add(animationClass);
    }, index * delay);
  });
};

// Ripple effect utility
export const createRipple = (event, element) => {
  const ripple = document.createElement('span');
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    pointer-events: none;
  `;
  
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
};

// Parallax scroll utility
export const initParallax = () => {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  const updateParallax = () => {
    const scrollY = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.5;
      const yPos = -(scrollY * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  };
  
  window.addEventListener('scroll', updateParallax, { passive: true });
  return updateParallax;
};

// Smooth scroll utility
export const smoothScrollTo = (target, duration = 1000) => {
  const targetElement = typeof target === 'string' 
    ? document.querySelector(target) 
    : target;
    
  if (!targetElement) return;
  
  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;
  
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };
  
  const animation = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = easeInOutCubic(progress);
    
    window.scrollTo(0, startPosition + distance * ease);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };
  
  requestAnimationFrame(animation);
};

// Loading animation utility
export const createLoadingAnimation = (element, type = 'shimmer') => {
  const originalContent = element.innerHTML;
  
  const animations = {
    shimmer: () => {
      element.classList.add('loading-shimmer');
      element.innerHTML = '<div class="h-4 bg-glass-bg-light rounded"></div>';
    },
    skeleton: () => {
      element.classList.add('loading-skeleton');
      element.innerHTML = '<div class="h-4 bg-glass-bg-light rounded animate-pulse"></div>';
    },
    spinner: () => {
      element.innerHTML = '<div class="loading-spinner w-6 h-6 mx-auto"></div>';
    }
  };
  
  animations[type]?.();
  
  return {
    stop: () => {
      element.classList.remove('loading-shimmer', 'loading-skeleton');
      element.innerHTML = originalContent;
    }
  };
};

// Typewriter effect utility
export const typewriterEffect = (element, text, speed = 50) => {
  element.innerHTML = '';
  let i = 0;
  
  const type = () => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  };
  
  type();
};

// Count up animation utility
export const countUpAnimation = (element, target, duration = 2000) => {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    element.textContent = Math.floor(current);
    
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    }
  }, 16);
  
  return timer;
};

// Professional hover effect utility
export const addHoverEffect = (element, effect = 'lift') => {
  const effects = {
    lift: 'hover-lift',
    scale: 'hover-scale',
    glow: 'hover-glow',
    blur: 'hover-blur',
    rotate: 'hover-rotate'
  };
  
  element.classList.add(effects[effect] || effects.lift);
};

// Animation sequence utility
export const animationSequence = (animations, delay = 300) => {
  return new Promise((resolve) => {
    let completed = 0;
    
    animations.forEach((animation, index) => {
      setTimeout(() => {
        animation();
        completed++;
        if (completed === animations.length) {
          resolve();
        }
      }, index * delay);
    });
  });
};

// Initialize all professional animations
export const initProfessionalAnimations = () => {
  // Initialize scroll reveal
  initScrollReveal();
  
  // Initialize parallax
  initParallax();
  
  // Add ripple effects to buttons
  document.querySelectorAll('.pro-btn, .micro-ripple').forEach(button => {
    button.addEventListener('click', (e) => {
      if (!button.classList.contains('no-ripple')) {
        createRipple(e, button);
      }
    });
  });
  
  // Add smooth scrolling to anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        smoothScrollTo(target);
      }
    });
  });
  
  console.log('Professional animations initialized');
};

// Export all utilities
export default {
  createScrollReveal,
  initScrollReveal,
  staggerAnimation,
  createRipple,
  initParallax,
  smoothScrollTo,
  createLoadingAnimation,
  typewriterEffect,
  countUpAnimation,
  addHoverEffect,
  animationSequence,
  initProfessionalAnimations
};