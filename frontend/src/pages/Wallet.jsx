import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";

const Wallet = () => {
  const { account, provider, isConnected, formatAddress } = useWeb3();
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && provider && account) {
      fetchBalance();
    }
  }, [isConnected, provider, account]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">
          Connect Wallet to View Details
        </h2>
        <p className="text-white/60">
          Connect your wallet to view your balance and transaction history.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-white/60">
          Manage your crypto assets and view transaction history
        </p>
      </div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Balance Card */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">ETH Balance</h3>
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold mb-2">
                {parseFloat(balance).toFixed(4)} ETH
              </div>
              <div className="text-sm opacity-80">
                ≈ ${(parseFloat(balance) * 2000).toFixed(2)} USD
              </div>
            </>
          )}
        </div>

        {/* Wallet Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Wallet Address</h3>
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <div className="font-mono text-sm bg-white/5 border border-white/10 p-3 rounded-lg mb-4 text-white">
            {account}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(account)}
            className="bg-white hover:bg-white/80 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Copy Address
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <svg
            className="w-8 h-8 text-white mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            />
          </svg>
          <div className="text-2xl font-bold text-white">2.5 ETH</div>
          <div className="text-sm text-white/60">Tips Received</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <svg
            className="w-8 h-8 text-white mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
          <div className="text-2xl font-bold text-white">0.8 ETH</div>
          <div className="text-sm text-white/60">Tips Sent</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <svg
            className="w-8 h-8 text-white mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <div className="text-2xl font-bold text-white">42</div>
          <div className="text-sm text-white/60">Total Transactions</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>

        <div className="space-y-4">
          {/* Sample transactions */}
          {[
            {
              type: "received",
              amount: "0.05",
              from: "0x1234...5678",
              time: "2 hours ago",
            },
            {
              type: "sent",
              amount: "0.02",
              to: "0x9876...4321",
              time: "1 day ago",
            },
            {
              type: "received",
              amount: "0.1",
              from: "0x5555...9999",
              time: "3 days ago",
            },
          ].map((tx, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === "received"
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {tx.type === "received" ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {tx.type === "received" ? "Tip Received" : "Tip Sent"}
                  </div>
                  <div className="text-sm text-white/60">
                    {tx.type === "received"
                      ? `From ${formatAddress(tx.from)}`
                      : `To ${formatAddress(tx.to)}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-medium ${
                    tx.type === "received" ? "text-white" : "text-white/80"
                  }`}
                >
                  {tx.type === "received" ? "+" : "-"}
                  {tx.amount} ETH
                </div>
                <div className="text-sm text-white/60">{tx.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-2 rounded-lg font-medium transition-colors text-white">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
