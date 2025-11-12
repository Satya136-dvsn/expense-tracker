import React, { useState, useRef, useEffect } from 'react';

const GlassSelect = ({ options, value, onChange, placeholder = 'Select an option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="glass-select" ref={ref}>
      <div className="glass-select-header" onClick={() => setIsOpen(!isOpen)}>
        {value ? value.label : placeholder}
      </div>
      {isOpen && (
        <div className="glass-select-list">
          {options.map((option) => (
            <div
              key={option.value}
              className="glass-select-item"
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlassSelect;
