import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/fonts.css';

const faqs = [
  {
    question: "What makes GitKit different from other Git management tools?",
    answer: "GitKit combines powerful automation, intuitive UI, and advanced analytics to provide a comprehensive Git management solution. Our unique features like smart branch management and integrated CI/CD pipelines set us apart."
  },
  {
    question: "Is GitKit suitable for both small teams and large enterprises?",
    answer: "Absolutely! GitKit scales seamlessly from individual developers to large enterprise teams. Our flexible pricing and feature set adapt to your needs, whether you're a startup or a Fortune 500 company."
  },
  {
    question: "How secure is GitKit for managing sensitive repositories?",
    answer: "Security is our top priority. GitKit employs industry-standard encryption, regular security audits, and compliance with major security frameworks. We also offer private hosting options for enhanced security."
  },
  {
    question: "Can I integrate GitKit with my existing development tools?",
    answer: "Yes! GitKit provides extensive API support and integrations with popular development tools, IDEs, and CI/CD platforms. Our webhook system allows for custom integrations with your workflow."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(88,166,255,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(88,166,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(88,166,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-bold mb-6"
          >
            {'FAQs'.split('').map((char, i) => (
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
                  margin: char === ' ' ? '0 0.4em' : '0 0.02em' // Increased spacing for spaces between words
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
            Everything you need to know about GitKit
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              <div className="relative bg-[#1a1a1a]/50 backdrop-blur-sm rounded-xl border border-gray-800/50 hover:border-blue-500/50 transition-colors duration-300">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center"
                >
                  <span className="font-display font-bold">{faq.question}</span>
                  <span className="ml-6 flex-shrink-0">
                    <svg
                      className={`w-6 h-6 transition-transform duration-300 ${
                        openIndex === index ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4">
                        <p className="text-gray-400 font-secondary">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ; 