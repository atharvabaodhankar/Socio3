import React from 'react';
import Modal from './Modal';

const LoadingModal = ({ isOpen, title = "Processing Transaction", message = "Please wait while your transaction is being processed..." }) => {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={title} type="loading">
      <div className="loading-spinner">
        <div className="spinner">
          <div className="spinner-inner"></div>
          <div className="spinner-dot"></div>
        </div>
        <p className="loading-text">{message}</p>
        <p className="loading-subtext">This may take a few moments. Please don't close this window.</p>
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: 'rgba(102, 126, 234, 0.08)', 
          border: '1px solid rgba(102, 126, 234, 0.15)',
          borderRadius: '12px',
          fontSize: '0.9rem',
          color: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          <span>Your transaction is being confirmed on the Ethereum blockchain</span>
        </div>
      </div>
    </Modal>
  );
};

export default LoadingModal;