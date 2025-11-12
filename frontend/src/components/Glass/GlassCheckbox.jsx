import React from 'react';

const GlassCheckbox = ({ label, checked, onChange, disabled = false }) => {
  return (
    <label className="glass-checkbox-container">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="glass-checkbox-checkmark"></span>
      {label}
    </label>
  );
};

export default GlassCheckbox;
