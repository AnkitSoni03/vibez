import React from 'react';
import { Container, Logo, LogoutBtn } from '../index';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();

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
          <Link to="/" className="flex items-center space-x-2">
            <Logo width="40px" darkMode />
            <span className="text-xl font-bold text-white hidden sm:inline">VIBEZ</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-2">
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
            {authStatus && <LogoutBtn />}
          </div>
          
          {/* Mobile menu button would go here */}
        </nav>
      </Container>
    </motion.header>
  );
}

export default Header;