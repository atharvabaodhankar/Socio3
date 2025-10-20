import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider, useWeb3 } from "./context/Web3Context";
import Navbar from "./components/Navbar";
import WalletConnectionHandler from "./components/WalletConnectionHandler";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import Wallet from "./pages/Wallet";

// Import test utilities for development
import "./utils/testLikedPosts";
import "./utils/testPostSettings";
import "./utils/testTrending";
import "./utils/testFeed";
import Post from "./pages/Post";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

const AppRoutes = () => {
  const { account } = useWeb3();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/search" element={<Search />} />
      <Route path="/upload" element={<Upload />} />
      <Route
        path="/profile/:address?"
        element={<Profile key={account || "no-account"} />}
      />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/post/:postId/:authorAddress" element={<Post />} />
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
          <main className="max-w-6xl mx-auto">
            <AppRoutes />
          </main>
          <ScrollToTop />
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
