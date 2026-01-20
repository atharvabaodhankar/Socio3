import { useState, useEffect } from 'react';
import { checkUserNeedsETH, requestTestETHAdmin } from '../services/faucetService';
import { hasUserBeenWelcomed, markUserAsWelcomed } from '../services/firebaseService';

export const useWelcomeGift = (provider, userAddress) => {
  const [showWelcomeGift, setShowWelcomeGift] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [giftResult, setGiftResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkAndGiftUser = async () => {
      if (!provider || !userAddress || hasChecked || isProcessing) return;

      try {
        setIsProcessing(true);
        
        // Check if user has been welcomed before using Firebase
        const hasBeenWelcomed = await hasUserBeenWelcomed(userAddress);
        
        if (hasBeenWelcomed) {
          console.log('[WelcomeGift] User already welcomed:', userAddress);
          setHasChecked(true);
          setIsProcessing(false);
          return;
        }

        console.log('[WelcomeGift] New user detected, checking balance...');

        // Check if user needs ETH
        const needsETH = await checkUserNeedsETH(provider, userAddress);
        
        if (needsETH) {
          console.log('[WelcomeGift] User needs ETH, sending welcome gift automatically...');
          
          // Automatically send ETH to the new user
          const result = await requestTestETHAdmin(userAddress);
          setGiftResult(result);
          
          // Mark user as welcomed in Firebase with gift result
          await markUserAsWelcomed(userAddress, result);
          
          if (result.success) {
            console.log('[WelcomeGift] Gift sent successfully:', result);
            // Show the success modal
            setShowWelcomeGift(true);
          } else {
            console.error('[WelcomeGift] Failed to send gift:', result.error);
            // Still show modal so user knows we tried
            setShowWelcomeGift(true);
          }
        } else {
          // Mark as welcomed even if they don't need ETH
          await markUserAsWelcomed(userAddress, { success: false, reason: 'sufficient_balance' });
          console.log('[WelcomeGift] User has sufficient balance, marked as welcomed');
        }
        
        setHasChecked(true);
      } catch (error) {
        console.error('[WelcomeGift] Error processing new user:', error);
        // Mark as welcomed to prevent retry loops on error
        await markUserAsWelcomed(userAddress, { success: false, error: error.message });
        setHasChecked(true);
      } finally {
        setIsProcessing(false);
      }
    };

    // Delay check to ensure wallet is fully connected
    const timer = setTimeout(checkAndGiftUser, 2000);
    
    return () => clearTimeout(timer);
  }, [provider, userAddress, hasChecked, isProcessing]);

  const handleGiftReceived = (result) => {
    // This is now handled automatically in the useEffect
    setGiftResult(result);
  };

  const handleCloseGift = async () => {
    setShowWelcomeGift(false);
    
    // Ensure user is marked as welcomed if not already done
    if (userAddress) {
      const hasBeenWelcomed = await hasUserBeenWelcomed(userAddress);
      if (!hasBeenWelcomed) {
        await markUserAsWelcomed(userAddress, giftResult);
      }
    }
  };

  return {
    showWelcomeGift,
    giftResult,
    isProcessing,
    handleGiftReceived,
    handleCloseGift
  };
};