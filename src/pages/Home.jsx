import React, { useEffect, useState } from 'react';
import appwriteService from "../appwrite/config";
import { Container, PostCard, Loader } from '../components';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authStatus = useSelector(state => state.auth.status);
  const userData = useSelector(state => state.auth.userData);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!userData?.$id) return;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-900 py-12"
      >
        <Container>
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to VIBEZ</h1>
            <p className="text-xl text-gray-400 mb-8">
              {authStatus ? "Create your first post!" : "Login to explore and create posts!"}
            </p>
            <div className="bg-gray-800 p-8 rounded-xl max-w-2xl mx-auto">
              <p className="text-gray-300 mb-6">
                Share your thoughts, ideas, and creativity with the community.
              </p>
              {!authStatus ? (
                <div className="flex justify-center space-x-4">
                  <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Login</Link>
                  <Link to="/signup" className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">Sign Up</Link>
                </div>
              ) : (
                <Link to="/add-post" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Create Your First Post</Link>
              )}
            </div>
          </div>
        </Container>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-900 py-12">
      <Container>
        <h1 className="text-4xl font-bold text-white mb-12 text-center">
          {authStatus ? "Your Feed" : "Latest Posts"}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <motion.div key={post.$id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <PostCard {...post} />
            </motion.div>
          ))}
        </div>
      </Container>
    </motion.div>
  );
}

export default Home;
