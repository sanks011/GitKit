import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/fonts.css';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Github, Home, BarChart2, User, Loader2, LogOut, Settings } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Navbar = ({ scrolled, headingRefs }) => {
  const { user, loading, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const logoRef = useRef(null);
  const profileRef = useRef(null);
  const scrollTimeout = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate scroll progress
      const progress = (currentScrollY / (documentHeight - windowHeight)) * 100;
      setScrollProgress(progress);

      // Show/hide scroll to top button
      setShowScrollTop(currentScrollY > windowHeight * 0.5);

      // Improved scroll visibility logic
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        const shouldShow = currentScrollY < lastScrollY || currentScrollY < 50;
        setIsVisible(shouldShow);
        
        // Add or remove class from document body to handle content spacing
        if (shouldShow) {
          document.body.classList.remove('navbar-hidden');
          document.body.classList.add('navbar-visible');
        } else {
          document.body.classList.add('navbar-hidden');
          document.body.classList.remove('navbar-visible');
        }
        
        setLastScrollY(currentScrollY);
      }, 100);
    };

    const handleMouseMove = (e) => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        logoRef.current.style.setProperty('--x', `${x}%`);
        logoRef.current.style.setProperty('--y', `${y}%`);
      }
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    // Initialize body class on component mount
    document.body.classList.add('navbar-visible');

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scrollToTop', scrollToTop);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scrollToTop', scrollToTop);
      document.removeEventListener('mousedown', handleClickOutside);
      
      // Clean up body classes when component unmounts
      document.body.classList.remove('navbar-visible');
      document.body.classList.remove('navbar-hidden');
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [lastScrollY]);

  const navItems = ['Features', 'Testimonials', 'FAQ', 'Contact'];

  return (
    <>
      <motion.nav 
        className={`fixed w-full top-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-800/50' : 'bg-transparent'
        } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Scroll Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              ref={logoRef}
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/" className="flex-shrink-0 flex items-center">
                <h1 className="font-display text-2xl font-bold text-white">
                  GitKit
                </h1>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <motion.button
                  key={item}
                  onClick={() => {
                    const element = document.getElementById(item.toLowerCase());
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-gray-300 hover:text-white transition-colors font-display"
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.button>
              ))}
              {loading ? (
                <div className="flex items-center space-x-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-display">Loading...</span>
                </div>
              ) : user ? (
                <>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/dashboard" 
                      className="relative px-6 py-2.5 text-white bg-blue-600 rounded-lg overflow-hidden group hover:bg-blue-700 transition-colors duration-300 font-display"
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                  <motion.div
                    className="relative"
                    ref={profileRef}
                  >
                    <motion.div
                      className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    >
                      <img
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`}
                        alt={user.displayName || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    
                    {/* Profile Dropdown Menu */}
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-48 bg-[#161b22] rounded-lg shadow-lg overflow-hidden border border-gray-800/50 backdrop-blur-xl z-50"
                        >
                          <div className="py-1">
                            <div className="px-4 py-2 border-b border-gray-800/50">
                              <p className="text-sm font-medium text-white truncate font-display">
                                {user.displayName || 'User'}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {user.email}
                              </p>
                            </div>
                            <Link 
                              to="/dashboard" 
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-blue-600/10 hover:text-white transition-colors font-display"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                              <User className="w-4 h-4 mr-2" />
                              Profile
                            </Link>
                            <button 
                              onClick={() => {
                                handleLogout();
                                setIsProfileMenuOpen(false);
                              }}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600/10 hover:text-white transition-colors font-display"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </>
              ) : (
                <motion.button
                  className="relative px-6 py-2.5 text-white bg-blue-600/10 rounded-lg overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                >
                  <span className="relative z-10 font-display">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,166,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden text-gray-300 hover:text-white transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden overflow-hidden"
              >
                <motion.div
                  className="bg-[#0a0a0a]/95 backdrop-blur-xl rounded-xl p-4 border border-gray-800/50 mt-2"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ul className="space-y-3">
                    {navItems.map((item) => (
                      <motion.li key={item}>
                        <motion.button
                          onClick={() => {
                            const element = document.getElementById(item.toLowerCase());
                            element?.scrollIntoView({ behavior: 'smooth' });
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left text-gray-300 hover:text-white transition-colors py-2.5 px-4 rounded-lg hover:bg-blue-600/10 font-display"
                          whileHover={{ x: 10 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {item}
                        </motion.button>
                      </motion.li>
                    ))}
                    {loading ? (
                      <motion.li className="flex items-center space-x-2 text-gray-400 py-2.5 px-4">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-display">Loading...</span>
                      </motion.li>
                    ) : user ? (
                      <>
                        <motion.li>
                          <motion.div whileTap={{ scale: 0.95 }}>
                            <Link 
                              to="/dashboard"
                              className="relative w-full px-6 py-3 text-white bg-blue-600 rounded-lg overflow-hidden group mt-2 block text-center font-display"
                            >
                              Dashboard
                            </Link>
                          </motion.div>
                        </motion.li>
                        <motion.li>
                          <motion.button
                            onClick={handleLogout}
                            className="relative w-full px-6 py-3 text-white bg-blue-600/10 rounded-lg overflow-hidden group mt-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="relative z-10 font-display flex items-center justify-center">
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign Out
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,166,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </motion.button>
                        </motion.li>
                      </>
                    ) : (
                      <motion.li>
                        <motion.button
                          onClick={() => {
                            navigate('/login');
                            setIsMobileMenuOpen(false);
                          }}
                          className="relative w-full px-6 py-3 text-white bg-blue-600/10 rounded-lg overflow-hidden group mt-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="relative z-10 font-display">Get Started</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,166,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.button>
                      </motion.li>
                    )}
                  </ul>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.dispatchEvent(new Event('scrollToTop'))}
            className="fixed bottom-8 right-8 z-50 p-3 bg-blue-600/10 hover:bg-blue-600/20 rounded-full backdrop-blur-xl border border-gray-800/50 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;