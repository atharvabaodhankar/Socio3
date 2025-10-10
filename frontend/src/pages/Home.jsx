import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const Home = () => {
  const { isConnected, account } = useWeb3();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="mb-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-7xl md:text-8xl font-bold gradient-text mb-6 leading-tight">
              Socio3
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 font-light mb-4">
              Own Your Social
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              The first truly decentralized social platform. Create, share, and monetize your content 
              with complete ownership through blockchain technology.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mb-12">
          <div className="glass p-8 rounded-2xl card-hover">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">True Ownership</h3>
            <p className="text-gray-400 leading-relaxed">Your content lives on IPFS and Ethereum. No platform can delete or censor your posts.</p>
          </div>
          
          <div className="glass p-8 rounded-2xl card-hover">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Crypto Rewards</h3>
            <p className="text-gray-400 leading-relaxed">Earn ETH directly from your audience. No middleman, no fees, instant payments.</p>
          </div>
          
          <div className="glass p-8 rounded-2xl card-hover">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Decentralized</h3>
            <p className="text-gray-400 leading-relaxed">Built on Ethereum. No single point of failure, no corporate control, just pure Web3.</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-400 mb-6 text-lg">Ready to join the future of social media?</p>
          <div className="animate-pulse">
            <svg className="w-6 h-6 text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Stories Section */}
      <div className="mb-8">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2 cursor-pointer hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Your story</span>
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mb-2 cursor-pointer hover:scale-105 transition-transform">
                <span className="text-white font-semibold">{i}</span>
              </div>
              <span className="text-xs text-gray-400">user{i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-8">
        {/* Empty State */}
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-white">Welcome to Socio3</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            Start your decentralized social journey. Follow creators, share content, and earn crypto rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/explore" 
              className="btn-primary px-8 py-3 rounded-xl font-medium inline-flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Explore Posts</span>
            </Link>
            <Link 
              to="/upload" 
              className="glass px-8 py-3 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 inline-flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Post</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;