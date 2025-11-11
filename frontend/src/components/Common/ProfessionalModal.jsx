import React, { useEffect, useRef } from 'react';
import './ProfessionalModal.css';

const ProfessionalModal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  type = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalClasses = [
    'professional-modal',
    `modal-${size}`,
    type !== 'default' ? `${type}-modal` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={overlayRef}
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={handleOverlayClick}
      {...props}
    >
      <div ref={modalRef} className={modalClasses}>
        {(title || showCloseButton) && (
          <div className="modal-header">
            <div>
              {title && <h2 className="modal-title">{title}</h2>}
              {subtitle && <p className="modal-subtitle">{subtitle}</p>}
            </div>
            {showCloseButton && (
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirmation Modal Component
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  loading = false,
  ...props
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  const footer = (
    <>
      <button
        className="professional-btn professional-btn-secondary"
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </button>
      <button
        className={`professional-btn ${
          type === 'danger' ? 'professional-btn-danger' : 'professional-btn-primary'
        } ${loading ? 'btn-loading' : ''}`}
        onClick={onConfirm}
        disabled={loading}
      >
        {confirmText}
      </button>
    </>
  );

  return (
    <ProfessionalModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      type="confirmation"
      footer={footer}
      {...props}
    >
      <div className={`confirmation-icon ${type}`}>
        {getIcon()}
      </div>
      <h3 className="confirmation-title">{title}</h3>
      <p className="confirmation-message">{message}</p>
    </ProfessionalModal>
  );
};

// Loading Modal Component
export const LoadingModal = ({
  isOpen,
  title = "Loading...",
  message = "Please wait while we process your request.",
  spinner = "classic",
  ...props
}) => {
  const renderSpinner = () => {
    switch (spinner) {
      case 'pulse':
        return <div className="spinner spinner-pulse" />;
      case 'dots':
        return (
          <div className="spinner spinner-dots">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        );
      case 'wave':
        return (
          <div className="spinner spinner-wave">
            <div className="bar" />
            <div className="bar" />
            <div className="bar" />
            <div className="bar" />
            <div className="bar" />
          </div>
        );
      case 'ring':
        return <div className="spinner spinner-ring" />;
      default:
        return <div className="spinner spinner-classic" />;
    }
  };

  return (
    <ProfessionalModal
      isOpen={isOpen}
      size="sm"
      type="loading"
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEscape={false}
      {...props}
    >
      {renderSpinner()}
      <div className="loading-text">{title}</div>
      <div className="loading-subtext">{message}</div>
    </ProfessionalModal>
  );
};

// Form Modal Component
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  size = "md",
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const footer = (
    <>
      <button
        type="button"
        className="professional-btn professional-btn-secondary"
        onClick={onClose}
        disabled={loading}
      >
        {cancelText}
      </button>
      <button
        type="submit"
        form="modal-form"
        className={`professional-btn professional-btn-primary ${loading ? 'btn-loading' : ''}`}
        disabled={loading}
      >
        {submitText}
      </button>
    </>
  );

  return (
    <ProfessionalModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      type="form"
      footer={footer}
      {...props}
    >
      <form id="modal-form" onSubmit={handleSubmit} className="professional-form">
        {children}
      </form>
    </ProfessionalModal>
  );
};

export default ProfessionalModal;