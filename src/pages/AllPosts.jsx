import React, { useState, useEffect } from 'react';
import { Container, PostCard, Loader } from '../components';
import appwriteService from "../appwrite/config";
import { motion } from 'framer-motion';

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsData = await appwriteService.getAllPosts("active");
        setPosts(postsData?.documents || []);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <Loader />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-900 py-12">
      <Container>
        <h1 className="text-4xl font-bold text-white mb-12 text-center">All Posts</h1>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400">No posts found. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <motion.div key={post.$id} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <PostCard {...post} />
              </motion.div>
            ))}
          </div>
        )}
      </Container>
    </motion.div>
  );
}

export default AllPosts;
