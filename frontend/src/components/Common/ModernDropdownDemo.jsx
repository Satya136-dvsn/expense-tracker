import React, { useState } from 'react';
import ModernDropdown from './ModernDropdown';
import './ModernDropdownDemo.css';

const ModernDropdownDemo = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('Date (Newest)');
  const [selectedShift, setSelectedShift] = useState('');

  const typeOptions = [
    'All Types',
    'Income',
    'Expense',
    'Transfer'
  ];

  const categoryOptions = [
    'Select an option...',
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Business',
    'Other'
  ];

  const sortOptions = [
    'Date (Newest)',
    'Date (Oldest)',
    'Amount (High to Low)',
    'Amount (Low to High)',
    'Category A-Z',
    'Category Z-A'
  ];

  const shiftOptions = [
    { value: '7:00-19:00', label: '7:00 am - 19:00 pm' },
    { value: '6:00-14:00', label: '6:00 am - 2:00 pm' },
    { value: '14:00-22:00', label: '2:00 pm - 10:00 pm' },
    { value: '22:00-6:00', label: '10:00 pm - 6:00 am' },
    { value: 'custom', label: 'Add a custom shift time' }
  ];

  return (
    <div className="modern-dropdown-demo">
      <div className="demo-container">
        <h2 className="demo-title">Modern Dropdown Components</h2>
        <p className="demo-subtitle">Clean, professional dropdown design matching your requirements</p>
        
        <div className="demo-grid">
          {/* Transaction Filters Example */}
          <div className="demo-section">
            <h3 className="section-title">Transaction Filters</h3>
            <div className="filter-row">
              <div className="filter-group">
                <ModernDropdown
                  label="Type"
                  options={typeOptions}
                  value={selectedType}
                  onChange={setSelectedType}
                  placeholder="All Types"
                  size="medium"
                />
              </div>
              
              <div className="filter-group">
                <ModernDropdown
                  label="Category"
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Select an option..."
                  searchable
                  clearable
                  size="medium"
                />
              </div>
              
              <div className="filter-group">
                <ModernDropdown
                  label="Sort By"
                  options={sortOptions}
                  value={selectedSort}
                  onChange={setSelectedSort}
                  size="medium"
                />
              </div>
            </div>
          </div>

          {/* Shift Time Example (matching your uploaded image) */}
          <div className="demo-section">
            <h3 className="section-title">Shift Time Selector</h3>
            <div className="shift-container">
              <ModernDropdown
                label="Shift Time"
                options={shiftOptions}
                value={selectedShift}
                onChange={setSelectedShift}
                placeholder="Select shift time..."
                size="large"
                variant="primary"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                }
              />
            </div>
          </div>

          {/* Size Variants */}
          <div className="demo-section">
            <h3 className="section-title">Size Variants</h3>
            <div className="size-variants">
              <ModernDropdown
                label="Small"
                options={['Option 1', 'Option 2', 'Option 3']}
                placeholder="Small dropdown"
                size="small"
              />
              
              <ModernDropdown
                label="Medium (Default)"
                options={['Option 1', 'Option 2', 'Option 3']}
                placeholder="Medium dropdown"
                size="medium"
              />
              
              <ModernDropdown
                label="Large"
                options={['Option 1', 'Option 2', 'Option 3']}
                placeholder="Large dropdown"
                size="large"
              />
            </div>
          </div>

          {/* Color Variants */}
          <div className="demo-section">
            <h3 className="section-title">Color Variants</h3>
            <div className="color-variants">
              <ModernDropdown
                label="Default"
                options={['Option 1', 'Option 2', 'Option 3']}
                placeholder="Default variant"
                variant="default"
              />
              
              <ModernDropdown
                label="Primary"
                options={['Option 1', 'Option 2', 'Option 3']}
                placeholder="Primary variant"
                variant="primary"
              />
              
              <ModernDropdown
                label="Success"
                options={['Option 1', 'Option 2', 'Option 3']}
                placeholder="Success variant"
                variant="success"
              />
              
              <ModernDropdown
                label="Warning"
                options={['Option 1', 'Option 2', 'Option 3']}
                placeholder="Warning variant"
                variant="warning"
              />
            </div>
          </div>

          {/* Features Demo */}
          <div className="demo-section">
            <h3 className="section-title">Features</h3>
            <div className="features-demo">
              <ModernDropdown
                label="Searchable Dropdown"
                options={[
                  'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 
                  'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon'
                ]}
                placeholder="Search fruits..."
                searchable
                clearable
              />
              
              <ModernDropdown
                label="With Icon"
                options={['USD', 'EUR', 'GBP', 'JPY']}
                placeholder="Select currency"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                }
              />
              
              <ModernDropdown
                label="Disabled State"
                options={['Option 1', 'Option 2', 'Option 3']}
                placeholder="Disabled dropdown"
                disabled
              />
              
              <ModernDropdown
                label="With Error"
                options={['Option 1', 'Option 2', 'Option 3']}
                placeholder="Select an option"
                error="This field is required"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDropdownDemo;