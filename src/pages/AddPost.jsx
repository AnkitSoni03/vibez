import React from 'react';
import { Container, PostForm } from '../components';
import { motion } from 'framer-motion';

function AddPost() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 py-12"
    >
      <Container>
        <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-xl shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-8 border-b border-indigo-500 pb-2">
            Create New Post
          </h1>
          <PostForm />
        </div>
      </Container>
    </motion.div>
  );
}

export default AddPost;