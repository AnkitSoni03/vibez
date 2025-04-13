import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import { Button, Input, Logo } from "./index";
import { useDispatch } from "react-redux";
import authService from "../appwrite/auth";
import { useForm } from "react-hook-form";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (data) => {
    setError("");
    setLoading(true);
    try {
      const session = await authService.login(data);
      if (session) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          dispatch(authLogin(userData));
          navigate(location.state?.from || "/", { replace: true });
        }
      }
    } catch (error) {
      setError(error.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-700">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 sm:w-24 mb-3">
            <Logo darkMode />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
            Sign in to your account
          </h2>
          <p className="mt-1 text-sm text-gray-400 text-center">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
        {error && (
          <div className="mb-4 p-2 sm:p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-xs sm:text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(login)} className="space-y-4 sm:space-y-6">
          <Input
            label="Email address"
            placeholder="you@example.com"
            type="email"
            error={errors?.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: "Please enter a valid email address",
              },
            })}
            className="text-sm"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors?.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            className="text-sm"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-xs sm:text-sm text-gray-300"
              >
                Remember me
              </label>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full mt-2"
            loading={loading}
            disabled={loading}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
