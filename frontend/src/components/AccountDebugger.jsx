import React from 'react';
import { useWeb3 } from '../context/Web3Context';

const AccountDebugger = () => {
  const { account, isConnected, provider } = useWeb3();

  if (!isConnected) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <div><strong>Debug Info:</strong></div>
      <div>Account: {account}</div>
      <div>Provider: {provider ? 'Connected' : 'None'}</div>
      <div>Time: {new Date().toLocaleTimeString()}</div>
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginTop: '5px',
          padding: '5px 10px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Force Refresh
      </button>
    </div>
  );
};

export default AccountDebugger;
</text>
</invoke>