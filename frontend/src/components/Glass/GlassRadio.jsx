import React from 'react';

const GlassRadio = ({ label, checked, onChange, disabled = false, name }) => {
  return (
    <label className="glass-radio-container">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        name={name}
      />
      <span className="glass-radio-checkmark"></span>
      {label}
    </label>
  );
};

export default GlassRadio;
