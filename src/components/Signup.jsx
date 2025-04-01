import React, { useState } from 'react';
import authService from '../appwrite/auth';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { Button, Input, Logo } from './index';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const create = async (data) => {
    setError("");
    setLoading(true);
    try {
      const userData = await authService.createAccount(data);
      if (userData) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          dispatch(login(currentUser));
          navigate("/");
        }
      }
    } catch (error) {
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-screen bg-gray-900 p-4"
    >
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 mb-4">
            <Logo darkMode />
          </div>
          <h2 className="text-2xl font-bold text-white text-center">
            Create your account
          </h2>
          <p className="mt-2 text-gray-400 text-center">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(create)} className="space-y-6">
          <Input
            label="Full name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters"
              }
            })}
            darkMode
          />

          <Input
            label="Email address"
            placeholder="you@example.com"
            type="email"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: "Please enter a valid email address"
              }
            })}
            darkMode
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters"
              }
            })}
            darkMode
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-indigo-400 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-indigo-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </motion.div>
  );
}

export default Signup;