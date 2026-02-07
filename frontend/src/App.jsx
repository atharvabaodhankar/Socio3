import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./context/Web3Context";
import Navbar from "./components/Navbar";
import WalletConnectionHandler from "./components/WalletConnectionHandler";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import Wallet from "./pages/Wallet";
import Admin from "./pages/Admin";
import Messages from "./pages/Messages";
// import ScrollToTop from "./components/ScrollToTop";
import { usePresence } from "./hooks/usePresence";
import { useWeb3 } from "./context/Web3Context";

// Import test utilities for development
import "./utils/testLikedPosts";
import "./utils/testPostSettings";
import "./utils/testTrending";
import "./utils/testFeed";
import "./utils/testFaucet";
import Post from "./pages/Post";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

const AppRoutes = () => {
  const { account } = useWeb3();

  // Track user presence globally
  usePresence(account);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/search" element={<Search />} />
      <Route path="/upload" element={<Upload />} />
      <Route
        path="/profile/:address?"
        element={<Profile />}
      />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/post/:postId/:authorAddress" element={<Post />} />
      <Route path="/messages" element={<Messages />} />
    </Routes>
  );
};

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Navbar />
          <WalletConnectionHandler />
          <main className="max-w-6xl mx-auto pb-20 md:pb-0">
            <AppRoutes />
          </main>
          <ScrollToTop />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
