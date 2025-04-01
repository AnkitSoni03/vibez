import React from 'react';
import { Login as LoginComponent } from '../components';
import { motion } from 'framer-motion';

function Login() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 py-12"
    >
      <div className="max-w-md mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Welcome Back
        </h1>
        <LoginComponent />
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="text-indigo-400 hover:text-indigo-300">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default Login;