import React from 'react';
import { useContracts } from '../hooks/useContracts';
import { useWeb3 } from '../context/Web3Context';

const ContractStatus = () => {
  const { isConnected } = useWeb3();
  const { socialContract, postContract } = useContracts();

  if (!isConnected) return null;

  const isReady = socialContract && postContract;

  return (
    <div className={`fixed top-20 right-4 z-30 px-3 py-2 rounded-lg text-xs transition-all duration-300 ${
      isReady 
        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          isReady ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
        }`} />
        <span>
          {isReady ? 'Contracts Ready' : 'Loading Contracts...'}
        </span>
      </div>
    </div>
  );
};

export default ContractStatus;