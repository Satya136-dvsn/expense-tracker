import { useState, useEffect } from 'react';

const useAnimation = (initialState = false, delay = 0) => {
  const [isAnimating, setIsAnimating] = useState(initialState);

  useEffect(() => {
    let timeoutId;
    if (isAnimating) {
      timeoutId = setTimeout(() => {
        setIsAnimating(false);
      }, delay);
    }
    return () => clearTimeout(timeoutId);
  }, [isAnimating, delay]);

  const triggerAnimation = () => {
    setIsAnimating(true);
  };

  return [isAnimating, triggerAnimation];
};

export default useAnimation;
