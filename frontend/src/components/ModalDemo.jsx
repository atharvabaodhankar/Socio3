import React, { useState } from 'react';
import LoadingModal from './LoadingModal';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';

const ModalDemo = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const demoLoading = () => {
    setShowLoading(true);
    setTimeout(() => {
      setShowLoading(false);
      setShowSuccess(true);
    }, 3000);
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Modal Demo</h2>
      
      <div className="space-x-4">
        <button 
          onClick={demoLoading}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl text-white font-medium"
        >
          Demo Transaction Flow
        </button>
        
        <button 
          onClick={() => setShowError(true)}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl text-white font-medium"
        >
          Show Error Modal
        </button>
      </div>

      <LoadingModal
        isOpen={showLoading}
        title="Processing Transaction"
        message="Your transaction is being processed on the blockchain..."
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Transaction Successful!"
        message="Your transaction has been completed successfully!"
        txHash="0x1234567890abcdef1234567890abcdef12345678"
      />

      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Transaction Failed"
        message="Something went wrong with your transaction. Please try again."
        onRetry={() => {
          setShowError(false);
          demoLoading();
        }}
      />
    </div>
  );
};

export default ModalDemo;