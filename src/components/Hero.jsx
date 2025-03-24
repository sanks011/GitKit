import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import '../styles/fonts.css';
import { useAuth } from '../contexts/AuthContext';

const Hero = () => {
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const text = "GitKit";

  // Optimize particle generation with useMemo
  const particles = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      velocity: Math.random() * 0.5 + 0.2,
      delay: Math.random() * 2,
    })), []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (textRef.current) {
        const rect = textRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        textRef.current.style.setProperty('--x', `${x}%`);
        textRef.current.style.setProperty('--y', `${y}%`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax effect for background
  const y = useTransform(scrollY, [0, 300], [0, 50]);

  return (
    <header ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Enhanced background effects */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,166,255,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(88,166,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(88,166,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjA1Ii8+PC9zdmc+')]" />

        {/* Optimized particle system */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              x: [`${particle.x}%`, `${particle.x + 10}%`],
              y: [`${particle.y}%`, `${particle.y - 20}%`],
              opacity: [0.3, 0],
              scale: [1, 0],
            }}
            transition={{
              duration: 4 / particle.velocity,
              repeat: Infinity,
              ease: "linear",
              delay: particle.delay,
            }}
            style={{
              width: particle.size,
              height: particle.size,
              background: 'radial-gradient(circle at center, rgba(88,166,255,0.8), transparent)',
              boxShadow: '0 0 10px rgba(88,166,255,0.4)',
            }}
          />
        ))}
      </motion.div>

      {/* Enhanced main content */}
      <div className="relative z-10 text-center px-4">
        <motion.h1
          ref={textRef}
          className="text-6xl md:text-8xl font-display font-bold mb-8 text-white relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {text.split('').map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto font-display"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Supercharge your GitHub repos with <br /> AI-powered insights that actually matter.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-display">Loading...</span>
            </div>
          ) : user ? (
            <Link 
              to="/dashboard"
              className="relative inline-block px-8 py-4 text-white bg-blue-600 rounded-lg overflow-hidden group hover:bg-blue-700 transition-colors duration-300 font-display text-lg"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <motion.button
                className="relative inline-block px-8 py-4 text-white bg-blue-600/10 rounded-lg overflow-hidden group font-display text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,166,255,0.4),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
              <motion.button
                className="relative inline-block px-8 py-4 text-white border border-blue-500/30 rounded-lg overflow-hidden group hover:border-blue-500/60 font-display text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">View Demo</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-700/10 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />
                <motion.div
                  className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 0.05 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </>
          )}
        </motion.div>
      </div>

      {/* Enhanced scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          y: [0, 10, 0],
        }}
        transition={{
          delay: 1,
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center relative">
          <motion.div 
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
    </header>
  );
};

export default Hero; 