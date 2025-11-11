import React from 'react';

const StyledSelect = ({ children, className = '', ...props }) => {
  const selectStyle = {
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    padding: '0.75rem 2.5rem 0.75rem 1rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23667eea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.25rem',
    transition: 'all 0.3s ease',
    width: '100%',
    outline: 'none'
  };

  return (
    <select 
      className={`styled-select ${className}`}
      style={selectStyle}
      {...props}
    >
      {children}
    </select>
  );
};

export default StyledSelect;
