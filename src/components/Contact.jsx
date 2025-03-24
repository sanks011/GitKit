import React from 'react';
import { motion } from 'framer-motion';
import '../styles/fonts.css';

const Contact = () => {
  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,166,255,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(88,166,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(88,166,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-bold mb-6"
          >
            {'Get in Touch'.split('').map((char, i) => (
              <motion.span
                key={i}
                className="edge-light-char inline-block"
                data-char={char}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.05,
                  ease: [0.2, 0.65, 0.3, 0.9],
                }}
                style={{
                  margin: char === ' ' ? '0 0.2em' : '0 0.02em' // Increased spacing for spaces between words
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 font-secondary max-w-2xl mx-auto"
          >
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl" />
          <div className="relative bg-[#1a1a1a]/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block font-display font-bold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-gray-800/50 rounded-lg font-secondary text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors duration-300"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block font-display font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-gray-800/50 rounded-lg font-secondary text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors duration-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block font-display font-bold mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-gray-800/50 rounded-lg font-secondary text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors duration-300"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block font-display font-bold mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  className="w-full px-4 py-3 bg-[#0a0a0a]/50 border border-gray-800/50 rounded-lg font-secondary text-gray-300 focus:outline-none focus:border-blue-500/50 transition-colors duration-300 resize-none"
                  placeholder="Your message..."
                ></textarea>
              </div>
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg font-display font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50 transition-shadow duration-300"
                >
                  Send Message
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact; 