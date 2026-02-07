import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeGiftModal = ({ isOpen, onClose, userAddress, giftResult, isProcessing }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success state if gift was successful
  const shouldShowSuccess = giftResult?.success;

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700"
        >
          {shouldShowSuccess ? (
            /* Success State - ETH Already Sent */
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome Gift Sent!
              </h2>
              
              <p className="text-gray-400 mb-4">
                We've automatically sent {giftResult?.amount} ETH to your wallet to get you started!
              </p>

              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-green-400 font-semibold">{giftResult?.amount} ETH</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white">Sepolia Testnet</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Your Address:</span>
                  <span className="text-white text-sm font-mono">
                    {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
                  </span>
                </div>
                {giftResult?.explorerUrl && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Transaction:</span>
                    <a 
                      href={giftResult.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View on Explorer ↗
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                <p className="text-purple-300 text-sm">
                  🎉 Welcome to Socio3! You can now create posts, follow users, and tip creators with your free test ETH.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
              >
                Start Exploring! 🚀
              </button>
            </div>
          ) : giftResult && !giftResult.success ? (
            /* Error State */
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to Socio3!
              </h2>
              
              <p className="text-gray-400 mb-4">
                We tried to send you a welcome gift, but there was an issue.
              </p>

              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-400 text-sm">
                  {giftResult.error}
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                <p className="text-purple-300 text-sm">
                  Don't worry! You can still explore Socio3. You might need some Sepolia ETH for transactions.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all"
              >
                Continue to Socio3
              </button>
            </div>
          ) : (
            /* Processing State */
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to Socio3!
              </h2>
              
              <p className="text-gray-400 mb-6">
                We're sending you a welcome gift of test ETH to get you started...
              </p>

              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Gift Amount:</span>
                  <span className="text-white font-semibold">0.005 ETH</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white">Sepolia Testnet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Your Address:</span>
                  <span className="text-white text-sm font-mono">
                    {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
                  </span>
                </div>
              </div>

              <p className="text-gray-500 text-sm">
                Please wait while we process your welcome gift...
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default WelcomeGiftModal;