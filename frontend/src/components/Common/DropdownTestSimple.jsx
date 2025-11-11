import React from 'react';
import GlassDropdown from '../Glass/GlassDropdown';

/**
 * Simple test component to verify dropdown styling is working
 * This will be removed once testing is complete
 */
const DropdownTestSimple = () => {
  const testOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '200px',
      zIndex: 10000,
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '1rem',
      borderRadius: '12px',
      color: 'white'
    }}>
      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Dropdown Test</h4>
      <GlassDropdown
        options={testOptions}
        placeholder="Select option..."
        onChange={(value) => console.log('Selected:', value)}
      />
      <p style={{ fontSize: '0.8rem', margin: '0.5rem 0 0 0', opacity: 0.8 }}>
        If this dropdown looks professional with glassmorphism styling, the fix is working!
      </p>
    </div>
  );
};

export default DropdownTestSimple;