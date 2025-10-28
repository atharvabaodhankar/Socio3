import React from 'react';
import { useContracts } from '../hooks/useContracts';
import { useWeb3 } from '../context/Web3Context';

const ContractStatus = () => {
  const { contractsReady, postContract, socialContract } = useContracts();
  const { isConnected, account } = useWeb3();

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-semibold mb-2">Debug: Contract Status</div>
      <div className="space-y-1">
        <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span>Wallet: {isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${postContract ? 'text-green-400' : 'text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full ${postContract ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span>PostContract: {postContract ? 'Ready' : 'Loading'}</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${socialContract ? 'text-green-400' : 'text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full ${socialContract ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span>SocialContract: {socialContract ? 'Ready' : 'Loading'}</span>
        </div>
        
        <div className={`flex items-center space-x-2 ${contractsReady ? 'text-green-400' : 'text-yellow-400'}`}>
          <div className={`w-2 h-2 rounded-full ${contractsReady ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          <span>All Ready: {contractsReady ? 'Yes' : 'No'}</span>
        </div>
        
        {account && (
          <div className="text-white/60 mt-2">
            Account: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractStatus;