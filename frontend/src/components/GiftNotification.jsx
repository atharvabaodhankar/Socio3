import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GiftNotification = ({ show, onClose, giftData }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-4 border border-green-500/30">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🎁</span>
                </div>
              </div>
              
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-white">
                  Welcome Gift Received!
                </h3>
                <p className="text-xs text-green-100 mt-1">
                  {giftData?.amount} ETH has been sent to your wallet
                </p>
                
                {giftData?.explorerUrl && (
                  <a
                    href={giftData.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-200 hover:text-white underline mt-1 inline-block"
                  >
                    View Transaction ↗
                  </a>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-2 text-green-200 hover:text-white"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GiftNotification;