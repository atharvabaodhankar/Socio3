import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';

const NetworkChecker = () => {
  const { provider, chainId, isConnected } = useWeb3();
  const [networkInfo, setNetworkInfo] = useState(null);

  useEffect(() => {
    const checkNetwork = async () => {
      if (provider) {
        try {
          const network = await provider.getNetwork();
          setNetworkInfo({
            chainId: Number(network.chainId),
            name: network.name,
            isCorrect: Number(network.chainId) === 11155111
          });
        } catch (error) {
          console.error('Error checking network:', error);
        }
      }
    };

    checkNetwork();
  }, [provider, chainId]);

  if (!isConnected) {
    return (
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f0f0f0', 
        border: '1px solid #ccc',
        borderRadius: '5px',
        margin: '10px 0'
      }}>
        <strong>Wallet not connected</strong>
        <p>Please connect your wallet to use profile features.</p>
      </div>
    );
  }

  if (!networkInfo) {
    return (
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f0f0f0', 
        border: '1px solid #ccc',
        borderRadius: '5px',
        margin: '10px 0'
      }}>
        Checking network...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '10px', 
      backgroundColor: networkInfo.isCorrect ? '#d4edda' : '#f8d7da', 
      border: `1px solid ${networkInfo.isCorrect ? '#c3e6cb' : '#f5c6cb'}`,
      borderRadius: '5px',
      margin: '10px 0'
    }}>
      <strong>Network Status:</strong>
      <p>
        Connected to: {networkInfo.name} (Chain ID: {networkInfo.chainId})
      </p>
      {networkInfo.isCorrect ? (
        <p style={{ color: '#155724' }}>✅ Connected to Sepolia testnet</p>
      ) : (
        <div>
          <p style={{ color: '#721c24' }}>❌ Wrong network! Please switch to Sepolia testnet</p>
          <p>Expected: Sepolia (Chain ID: 11155111)</p>
        </div>
      )}
    </div>
  );
};

export default NetworkChecker;
</text>
</invoke>