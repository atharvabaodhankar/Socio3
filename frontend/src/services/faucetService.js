// Faucet service for gifting Sepolia ETH to new users
const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API_URL || 'https://sepolia-faucet-service.vercel.app/api/faucet';
const MASTER_PASSWORD = import.meta.env.VITE_FAUCET_MASTER_PASSWORD;

export const requestTestETHAdmin = async (address) => {
  try {
    console.log(`[Faucet] Requesting test ETH for new user: ${address}`);
    
    const response = await fetch(FAUCET_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        address,
        masterPassword: MASTER_PASSWORD
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Faucet request failed');
    }

    console.log('[Faucet] Success:', data);
    return {
      success: true,
      transactionHash: data.transactionHash,
      amount: data.amount,
      explorerUrl: data.explorerUrl,
      message: data.message
    };
  } catch (error) {
    console.error('[Faucet] Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export const checkFaucetStatus = async () => {
  try {
    const response = await fetch('https://sepolia-faucet-service.vercel.app/api/status');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Faucet] Status check failed:', error);
    return null;
  }
};

// Check if user needs ETH (balance < 0.001 ETH)
export const checkUserNeedsETH = async (provider, address) => {
  try {
    const balance = await provider.getBalance(address);
    const balanceInEth = parseFloat(balance.toString()) / 1e18;
    
    console.log(`[Faucet] User balance: ${balanceInEth} ETH`);
    
    // If balance is less than 0.001 ETH, user needs funding
    return balanceInEth < 0.001;
  } catch (error) {
    console.error('[Faucet] Balance check failed:', error);
    return true; // Assume they need ETH if check fails
  }
};