import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { saveTipMessage } from '../services/tipService';
import { getUserProfile, getDisplayName } from '../services/profileService';

const TipModal = ({ isOpen, onClose, recipientAddress, recipientName }) => {
  const { account, provider, signer, isConnected } = useWeb3();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState('0');

  const predefinedAmounts = ['0.001', '0.005', '0.01', '0.05', '0.1'];

  // Load user balance when modal opens
  React.useEffect(() => {
    if (isOpen && isConnected && provider && account) {
      loadBalance();
    }
  }, [isOpen, isConnected, provider, account]);

  const loadBalance = async () => {
    try {
      const balance = await provider.getBalance(account);
      const balanceInEth = ethers.formatEther(balance);
      setBalance(parseFloat(balanceInEth).toFixed(4));
    } catch (error) {
      console.error('Error loading balance:', error);
      setBalance('0');
    }
  };

  const handleTip = async () => {
    if (!amount || !recipientAddress || !signer) return;

    // Validate amount
    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(balance);
    
    if (amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amountNum > balanceNum) {
      setError('Insufficient balance');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const amountWei = ethers.parseEther(amount);

      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: amountWei,
      });

      const receipt = await tx.wait();
      
      // Save tip message to Firebase if there's a message
      if (message.trim() || true) { // Always save tip record
        try {
          // Try to get sender's profile info
          let senderName = account;
          try {
            const senderProfile = await getUserProfile(provider, account);
            if (senderProfile && senderProfile.exists) {
              senderName = getDisplayName(senderProfile, account);
            }
          } catch (profileError) {
            console.log('Could not load sender profile, using address');
          }

          const tipData = {
            fromAddress: account,
            toAddress: recipientAddress,
            amount: amount,
            message: message.trim(),
            transactionHash: receipt.hash,
            fromName: senderName,
            toName: recipientName
          };
          console.log('Saving tip message to Firebase:', tipData);
          await saveTipMessage(tipData);
          console.log('Tip message saved to Firebase successfully');
        } catch (firebaseError) {
          console.error('Error saving tip message:', firebaseError);
          // Don't fail the tip if Firebase fails
        }
      }
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setAmount('');
        setMessage('');
      }, 2000);

    } catch (error) {
      console.error('Tip error:', error);
      setError(error.message || 'Failed to send tip');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setAmount('');
      setMessage('');
      setError('');
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 z-[999]"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div 
          className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {success ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Tip Sent!</h3>
              <p className="text-gray-400">Your tip of {amount} ETH has been sent successfully.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Send Tip</h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  disabled={loading}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {!isConnected ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h3>
                    <p className="text-gray-400 mb-4">Please connect your wallet to send tips.</p>
                    <button
                      onClick={handleClose}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Recipient Info */}
                    <div className="text-center mb-6">
                      <p className="text-gray-400 mb-1">Sending tip to</p>
                      <p className="text-white font-semibold">{recipientName}</p>
                      <p className="text-gray-500 text-sm">{recipientAddress?.slice(0, 6)}...{recipientAddress?.slice(-4)}</p>
                    </div>

                {/* Amount Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-300">Amount (ETH)</label>
                    <span className="text-sm text-gray-400">Balance: {balance} ETH</span>
                  </div>
                  
                  {/* Predefined amounts */}
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {predefinedAmounts.map((preAmount) => (
                      <button
                        key={preAmount}
                        onClick={() => setAmount(preAmount)}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                          amount === preAmount
                             ? 'bg-purple-500 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                        disabled={loading}
                      >
                        {preAmount}
                      </button>
                    ))}
                  </div>

                  {/* Custom amount input */}
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Custom amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-800 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
                    disabled={loading}
                  />
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message (optional)</label>
                  <textarea
                    placeholder="Add a message with your tip..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 text-white placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 resize-none"
                    disabled={loading}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTip}
                    disabled={!amount || loading || !recipientAddress}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      `Send ${amount || '0'} ETH`
                    )}
                  </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default TipModal;