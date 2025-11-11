import React, { useState } from 'react';
import CleanDropdown from './CleanDropdown';
import './CleanDropdownDemo.css';

const CleanDropdownDemo = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  const categoryOptions = [
    'All Types',
    'Food & Dining',
    'Transportation', 
    'Entertainment',
    'Shopping',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Other'
  ];

  const typeOptions = [
    { value: 'income', label: 'Income', description: 'Money received' },
    { value: 'expense', label: 'Expense', description: 'Money spent' },
    { value: 'transfer', label: 'Transfer', description: 'Between accounts' }
  ];

  const priorityOptions = [
    { value: 'high', label: 'High Priority', description: 'Urgent items' },
    { value: 'medium', label: 'Medium Priority', description: 'Standard items' },
    { value: 'low', label: 'Low Priority', description: 'Optional items' }
  ];

  return (
    <div className="clean-dropdown-demo">
      <div className="demo-header">
        <h2>Clean Modern Dropdown</h2>
        <p>Matches the uploaded design with clean, minimal styling</p>
      </div>

      <div className="demo-grid">
        {/* Basic Dropdown */}
        <div className="demo-section">
          <h3>Basic Dropdown</h3>
          <CleanDropdown
            label="Category"
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Select a category..."
          />
        </div>

        {/* Dropdown with Rich Options */}
        <div className="demo-section">
          <h3>Rich Options with Descriptions</h3>
          <CleanDropdown
            label="Transaction Type"
            options={typeOptions}
            value={selectedType}
            onChange={setSelectedType}
            placeholder="Choose transaction type..."
            clearable
          />
        </div>

        {/* Searchable Dropdown */}
        <div className="demo-section">
          <h3>Searchable Dropdown</h3>
          <CleanDropdown
            label="Priority Level"
            options={priorityOptions}
            value={selectedPriority}
            onChange={setSelectedPriority}
            placeholder="Search and select priority..."
            searchable
            clearable
          />
        </div>

        {/* Size Variants */}
        <div className="demo-section">
          <h3>Size Variants</h3>
          <div className="size-variants">
            <CleanDropdown
              label="Small Size"
              options={categoryOptions}
              placeholder="Small dropdown..."
              size="small"
            />
            <CleanDropdown
              label="Medium Size (Default)"
              options={categoryOptions}
              placeholder="Medium dropdown..."
              size="medium"
            />
            <CleanDropdown
              label="Large Size"
              options={categoryOptions}
              placeholder="Large dropdown..."
              size="large"
            />
          </div>
        </div>

        {/* States */}
        <div className="demo-section">
          <h3>Different States</h3>
          <div className="states-grid">
            <CleanDropdown
              label="Loading State"
              options={categoryOptions}
              placeholder="Loading..."
              loading
            />
            <CleanDropdown
              label="Disabled State"
              options={categoryOptions}
              placeholder="Disabled dropdown"
              disabled
            />
            <CleanDropdown
              label="Error State"
              options={categoryOptions}
              placeholder="Select option..."
              error="This field is required"
            />
            <CleanDropdown
              label="Success State"
              options={categoryOptions}
              value="Food & Dining"
              success
            />
          </div>
        </div>

        {/* With Icons */}
        <div className="demo-section">
          <h3>With Icons</h3>
          <CleanDropdown
            label="Category with Icon"
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Select category..."
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            }
            clearable
          />
        </div>
      </div>

      {/* Design Specifications */}
      <div className="design-specs">
        <h3>Design Specifications</h3>
        <div className="specs-grid">
          <div className="spec-item">
            <strong>Border Radius:</strong> 24px (pill shape)
          </div>
          <div className="spec-item">
            <strong>Primary Color:</strong> #3b82f6 (Blue)
          </div>
          <div className="spec-item">
            <strong>Border:</strong> 1px solid #e5e7eb
          </div>
          <div className="spec-item">
            <strong>Background:</strong> #ffffff (Clean white)
          </div>
          <div className="spec-item">
            <strong>Shadow:</strong> Subtle elevation
          </div>
          <div className="spec-item">
            <strong>Typography:</strong> System fonts
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanDropdownDemo;