import { useState, useRef, useEffect } from 'react';
import './GlassDropdown.css';

/**
 * Modern Professional Dropdown Component
 * Features: Clean design, blue accents, smooth animations, search functionality
 * Updated to match modern design requirements
 */
const GlassDropdown = ({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = 'Select an option...',
  disabled = false,
  searchable = false,
  clearable = false,
  size = 'medium', // small, medium, large
  variant = 'default', // default, primary, success, warning, error
  icon = null,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const label = typeof option === 'string' ? option : option.label || option.value;
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get display value
  const getDisplayValue = () => {
    if (!value) return placeholder;
    const selectedOption = options.find(opt => 
      (typeof opt === 'string' ? opt : opt.value) === value
    );
    return typeof selectedOption === 'string' ? selectedOption : selectedOption?.label || value;
  };

  // Handle option selection
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
    setFocusedIndex(-1);
  };

  // Handle clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          const option = filteredOptions[focusedIndex];
          const optionValue = typeof option === 'string' ? option : option.value;
          handleSelect(optionValue);
        }
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const dropdownClasses = [
    'glass-dropdown',
    `glass-dropdown--${size}`,
    `glass-dropdown--${variant}`,
    disabled && 'glass-dropdown--disabled',
    isOpen && 'glass-dropdown--open',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={dropdownRef}
      className={dropdownClasses}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      style={{
        position: 'relative',
        width: '100%',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        ...props.style
      }}
      {...props}
    >
      {/* Dropdown Trigger */}
      <div 
        className="glass-dropdown__trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minHeight: '48px',
          padding: '0.75rem 1rem',
          background: '#ffffff',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          color: '#374151',
          fontWeight: '500',
          fontSize: '0.95rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          ...(isOpen && {
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
          })
        }}
      >
        <div className="glass-dropdown__value">
          {icon && <span className="glass-dropdown__icon">{icon}</span>}
          <span 
            className="glass-dropdown__text"
            style={{
              color: value ? '#374151' : '#9ca3af',
              fontWeight: value ? '500' : '400',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1
            }}
          >
            {getDisplayValue()}
          </span>
        </div>
        
        <div className="glass-dropdown__actions">
          {clearable && value && (
            <button
              type="button"
              className="glass-dropdown__clear"
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M18 6L6 18M6 6l12 12" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          
          <div className={`glass-dropdown__arrow ${isOpen ? 'glass-dropdown__arrow--open' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path 
                d="M6 9l6 6 6-6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="glass-dropdown__menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 50,
            background: '#ffffff',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
            maxHeight: '300px',
            overflow: 'hidden',
            animation: 'dropdownSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {searchable && (
            <div className="glass-dropdown__search">
              <input
                ref={searchInputRef}
                type="text"
                className="glass-dropdown__search-input"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <div className="glass-dropdown__options" role="listbox">
            {filteredOptions.length === 0 ? (
              <div className="glass-dropdown__no-options">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label || option.value;
                const isSelected = optionValue === value;
                const isFocused = index === focusedIndex;
                
                return (
                  <div
                    key={optionValue}
                    className={`glass-dropdown__option ${
                      isSelected ? 'glass-dropdown__option--selected' : ''
                    } ${
                      isFocused ? 'glass-dropdown__option--focused' : ''
                    }`}
                    onClick={() => handleSelect(optionValue)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="glass-dropdown__option-text">
                      {optionLabel}
                    </span>
                    {isSelected && (
                      <span className="glass-dropdown__option-check">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path 
                            d="M20 6L9 17l-5-5" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlassDropdown;