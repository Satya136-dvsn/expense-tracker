import { useState, useRef, useEffect } from 'react';
import './ModernDropdown.css';

/**
 * Modern Clean Dropdown Component
 * Features: Clean white design, blue accents, professional typography
 */
const ModernDropdown = ({
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
  label = '',
  error = '',
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
    'modern-dropdown',
    `modern-dropdown--${size}`,
    `modern-dropdown--${variant}`,
    disabled && 'modern-dropdown--disabled',
    isOpen && 'modern-dropdown--open',
    error && 'modern-dropdown--error',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="modern-dropdown-wrapper">
      {label && (
        <label className="modern-dropdown-label">
          {label}
        </label>
      )}
      
      <div 
        ref={dropdownRef}
        className={dropdownClasses}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {/* Dropdown Trigger */}
        <div 
          className="modern-dropdown__trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="modern-dropdown__value">
            {icon && <span className="modern-dropdown__icon">{icon}</span>}
            <span className="modern-dropdown__text">
              {getDisplayValue()}
            </span>
          </div>
          
          <div className="modern-dropdown__actions">
            {clearable && value && (
              <button
                type="button"
                className="modern-dropdown__clear"
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
            
            <div className={`modern-dropdown__arrow ${isOpen ? 'modern-dropdown__arrow--open' : ''}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
          <div className="modern-dropdown__menu">
            {searchable && (
              <div className="modern-dropdown__search">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="modern-dropdown__search-input"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            
            <div className="modern-dropdown__options" role="listbox">
              {filteredOptions.length === 0 ? (
                <div className="modern-dropdown__no-options">
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
                      className={`modern-dropdown__option ${
                        isSelected ? 'modern-dropdown__option--selected' : ''
                      } ${
                        isFocused ? 'modern-dropdown__option--focused' : ''
                      }`}
                      onClick={() => handleSelect(optionValue)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="modern-dropdown__option-text">
                        {optionLabel}
                      </span>
                      {isSelected && (
                        <span className="modern-dropdown__option-check">
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
      
      {error && (
        <div className="modern-dropdown-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ModernDropdown;