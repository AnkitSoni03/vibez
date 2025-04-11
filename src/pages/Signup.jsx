import React from "react";
import { Signup as SignupComponent } from "../components";
import { motion } from "framer-motion";

function Signup() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 py-12"
    >
      <div className="max-w-md mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Join VIBEZ
        </h1>
        <SignupComponent />
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300">
              Login
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default Signup;
