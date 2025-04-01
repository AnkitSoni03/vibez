import React from 'react';
import appwriteService from "../appwrite/config";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function PostCard({ $id, title, featuredImage }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link to={`/post/${$id}`} className="block h-full">
        <div className="h-full bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden">
          <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
            <img 
              src={appwriteService.getFilePreview(featuredImage)} 
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h2 className="text-xl font-bold text-white truncate">
            {title}
          </h2>
          <p className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Read more →
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export default PostCard;