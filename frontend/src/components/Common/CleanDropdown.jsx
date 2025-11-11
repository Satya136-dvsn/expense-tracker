import { useState, useRef, useEffect } from 'react';
import './CleanDropdown.css';

/**
 * Clean Modern Dropdown Component
 * Matches the uploaded design with minimal, professional styling
 */
const CleanDropdown = ({
  options = [],
  value = '',
  onChange = () => {},
  placeholder = 'Select an option...',
  disabled = false,
  searchable = false,
  clearable = false,
  size = 'medium',
  className = '',
  label = '',
  error = '',
  success = false,
  loading = false,
  icon = null,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const triggerRef = useRef(null);

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
    triggerRef.current?.focus();
  };

  // Handle clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

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
        triggerRef.current?.focus();
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
      case 'Tab':
        setIsOpen(false);
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
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, searchable]);

  const dropdownClasses = [
    'clean-dropdown',
    `clean-dropdown--${size}`,
    disabled && 'clean-dropdown--disabled',
    isOpen && 'clean-dropdown--open',
    error && 'clean-dropdown--error',
    success && 'clean-dropdown--success',
    loading && 'clean-dropdown--loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="clean-dropdown-wrapper">
      {label && (
        <label className="clean-dropdown-label">
          {label}
          {props.required && <span className="required-asterisk">*</span>}
        </label>
      )}
      
      <div 
        ref={dropdownRef}
        className={dropdownClasses}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Dropdown Trigger */}
        <button
          ref={triggerRef}
          type="button"
          className="clean-dropdown__trigger"
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          disabled={disabled || loading}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={label ? undefined : 'dropdown-label'}
        >
          <div className="clean-dropdown__content">
            {icon && (
              <span className="clean-dropdown__icon">
                {icon}
              </span>
            )}
            <span className={`clean-dropdown__text ${!value ? 'placeholder' : ''}`}>
              {getDisplayValue()}
            </span>
          </div>
          
          <div className="clean-dropdown__actions">
            {loading && (
              <div className="clean-dropdown__loading">
                <svg className="spinner" width="16" height="16" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
            )}
            
            {clearable && value && !loading && (
              <button
                type="button"
                className="clean-dropdown__clear"
                onClick={handleClear}
                aria-label="Clear selection"
                tabIndex={-1}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
            
            {!loading && (
              <div className={`clean-dropdown__arrow ${isOpen ? 'open' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </div>
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="clean-dropdown__menu" role="listbox">
            {searchable && (
              <div className="clean-dropdown__search">
                <div className="search-input-wrapper">
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="clean-dropdown__search-input"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setFocusedIndex(0);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            
            <div className="clean-dropdown__options">
              {filteredOptions.length === 0 ? (
                <div className="clean-dropdown__no-options">
                  <span>No options found</span>
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const optionValue = typeof option === 'string' ? option : option.value;
                  const optionLabel = typeof option === 'string' ? option : option.label || option.value;
                  const optionDescription = typeof option === 'object' ? option.description : null;
                  const isSelected = optionValue === value;
                  const isFocused = index === focusedIndex;
                  
                  return (
                    <div
                      key={optionValue}
                      className={`clean-dropdown__option ${
                        isSelected ? 'selected' : ''
                      } ${
                        isFocused ? 'focused' : ''
                      }`}
                      onClick={() => handleSelect(optionValue)}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      <div className="option-content">
                        <span className="option-label">{optionLabel}</span>
                        {optionDescription && (
                          <span className="option-description">{optionDescription}</span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="option-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20,6 9,17 4,12"/>
                          </svg>
                        </div>
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
        <div className="clean-dropdown-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {success && !error && (
        <div className="clean-dropdown-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
          <span>Selection confirmed</span>
        </div>
      )}
    </div>
  );
};

export default CleanDropdown;