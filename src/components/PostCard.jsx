import React from 'react';
import appwriteService from "../appwrite/config";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

function PostCard({ $id, Title, "Unique-image": uniqueImage }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="h-full"
        >
            <Link to={`/post/${$id}`} className="block h-full">
                <div className="h-full bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden">
                    {uniqueImage && (
                        <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                            <img 
                                src={appwriteService.getFilePreview(uniqueImage)} 
                                alt={Title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                    e.target.src = '/placeholder-image.jpg'; // Fallback image
                                }}
                            />
                        </div>
                    )}
                    <h2 className="text-xl font-bold text-white truncate">
                        {Title}
                    </h2>
                    <p className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                        Read more →
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}

PostCard.propTypes = {
    $id: PropTypes.string.isRequired,
    Title: PropTypes.string.isRequired,
    "Unique-image": PropTypes.string,
};

export default PostCard;