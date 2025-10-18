import React from 'react';
import Modal from './Modal';

const SuccessModal = ({ isOpen, onClose, title = "Success!", message, txHash }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="success">
      <div style={{ textAlign: 'center' }}>
        <div className="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2"/>
            <path d="m9 12 2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: '500' }}>{message}</p>
        {txHash && (
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'rgba(255, 255, 255, 0.7)', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Transaction Hash:
            </p>
            <div style={{ 
              fontSize: '0.8rem', 
              wordBreak: 'break-all', 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '12px', 
              borderRadius: '8px',
              fontFamily: 'monospace',
              color: '#10b981'
            }}>
              {txHash}
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="modal-button primary" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;