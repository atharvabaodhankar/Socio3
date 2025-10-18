import React, { useState, useEffect } from 'react';
import ErrorModal from './ErrorModal';

const WalletConnectionHandler = () => {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Listen for wallet connection errors
    const handleWalletError = (event) => {
      setErrorMessage(event.detail.message);
      setShowErrorModal(true);
    };

    window.addEventListener('walletError', handleWalletError);
    
    return () => {
      window.removeEventListener('walletError', handleWalletError);
    };
  }, []);

  const handleErrorClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    setErrorMessage('');
    // Trigger wallet connection retry
    window.dispatchEvent(new CustomEvent('retryWalletConnection'));
  };

  return (
    <ErrorModal
      isOpen={showErrorModal}
      onClose={handleErrorClose}
      title="Wallet Connection Failed"
      message={errorMessage}
      onRetry={handleRetry}
    />
  );
};

export default WalletConnectionHandler;