import React from 'react';
import Modal from './Modal';

const SuccessModal = ({ isOpen, onClose, title = "Success!", message, txHash }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="success">
      <div style={{ textAlign: 'center' }}>
        <div className="success-icon">🎉</div>
        <p>{message}</p>
        {txHash && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '0.9rem', opacity: '0.9' }}>Transaction Hash:</p>
            <p style={{ 
              fontSize: '0.8rem', 
              wordBreak: 'break-all', 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '8px', 
              borderRadius: '4px',
              fontFamily: 'monospace'
            }}>
              {txHash}
            </p>
          </div>
        )}
        <div className="modal-actions">
          <button className="modal-button primary" onClick={onClose}>
            Awesome!
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;