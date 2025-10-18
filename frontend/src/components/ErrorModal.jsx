import React from 'react';
import Modal from './Modal';

const ErrorModal = ({ isOpen, onClose, title = "Oops! Something went wrong", message, onRetry }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="error">
      <div style={{ textAlign: 'center' }}>
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="2"/>
            <path d="m15 9-6 6m0-6 6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: '500' }}>{message}</p>
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