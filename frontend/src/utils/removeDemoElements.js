/**
 * Utility to remove any demo elements that might appear on the page
 */

export const removeDemoElements = () => {
  try {
    // Remove elements containing demo text
    const demoTexts = [
      'DROPDOWN TEST',
      'Test Option 1',
      'If you can see this green test dropdown',
      'demo dropdown',
      'test dropdown'
    ];

    demoTexts.forEach(text => {
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        try {
          if (el.textContent && el.textContent.includes(text)) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            el.style.top = '-9999px';
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          }
        } catch (error) {
          // Ignore errors when removing elements
        }
      });
    });

    // Remove elements with green styling that might be demo boxes
    const greenElements = document.querySelectorAll('div[style*="green"], div[style*="#00ff00"]');
    greenElements.forEach(el => {
      try {
        if (el.textContent && (el.textContent.includes('DROPDOWN') || el.textContent.includes('TEST'))) {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }
      } catch (error) {
        // Ignore errors when removing elements
      }
    });

    // Remove any fixed positioned elements in the top-right corner that might be demo boxes
    const fixedElements = document.querySelectorAll('div[style*="position: fixed"], div[style*="position: absolute"]');
    fixedElements.forEach(el => {
      try {
        const style = window.getComputedStyle(el);
        const isTopRight = (style.top && parseInt(style.top) < 200) && (style.right && parseInt(style.right) < 200);
        if (isTopRight && el.textContent && el.textContent.includes('DROPDOWN')) {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }
      } catch (error) {
        // Ignore errors when removing elements
      }
    });
  } catch (error) {
    // Ignore all errors in demo removal
    console.log('Demo element removal completed');
  }
};

export default removeDemoElements;