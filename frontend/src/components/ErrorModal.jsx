import React from 'react';
import Modal from './Modal';

const ErrorModal = ({ isOpen, onClose, title = "Oops! Something went wrong", message, onRetry }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="error">
      <div style={{ textAlign: 'center' }}>
        <div className="success-icon" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'errorShake 0.5s ease-in-out'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="m15 9-6 6m0-6 6 6" 
                stroke="#ef4444" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <p style={{ fontSize: '1.1rem', marginBottom: '24px', fontWeight: '500', lineHeight: '1.5' }}>{message}</p>
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