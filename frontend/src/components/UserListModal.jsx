import React from 'react';
import FollowButton from './FollowButton';
import { getIPFSUrl } from '../config/pinata';
import { useNavigate } from 'react-router-dom';

const UserListItem = ({ user, onClose }) => {
  const navigate = useNavigate();
  const address = user.address || user.userAddress; // handle inconsistent naming
  
  return (
    <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
      <div 
        className="flex items-center space-x-3 cursor-pointer flex-1"
        onClick={() => {
          navigate(`/profile/${address}`);
          onClose();
        }}
      >
        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
          {user.profileImage ? (
            <img 
              src={getIPFSUrl(user.profileImage)} 
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {(user.username || address || '?').substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium text-white">
            {user.displayName || user.username || `${address.slice(0, 6)}...${address.slice(-4)}`}
          </h4>
          <p className="text-xs text-white/50">
            {user.username ? `@${user.username}` : user.bio ? user.bio.substring(0, 30) + (user.bio.length > 30 ? '...' : '') : address}
          </p>
        </div>
      </div>
      
      <FollowButton 
        userAddress={address}
        size="small"
        variant="secondary"
      />
    </div>
  );
};

const UserListModal = ({ isOpen, onClose, title, users = [], loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-[#1a1b1e] border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-4 flex-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-1">
              {users.map((user) => (
                <UserListItem 
                  key={user.address || user.userAddress} 
                  user={user} 
                  onClose={onClose}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/40">
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
