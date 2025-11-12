import React from 'react';

const GlassToggle = ({ checked, onChange, disabled = false }) => {
  return (
    <label className="glass-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="glass-toggle-slider"></span>
    </label>
  );
};

export default GlassToggle;
