import React from 'react';
import { motion } from 'framer-motion';
import '../styles/fonts.css';

const icons = {
  insights: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  analysis: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 21H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 21V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 17L11 13L15 17L21 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  feedback: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 11.5C21 16.1944 17.1944 20 12.5 20C7.80558 20 4 16.1944 4 11.5C4 6.80558 7.80558 3 12.5 3C17.1944 3 21 6.80558 21 11.5Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 11.5H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 8.5H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 14.5H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

const features = [
  {
    title: "Smart Insights",
    description: "Get detailed analytics and insights about your codebase, helping you make data-driven decisions.",
    icon: icons.insights,
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  {
    title: "Advanced Analysis",
    description: "Deep dive into your code patterns, identify potential issues, and optimize your development workflow.",
    icon: icons.analysis,
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    title: "Real-time Feedback",
    description: "Receive instant feedback on your code changes and suggestions for improvements.",
    icon: icons.feedback,
    gradient: "from-pink-500/20 to-blue-500/20"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,166,255,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(88,166,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(88,166,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            {'Powerful Features'.split('').map((char, i) => (
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
                  margin: char === ' ' ? '0 0.3em' : '0 0.02em' // Increased spacing for spaces between words
                }}
              >
                {char}
              </motion.span>
            ))}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-secondary">
            Everything you need to manage your Git repositories efficiently and effectively.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative bg-[#1a1a1a]/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-blue-500/50 transition-colors duration-300">
                <div className="text-blue-500 mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 font-secondary">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 