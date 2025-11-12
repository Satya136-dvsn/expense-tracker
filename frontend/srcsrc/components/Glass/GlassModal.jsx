import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, scaleIn, stagger } from '../../utils/animations';
import './GlassModal.css';

const GlassModal = ({
  isOpen = false,
  onClose,
  title = '',
  children,
  ...props
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          variants={fadeIn}
          initial="initial"
          animate="animate"
          exit="initial"
          onClick={onClose}
        >
          <motion.div
            className="modal-content"
            variants={scaleIn}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div variants={stagger()}>
              <div className="modal-header">
                <h2 className="modal-title">{title}</h2>
              </div>
              <div className="modal-body">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlassModal;
