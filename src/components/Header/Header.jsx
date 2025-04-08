import React, { useState, useEffect } from 'react';
import { Container, Logo, LogoutBtn } from '../index';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import appwriteService from '../../appwrite/config';
import { formatDistanceToNow } from 'date-fns';

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authStatus && userData?.$id) {
      const fetchNotifications = async () => {
        const response = await appwriteService.getUserNotifications(userData.$id);
        setNotifications(response.documents || []);
      };
      fetchNotifications();
    }
  }, [authStatus, userData]);

  const handleNotificationClick = async (notification) => {
    await appwriteService.markNotificationAsRead(notification.$id);
    navigate(`/post/${notification.postId}`);
    setShowNotifications(false);
  };

  const navItems = [
    {
      name: 'Home',
      slug: '/',
      active: true,
    },
    {
      name: 'Login',
      slug: '/login',
      active: !authStatus,
    },
    {
      name: 'Signup',
      slug: '/signup',
      active: !authStatus,
    },
    {
      name: 'All Posts',
      slug: '/all-posts',
      active: authStatus,
    },
    {
      name: 'Add Post',
      slug: '/add-post',
      active: authStatus,
    },
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 shadow-lg"
    >
      <Container>
        <nav className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="./vibez-logo.png" alt="logo" className='w-10 h-10 object-contain rounded-md shadow-md'/>
            <Logo width="40px" darkMode />
            <span className="text-xl font-bold text-white hidden sm:inline">VIBEZ</span>
          </Link>

          {/* Right: Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation Buttons */}
            {navItems.map((item) =>
              item.active ? (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.slug)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    window.location.pathname === item.slug
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {item.name}
                </motion.button>
              ) : null
            )}

            {/* 🔔 Notification Icon with dropdown */}
            {authStatus && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-gray-300 hover:text-white p-1"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                      <h3 className="font-bold text-white">Notifications</h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-400 text-center">No notifications yet</p>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.$id} 
                          className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-gray-750' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <p className="text-sm text-white">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.$createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 👤 User Info */}
            {authStatus && (
              <div className="text-xs text-gray-400 text-left">
                <p className="font-semibold">{userData?.name || 'No Name'}</p>
                <p>{userData?.email}</p>
              </div>
            )}

            {/* 🚪 Logout */}
            {authStatus && <LogoutBtn />}
          </div>
        </nav>
      </Container>
    </motion.header>
  );
}

export default Header;