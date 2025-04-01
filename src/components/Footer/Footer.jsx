import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo';
import { motion } from 'framer-motion';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden py-12 bg-gray-800 border-t border-gray-700"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-col h-full justify-between space-y-6">
              <div className="flex items-center">
                <Logo width="120px" darkMode />
              </div>
              <p className="text-sm text-gray-400">
                &copy; {currentYear} VIBEZ. All rights reserved.
              </p>
            </div>
          </div>
          
          {['Company', 'Support', 'Legal'].map((section) => (
            <div key={section} className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {section}
              </h3>
              <ul className="space-y-3">
                {getFooterLinks(section).map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="text-base font-medium text-gray-300 hover:text-indigo-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Connect
            </h3>
            <div className="flex space-x-4">
              {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                  aria-label={social}
                >
                  <span className="sr-only">{social}</span>
                  <div className="h-6 w-6">
                    {/* Replace with actual social icons */}
                    {social.charAt(0)}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

function getFooterLinks(section) {
  const links = {
    Company: [
      { name: 'About', to: '/about' },
      { name: 'Features', to: '/features' },
      { name: 'Pricing', to: '/pricing' },
      { name: 'Careers', to: '/careers' },
    ],
    Support: [
      { name: 'Help Center', to: '/help' },
      { name: 'Contact Us', to: '/contact' },
      { name: 'Community', to: '/community' },
      { name: 'Status', to: '/status' },
    ],
    Legal: [
      { name: 'Privacy', to: '/privacy' },
      { name: 'Terms', to: '/terms' },
      { name: 'Cookie Policy', to: '/cookies' },
    ],
  };
  
  return links[section] || [];
}

export default Footer;