import React from 'react';
import { motion } from 'framer-motion';
import '../styles/fonts.css';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-2xl font-bold interactive-text">GitKit</span>
              <p className="mt-4 text-gray-400 secondary-text-medium max-w-md">
                Empowering developers with powerful Git management tools and seamless collaboration features.
              </p>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg font-bold mb-4 interactive-text"
            >
              Quick Links
            </motion.h3>
            <ul className="space-y-2">
              {['Features', 'Testimonials', 'FAQ', 'Contact'].map((item) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors duration-300 secondary-text-medium">
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg font-bold mb-4 interactive-text"
            >
              Connect
            </motion.h3>
            <div className="flex space-x-4">
              {['GitHub', 'Twitter', 'LinkedIn'].map((platform) => (
                <motion.a
                  key={platform}
                  href="#"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="sr-only">{platform}</span>
                  {/* Add platform icons here */}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 secondary-text-medium text-sm">
              © {new Date().getFullYear()} GitKit. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {['Privacy Policy', 'Terms of Service'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-gray-400 hover:text-blue-500 transition-colors duration-300 secondary-text-medium text-sm"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 