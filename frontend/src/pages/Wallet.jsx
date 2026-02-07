import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import { 
  getUserTipStats, 
  getRecentTransactions, 
  formatRelativeTime,
  getEtherscanLink,
  copyToClipboard,
  getWelcomeGiftStatus
} from "../services/walletService";
import { requestTestETHAdmin } from "../services/faucetService";

const Wallet = () => {
  const navigate = useNavigate();
  const { account, provider, isConnected, formatAddress } = useWeb3();
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(true);
  const [tipStats, setTipStats] = useState({
    totalReceived: '0',
    totalSent: '0',
    receivedCount: 0,
    sentCount: 0,
    recentTips: []
  });
  const [transactions, setTransactions] = useState([]);
  const [welcomeGift, setWelcomeGift] = useState({ received: false });
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [requestingFaucet, setRequestingFaucet] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState('');

  useEffect(() => {
    if (isConnected && provider && account) {
      fetchAllData();
    }
  }, [isConnected, provider, account]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchBalance(),
      fetchTipStats(),
      fetchTransactions(),
      fetchWelcomeGift()
    ]);
    setLoading(false);
  };

  const fetchBalance = async () => {
    try {
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchTipStats = async () => {
    try {
      const stats = await getUserTipStats(account);
      setTipStats(stats);
    } catch (error) {
      console.error("Error fetching tip stats:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const txs = await getRecentTransactions(account, 20);
      setTransactions(txs);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchWelcomeGift = async () => {
    try {
      const gift = await getWelcomeGiftStatus(account);
      setWelcomeGift(gift);
    } catch (error) {
      console.error("Error fetching welcome gift:", error);
    }
  };

  const handleCopyAddress = async () => {
    const success = await copyToClipboard(account);
    if (success) {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleRequestFaucet = async () => {
    setRequestingFaucet(true);
    setFaucetMessage('');
    
    try {
      const result = await requestTestETHAdmin(account);
      
      if (result.success) {
        setFaucetMessage('✅ Successfully received 0.005 ETH! Refreshing balance...');
        setTimeout(() => {
          fetchBalance();
          setFaucetMessage('');
        }, 3000);
      } else {
        setFaucetMessage(`❌ ${result.error || 'Failed to request ETH. Please try again later.'}`);
      }
    } catch (error) {
      setFaucetMessage(`❌ ${error.message || 'Failed to request ETH'}`);
    } finally {
      setRequestingFaucet(false);
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  const displayedTransactions = showAllTransactions 
    ? transactions 
    : transactions.slice(0, 5);

  const totalTransactions = tipStats.receivedCount + tipStats.sentCount;
  const netBalance = parseFloat(tipStats.totalReceived) - parseFloat(tipStats.totalSent);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-white">
          Connect Wallet to View Details
        </h2>
        <p className="text-white/60 max-w-md">
          Connect your wallet to view your balance, transaction history, and manage your crypto assets.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">Wallet</h1>
          <p className="text-white/60 text-lg">
            Manage your crypto assets and view transaction history
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 text-white disabled:opacity-50"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <div className="text-white/60 text-sm mb-2">Total Balance</div>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-white/20 rounded w-48 mb-2"></div>
                <div className="h-6 bg-white/20 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-5xl font-bold text-white mb-2">
                  {parseFloat(balance).toFixed(4)} <span className="text-3xl text-white/60">ETH</span>
                </div>
                <div className="text-xl text-white/60">
                  ≈ ${(parseFloat(balance) * 2000).toFixed(2)} USD
                </div>
              </>
            )}
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => window.open(getEtherscanLink(account), '_blank')}
              className="bg-white hover:bg-white/90 text-black px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>View on Etherscan</span>
            </button>
            
            {parseFloat(balance) < 0.01 && (
              <button
                onClick={handleRequestFaucet}
                disabled={requestingFaucet}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {requestingFaucet ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Requesting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span>Request Test ETH</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {faucetMessage && (
          <div className={`mt-4 p-3 rounded-xl ${faucetMessage.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {faucetMessage}
          </div>
        )}
      </div>

      {/* Wallet Info Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Wallet Address</h3>
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div className="font-mono text-sm bg-white/5 border border-white/10 p-4 rounded-xl mb-4 text-white break-all">
          {account}
        </div>
        <button
          onClick={handleCopyAddress}
          className="bg-white hover:bg-white/90 text-black px-6 py-3 rounded-xl font-medium transition-colors w-full flex items-center justify-center space-x-2"
        >
          {copiedAddress ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Address</span>
            </>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {loading ? '...' : tipStats.totalReceived} ETH
          </div>
          <div className="text-sm text-white/60">Tips Received</div>
          <div className="text-xs text-white/40 mt-1">{tipStats.receivedCount} transactions</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {loading ? '...' : tipStats.totalSent} ETH
          </div>
          <div className="text-sm text-white/60">Tips Sent</div>
          <div className="text-xs text-white/40 mt-1">{tipStats.sentCount} transactions</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {loading ? '...' : totalTransactions}
          </div>
          <div className="text-sm text-white/60">Total Transactions</div>
          <div className="text-xs text-white/40 mt-1">All time</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${netBalance >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-xl flex items-center justify-center`}>
              <svg className={`w-5 h-5 ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className={`text-2xl font-bold mb-1 ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {loading ? '...' : `${netBalance >= 0 ? '+' : ''}${netBalance.toFixed(4)}`} ETH
          </div>
          <div className="text-sm text-white/60">Net Tips</div>
          <div className="text-xs text-white/40 mt-1">Received - Sent</div>
        </div>
      </div>

      {/* Welcome Gift Status */}
      {welcomeGift.received && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Welcome Gift Received! 🎉</h3>
              <p className="text-white/60 text-sm">
                You received {welcomeGift.amount} ETH as a welcome gift to get started on Socio3
              </p>
              {welcomeGift.txHash && (
                <button
                  onClick={() => window.open(getEtherscanLink(welcomeGift.txHash, 'tx'), '_blank')}
                  className="text-yellow-400 hover:text-yellow-300 text-sm mt-2 flex items-center space-x-1"
                >
                  <span>View Transaction</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
          {transactions.length > 5 && (
            <button
              onClick={() => setShowAllTransactions(!showAllTransactions)}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              {showAllTransactions ? 'Show Less' : `View All (${transactions.length})`}
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-white/10 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">No Transactions Yet</h4>
            <p className="text-white/60 mb-6">Start tipping creators to see your transaction history here</p>
            <button
              onClick={() => navigate('/explore')}
              className="bg-white hover:bg-white/90 text-black px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Explore Posts
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => tx.transactionHash && window.open(getEtherscanLink(tx.transactionHash, 'tx'), '_blank')}
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.type === "received"
                        ? "bg-green-500/20"
                        : "bg-red-500/20"
                    }`}
                  >
                    {tx.type === "received" ? (
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white flex items-center space-x-2">
                      <span>{tx.type === "received" ? "Tip Received" : "Tip Sent"}</span>
                      {tx.postId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/post/${tx.postId}/${tx.type === 'received' ? tx.fromAddress : tx.toAddress}`);
                          }}
                          className="text-xs text-white/60 hover:text-white transition-colors"
                        >
                          View Post →
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-white/60 truncate">
                      {tx.type === "received" ? (
                        <>From: {tx.fromName || formatAddress(tx.fromAddress)}</>
                      ) : (
                        <>To: {tx.toName || formatAddress(tx.toAddress)}</>
                      )}
                    </div>
                    {tx.message && (
                      <div className="text-xs text-white/40 truncate mt-1">
                        "{tx.message}"
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div
                    className={`font-semibold text-lg ${
                      tx.type === "received" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tx.type === "received" ? "+" : "-"}
                    {parseFloat(tx.amount).toFixed(4)} ETH
                  </div>
                  <div className="text-sm text-white/60">
                    {formatRelativeTime(tx.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {transactions.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={() => window.open(getEtherscanLink(account), '_blank')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-xl font-medium transition-colors text-white flex items-center justify-center space-x-2 mx-auto"
            >
              <span>View All on Etherscan</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
