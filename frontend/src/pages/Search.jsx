import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSearch } from "../hooks/useSearch";
import { useWeb3 } from "../context/Web3Context";
import { getDisplayName } from "../services/profileService";
import { getIPFSUrl } from "../config/pinata";
import FollowButton from "../components/FollowButton";
import AutoScrollButton from "../components/AutoScrollButton";

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatAddress, isConnected } = useWeb3();
  const { searchResults, loading, error, searchUsers, clearSearch } =
    useSearch();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query);
        setSearchParams({ q: query });
      } else {
        clearSearch();
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  const handleUserClick = (address) => {
    navigate(`/profile/${address}`);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet to Search</h2>
        <p className="text-gray-400">
          Connect your wallet to search for users and discover the community.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Search Users</h1>
        <p className="text-white/60 text-lg">
          Find and connect with creators in the Socio3 community
        </p>
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-white/80 text-sm">
            <strong>Enhanced Search:</strong> Search by username, display name,
            bio keywords, or wallet address. Our search is powered by Firebase
            for fast results!
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by username, name, or wallet address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/40 pl-12 pr-12 py-4 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                clearSearch();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div>
        {loading && (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Searching...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Search Error
            </h3>
            <p className="text-white/60">{error}</p>
          </div>
        )}

        {!loading && !error && query && searchResults.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Users Found
            </h3>
            <p className="text-white/60">
              Try searching by username, display name, or wallet address
            </p>
          </div>
        )}

        {!loading && searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">
              Search Results ({searchResults.length})
            </h2>
            <div className="grid gap-4">
              {searchResults.map((result) => (
                <SearchResultCard
                  key={result.address}
                  result={result}
                  onClick={() => handleUserClick(result.address)}
                  formatAddress={formatAddress}
                />
              ))}
            </div>
          </div>
        )}

        {!query && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Search for Users
            </h3>
            <p className="text-white/60">
              Search by username, display name, bio, or wallet address
            </p>
            <div className="mt-6 text-sm text-white/40 space-y-2">
              <p>💡 Pro tip: Use Ctrl+K from anywhere to quickly open search</p>
              <p>🔍 Examples: "alice", "developer", "0x1234..."</p>
            </div>
          </div>
        )}
      </div>

      {/* Auto Scroll Button */}
      <AutoScrollButton />
    </div>
  );
};

const SearchResultCard = ({ result, onClick, formatAddress }) => {
  const displayName = getDisplayName(result.profile, result.address);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center space-x-4 flex-1 cursor-pointer"
          onClick={onClick}
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
            {result.profile?.profileImage ? (
              <img
                src={getIPFSUrl(result.profile.profileImage)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-black font-semibold text-lg">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-white text-lg truncate">
                {displayName}
              </h3>
              {result.matchType === "username" && (
                <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full">
                  Username Match
                </span>
              )}
              {result.matchType === "displayName" && (
                <span className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full">
                  Display Name Match
                </span>
              )}
            </div>
            <p className="text-sm text-white/60 truncate mb-2">
              {formatAddress(result.address)}
            </p>
            {result.profile?.bio && (
              <p className="text-sm text-white/80 line-clamp-2">
                {result.profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="ml-4">
          <FollowButton
            userAddress={result.address}
            size="medium"
            variant="primary"
            showFollowerCount={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;
