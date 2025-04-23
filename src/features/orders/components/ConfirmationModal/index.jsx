import React from 'react';
import './styles.scss';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div 
        className="confirmation-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirmation-modal-content">
          <h3 className="confirmation-title">{title}</h3>
          <p className="confirmation-message">{message}</p>
          
          <div className="confirmation-actions">
            <button 
              className="cancel-button"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button 
              className="confirm-button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 