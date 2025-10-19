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
        <h1 className="text-4xl font-bold gradient-text mb-2">Search Users</h1>
        <p className="text-gray-400 text-lg">
          Search for users by their wallet address
        </p>
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-blue-300 text-sm">
            <strong>Note:</strong> Currently only wallet address search is supported. Enter a valid Ethereum address (starting with 0x) to find users.
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
            placeholder="Search by wallet address (0x...)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full glass text-white placeholder-gray-400 pl-12 pr-12 py-4 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                clearSearch();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-400"
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
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Searching...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
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
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && query && searchResults.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <p className="text-gray-400">
              Try searching with a valid wallet address (0x...)
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
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-purple-400"
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
            <p className="text-gray-400">
              Enter a wallet address to find users on Socio3
            </p>
            <div className="mt-6 text-sm text-gray-500 space-y-2">
              <p>💡 Pro tip: Use Ctrl+K from anywhere to quickly open search</p>
              <p>📝 Example: 0x1234567890123456789012345678901234567890</p>
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
    <div className="glass rounded-2xl p-6 hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center space-x-4 flex-1 cursor-pointer"
          onClick={onClick}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
            {result.profile?.profileImage ? (
              <img
                src={getIPFSUrl(result.profile.profileImage)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-lg">
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
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                  Username Match
                </span>
              )}
              {result.matchType === "displayName" && (
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                  Display Name Match
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 truncate mb-2">
              {formatAddress(result.address)}
            </p>
            {result.profile?.bio && (
              <p className="text-sm text-gray-300 line-clamp-2">
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
