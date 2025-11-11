import React from 'react';
import { useAlert } from '../../hooks/useAlert';

const Alert = () => {
  const { alert, hideAlert } = useAlert();

  if (!alert) {
    return null;
  }

  return (
    <div className={`alert ${alert.type}`}>
      <span className="alert-message">{alert.message}</span>
      <button className="alert-close" onClick={hideAlert}>
        &times;
      </button>
    </div>
  );
};

export default Alert;