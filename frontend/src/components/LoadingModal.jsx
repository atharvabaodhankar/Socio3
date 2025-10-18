import React from 'react';
import Modal from './Modal';

const LoadingModal = ({ isOpen, title = "Processing Transaction", message = "Please wait while your transaction is being processed..." }) => {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={title} type="loading">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p className="loading-text">{message}</p>
        <p className="loading-subtext">This may take a few moments. Please don't close this window.</p>
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'rgba(102, 126, 234, 0.1)', 
          border: '1px solid rgba(102, 126, 234, 0.2)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          💡 Tip: Your transaction is being confirmed on the Ethereum blockchain
        </div>
      </div>
    </Modal>
  );
};

export default LoadingModal;