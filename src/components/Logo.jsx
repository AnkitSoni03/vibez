import React from 'react';
import { motion } from 'framer-motion';

function Logo({ width = '120px', darkMode = false }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`font-bold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
      style={{ width }}
    >
      <span className="text-indigo-500">VIBEZ</span>
    </motion.div>
  );
}

export default Logo;