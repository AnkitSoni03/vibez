import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import authService from "./appwrite/auth";
import { login, logout } from "./store/authSlice";
import { Footer, Header } from './components';
import Loader from './components/Loader';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get userData from Redux
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const user = await authService.getCurrentUser();
        console.log("Fetched User:", user); 
        
        if (user) {
          dispatch(login(user)); 
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setError("Failed to verify authentication status");
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    const intervalId = setInterval(checkAuthStatus, 300000);
    
    return () => clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    if (!loading && userData && ['/login', '/signup'].includes(window.location.pathname)) {
        navigate('/');
    }
  }, [loading, userData, navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition text-white"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

export default App;
