import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden py-16 bg-gradient-to-br from-gray-900 to-gray-800 border-t border-gray-700"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <div className="absolute opacity-5 -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-500 blur-3xl"></div>
      <div className="absolute opacity-5 -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-500 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-8 mb-12">
          {/* <div className="lg:col-span-3">
            <div className="flex flex-col h-full space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">About VIBEZ</h2>
                <p className="text-gray-400 mb-6">
                  Creating memorable experiences through cutting-edge technology and community-driven innovation. Join us on a journey to transform how we connect.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <a href="#" className="p-2 bg-gray-700 rounded-full hover:bg-indigo-600 transition-colors" aria-label="Twitter">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="p-2 bg-gray-700 rounded-full hover:bg-indigo-600 transition-colors" aria-label="Facebook">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="p-2 bg-gray-700 rounded-full hover:bg-indigo-600 transition-colors" aria-label="Instagram">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/ankit-soni-98107b243/" className="p-2 bg-gray-700 rounded-full hover:bg-indigo-600 transition-colors" aria-label="LinkedIn">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div> */}
          <div className="lg:col-span-3">
            <div className="flex flex-col h-full space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">
                  About VIBEZ
                </h2>
                <p className="text-gray-400 mb-6">
                  At Vibez, We believe in technology that enhances human
                  interaction rather than replaces it. Through our intuitive
                  tools and collaborative environment, we're transforming how
                  people connect, create, and find inspiration together. Join
                  our growing community and help shape the future of digital
                  connection.
                </p>
              </div>

              <div className="flex space-x-4">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/share/16a81hRkZd/"
                  className="p-2 bg-gray-700 rounded-full hover:bg-indigo-600 transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>

                {/* Github */}
                <a
                  href="https://github.com/AnkitSoni03/"
                  className="p-2 bg-gray-700 rounded-full hover:bg-indigo-600 transition-colors"
                  aria-label="GitHub"
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.415-4.033-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.776.418-1.304.762-1.604-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.123-.303-.536-1.527.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.29-1.553 3.296-1.23 3.296-1.23.655 1.649.242 2.873.12 3.176.77.84 1.234 1.911 1.234 3.221 0 4.61-2.805 5.624-5.475 5.921.43.371.823 1.102.823 2.222v3.293c0 .32.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/ankit-soni-98107b243/"
                  className="p-2 bg-gray-700 rounded-full hover:bg-indigo-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>

                {/* Resume */}
                <a
                  href="https://drive.google.com/file/d/1VsyXpfl9ht66fMSWY5a5ku941_mee0G1/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-700 rounded-full hover:bg-indigo-600 transition-colors"
                  aria-label="Resume"
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 11V3m0 8l-3-3m3 3l3-3m-6 8h6m2 0a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </a>

                {/* Portfolio */}
                <a
                  href="https://portfolio-ankit-soni.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-700 rounded-full hover:bg-indigo-600 transition-colors"
                  aria-label="Portfolio"
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 12v9m0-9l-3-3m3 3l3-3M3 21h18a2 2 0 002-2V7a2 2 0 00-2-2h-5l-2-2h-6l-2 2H3a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Links sections */}
          {["Company", "Support", "Legal"].map((section, index) => (
            <div
              key={section}
              className={`lg:col-span-2 ${index === 0 ? "lg:col-start-5" : ""}`}
            >
              <h3 className="text-lg font-bold text-white mb-6">{section}</h3>
              <ul className="space-y-4">
                {getFooterLinks(section).map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="text-gray-300 hover:text-indigo-400 transition-colors flex items-center"
                    >
                      <span className="mr-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Additional column */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-bold text-white mb-6">Contact Us</h3>
            <address className="not-italic text-gray-400">
              <p className="mb-3">Vibez India Pvt Ltd, India</p>
              <p className="mb-3">Varanasi, Uttar Pradesh, India 221002</p>
              <p className="mb-3">
                <a
                  href="mailto:sethankit027@gmail.com"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  sethankit027@gmail.com
                </a>
              </p>
              <p>
                <a
                  href="tel:+99 7348383868"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  +99 (734) 838-3868
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom section with copyright */}
        <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} VIBEZ. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              to="/#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

function getFooterLinks(section) {
  const links = {
    Company: [
      { name: "About Us", to: "/#" },
      { name: "Features", to: "/#" },
      { name: "Pricing", to: "/#" },
      { name: "Careers", to: "/#" },
      { name: "Blog", to: "/#" },
    ],
    Support: [
      { name: "Help Center", to: "/#" },
      { name: "Contact Us", to: "/#" },
      { name: "Community", to: "/#" },
      { name: "Status", to: "/#" },
      { name: "Resources", to: "/#" },
    ],
    Legal: [
      { name: "Privacy Policy", to: "/#" },
      { name: "Terms of Service", to: "/#" },
      { name: "Cookie Policy", to: "/#" },
      { name: "Licenses", to: "/#" },
    ],
  };

  return links[section] || [];
}

export default Footer;
