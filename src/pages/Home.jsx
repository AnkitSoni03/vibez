import React, { useEffect, useState } from "react";
import appwriteService from "../appwrite/config";
import { Container, PostCard, Loader } from "../components";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  RefreshCw,
  Search,
  User,
  Bell,
  Home as HomeIcon,
} from "lucide-react";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!userData?.$id) return;
        setLoading(true);
        const postsData = await appwriteService.getPosts(userData.$id);
        setPosts(postsData?.documents || []);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userData]);

  const handleRefresh = async () => {
    if (!userData?.$id) return;
    setLoading(true);
    try {
      const postsData = await appwriteService.getPosts(userData.$id);
      setPosts(postsData?.documents || []);
      setError(null);
    } catch (error) {
      console.error("Failed to refresh posts:", error);
      setError("Failed to refresh posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts
    .filter(
      (post) =>
        post.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.Content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (activeTab === "latest") {
        return new Date(b.$createdAt) - new Date(a.$createdAt);
      } else if (activeTab === "popular") {
        return (b.likes || 0) - (a.likes || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-gray-800/80 backdrop-blur-sm rounded-xl max-w-md border border-gray-700/50 shadow-xl"
        >
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2.5 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-white flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <RefreshCw size={18} />
            <span>Retry</span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-6 md:py-12 p-4"
      >
        <Container>
          <div className="text-center py-8 md:py-16">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500"
            >
              Welcome to VIBEZ
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-gray-400 mb-8"
            >
              {authStatus
                ? "Create your first post!"
                : "Login to explore and create posts!"}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/80 backdrop-blur-sm p-6 md:p-8 rounded-xl max-w-2xl mx-auto border border-gray-700/50 shadow-xl"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={32} className="text-white" />
                </div>
              </div>

              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Share your thoughts, ideas, and creativity with the community.
                Connect with like-minded people and explore a world of
                inspiration.
              </p>

              {!authStatus ? (
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <Link
                  to="/add-post"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  <PlusCircle size={20} />
                  <span>Create Your First Post</span>
                </Link>
              )}
            </motion.div>
          </div>
        </Container>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black relative pb-16 p-1">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-gray-900 shadow-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          {/* App Header with Logo */}
          <div className="flex justify-between items-center px-4 py-2">
            <div className="text-indigo-400 font-bold text-xl">VIBEZ</div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-white">
                <Bell size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <User size={20} />
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex justify-around border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-3 font-medium relative ${
                activeTab === "all"
                  ? "text-indigo-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              All Posts
              {activeTab === "all" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("latest")}
              className={`px-4 py-3 font-medium relative ${
                activeTab === "latest"
                  ? "text-indigo-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Latest
              {activeTab === "latest" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("popular")}
              className={`px-4 py-3 font-medium relative ${
                activeTab === "popular"
                  ? "text-indigo-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Popular
              {activeTab === "popular" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with padding to account for fixed header and footer */}
      <Container>
        <div className="pt-28 pb-4">
          <h1 className="text-xl md:text-xl font-bold text-gray-300 text-center mb-6 md:mb-8">
            {authStatus ? "Your Feed" : "Latest Posts"}
          </h1>

          {filteredPosts.length === 0 ? (
            <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700/50">
              <Search size={32} className="mx-auto mb-4 text-gray-500" />
              <h2 className="text-xl font-semibold text-white mb-2">
                No matching posts found
              </h2>
              <p className="text-gray-400">
                Try adjusting your search or explore different categories
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <AnimatePresence>
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.$id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PostCard {...post} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Container>
      
      {/* refresh button (mobile only) */}
      <div className="fixed bottom-20 right-4 md:hidden">
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-gray-200 shadow-lg hover:text-white transition-all"
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
}

export default Home;