/**
 * Professional Animation Hooks
 * React hooks for sophisticated animations and micro-interactions
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Hook for scroll reveal animations
export const useScrollReveal = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
      ...options
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          element.classList.add('revealed');
          if (options.once !== false) {
            observer.unobserve(element);
          }
        } else if (options.once === false) {
          setIsVisible(false);
          element.classList.remove('revealed');
        }
      },
      defaultOptions
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return [elementRef, isVisible];
};

// Hook for stagger animations
export const useStaggerAnimation = (count, delay = 100) => {
  const [visibleItems, setVisibleItems] = useState(new Set());

  const triggerStagger = useCallback(() => {
    setVisibleItems(new Set());
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, i]));
      }, i * delay);
    }
  }, [count, delay]);

  return [visibleItems, triggerStagger];
};

// Hook for hover animations
export const useHoverAnimation = (effect = 'lift') => {
  const elementRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const effects = {
      lift: 'hover-lift',
      scale: 'hover-scale',
      glow: 'hover-glow',
      blur: 'hover-blur',
      rotate: 'hover-rotate'
    };

    element.classList.add(effects[effect] || effects.lift);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [effect]);

  return [elementRef, isHovered];
};

// Hook for loading animations
export const useLoadingAnimation = (isLoading, type = 'shimmer') => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (isLoading) {
      const animations = {
        shimmer: () => element.classList.add('loading-shimmer'),
        skeleton: () => element.classList.add('loading-skeleton'),
        pulse: () => element.classList.add('animate-pulse')
      };

      animations[type]?.();
    } else {
      element.classList.remove('loading-shimmer', 'loading-skeleton', 'animate-pulse');
    }
  }, [isLoading, type]);

  return elementRef;
};

// Hook for typewriter effect
export const useTypewriter = (text, speed = 50, startDelay = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);

    const startTimer = setTimeout(() => {
      let i = 0;
      const typeTimer = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(typeTimer);
        }
      }, speed);

      return () => clearInterval(typeTimer);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [text, speed, startDelay]);

  return [displayText, isComplete];
};

// Hook for count up animation
export const useCountUp = (target, duration = 2000, startDelay = 0) => {
  const [count, setCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setCount(0);
    setIsComplete(false);

    const startTimer = setTimeout(() => {
      const increment = target / (duration / 16);
      let current = 0;

      const countTimer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          setIsComplete(true);
          clearInterval(countTimer);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(countTimer);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [target, duration, startDelay]);

  return [count, isComplete];
};

// Hook for parallax effect
export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      setOffset(scrollY * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.style.transform = `translateY(${-offset}px)`;
    }
  }, [offset]);

  return elementRef;
};

// Hook for ripple effect
export const useRipple = () => {
  const elementRef = useRef(null);

  const createRipple = useCallback((event) => {
    const element = elementRef.current;
    if (!element) return;

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
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('click', createRipple);
    return () => element.removeEventListener('click', createRipple);
  }, [createRipple]);

  return elementRef;
};

// Hook for entrance animations
export const useEntranceAnimation = (animation = 'fade', delay = 0) => {
  const elementRef = useRef(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const animations = {
      fade: 'entrance-fade',
      slideUp: 'entrance-slide-up',
      slideDown: 'entrance-slide-down',
      scale: 'entrance-scale',
      rotate: 'entrance-rotate'
    };

    const timer = setTimeout(() => {
      element.classList.add(animations[animation] || animations.fade);
      setHasEntered(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [animation, delay]);

  return [elementRef, hasEntered];
};

// Hook for gesture animations
export const useGestureAnimation = () => {
  const elementRef = useRef(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseDown = () => {
      setIsPressed(true);
      element.classList.add('micro-press');
    };

    const handleMouseUp = () => {
      setIsPressed(false);
      element.classList.remove('micro-press');
    };

    const handleMouseLeave = () => {
      setIsPressed(false);
      element.classList.remove('micro-press');
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return [elementRef, isPressed];
};

// Export all hooks
export default {
  useScrollReveal,
  useStaggerAnimation,
  useHoverAnimation,
  useLoadingAnimation,
  useTypewriter,
  useCountUp,
  useParallax,
  useRipple,
  useEntranceAnimation,
  useGestureAnimation
};