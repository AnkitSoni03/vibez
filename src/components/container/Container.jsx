import React from "react";
import { motion } from "framer-motion";

function Container({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full max-w-[72rem] mx-auto ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default Container;
