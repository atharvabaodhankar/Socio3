import React from 'react';
import Modal from './Modal';

const SuccessModal = ({ isOpen, onClose, title = "Success!", message, txHash }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="success">
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
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'successPulse 2s ease-in-out infinite'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M9 12l2 2 4-4" 
                stroke="#10b981" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ animation: 'checkDraw 0.8s ease-in-out 0.3s both' }}
              />
            </svg>
          </div>
        </div>
        <p style={{ fontSize: '1.1rem', marginBottom: '24px', fontWeight: '500', lineHeight: '1.5' }}>{message}</p>
        {txHash && (
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'rgba(255, 255, 255, 0.7)', 
              marginBottom: '12px',
              fontWeight: '500'
            }}>
              Transaction Hash:
            </p>
            <div style={{ 
              fontSize: '0.85rem', 
              wordBreak: 'break-all', 
              background: 'rgba(16, 185, 129, 0.05)', 
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '16px', 
              borderRadius: '12px',
              fontFamily: 'monospace',
              color: '#10b981',
              letterSpacing: '0.5px'
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