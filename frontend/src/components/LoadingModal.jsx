import React from 'react';
import Modal from './Modal';

const LoadingModal = ({ isOpen, title = "Processing Transaction", message = "Please wait while your transaction is being processed..." }) => {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={title} type="loading">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p className="loading-text">{message}</p>
        <p className="loading-subtext">This may take a few moments. Please don't close this window.</p>
      </div>
    </Modal>
  );
};

export default LoadingModal;