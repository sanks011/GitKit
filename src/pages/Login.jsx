import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Github } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { user, signInWithGitHub, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGitHub();
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('GitHub sign in error:', error);
      if (error.code === 'auth/invalid-oauth-client-id') {
        toast.error('OAuth configuration error. Please check GitHub app settings.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled. Please try again.');
      } else {
        toast.error(error.message || 'Failed to sign in with GitHub');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-display">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-[#161b22] p-8 rounded-lg shadow-xl border border-gray-800/50 backdrop-blur-xl"
      >
        <div className="text-center">
          <motion.h1 
            className="text-3xl font-bold text-white mb-2 font-display"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Welcome to GitKit
          </motion.h1>
          <motion.p 
            className="text-gray-400 font-display"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Connect your GitHub account to get started
          </motion.p>
        </div>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white relative overflow-hidden group font-display"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10 flex items-center">
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Github className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Connecting...' : 'Continue with GitHub'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(88,166,255,0.8),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.button>
        </motion.div>

        <motion.div 
          className="text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          By continuing, you agree to our Terms of Service and Privacy Policy
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;