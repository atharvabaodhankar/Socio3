import { useState } from 'react';
import { requestTestETHAdmin } from '../services/faucetService';

const FaucetButton = ({ userAddress, onSuccess }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [result, setResult] = useState(null);

  const handleRequestETH = async () => {
    if (!userAddress) return;
    
    setIsRequesting(true);
    setResult(null);
    
    try {
      const response = await requestTestETHAdmin(userAddress);
      setResult(response);
      
      if (response.success && onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Sepolia Faucet</h3>
          <p className="text-sm text-gray-400">Get test ETH for transactions</p>
        </div>
        <div className="text-2xl">🚰</div>
      </div>
      
      {result && (
        <div className={`mb-3 p-3 rounded-lg ${
          result.success 
            ? 'bg-green-900/20 border border-green-500/30' 
            : 'bg-red-900/20 border border-red-500/30'
        }`}>
          {result.success ? (
            <div>
              <p className="text-green-400 text-sm font-medium">
                ✅ Successfully received {result.amount} ETH!
              </p>
              {result.explorerUrl && (
                <a
                  href={result.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-300 hover:text-green-200 text-xs underline mt-1 inline-block"
                >
                  View Transaction ↗
                </a>
              )}
            </div>
          ) : (
            <p className="text-red-400 text-sm">
              ❌ {result.error}
            </p>
          )}
        </div>
      )}
      
      <button
        onClick={handleRequestETH}
        disabled={isRequesting || !userAddress}
        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isRequesting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Requesting...
          </>
        ) : (
          <>
            <span className="mr-2">🎁</span>
            Request Test ETH
          </>
        )}
      </button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Free Sepolia testnet ETH • 0.005 ETH per request
      </p>
    </div>
  );
};

export default FaucetButton;