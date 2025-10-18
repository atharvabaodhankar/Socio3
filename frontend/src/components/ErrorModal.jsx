import React from 'react';
import Modal from './Modal';

const ErrorModal = ({ isOpen, onClose, title = "Oops! Something went wrong", message, onRetry }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="error">
      <div style={{ textAlign: 'center' }}>
        <div className="success-icon">❌</div>
        <p>{message}</p>
        <div className="modal-actions">
          {onRetry && (
            <button className="modal-button" onClick={onRetry}>
              Try Again
            </button>
          )}
          <button className="modal-button primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;