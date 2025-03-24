import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import '../styles/animations.css';

const Home = () => {
  const [hoveredNav, setHoveredNav] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);
  const [randomGlow, setRandomGlow] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const headingRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Animation for edge lighting
    const animateEdgeLighting = () => {
      headingRefs.current.forEach((heading, index) => {
        if (!heading) return;
        
        const text = heading.textContent;
        heading.innerHTML = '';
        
        // Create wrapper for the lighting effect
        const wrapper = document.createElement('span');
        wrapper.className = 'edge-light-wrapper';
        wrapper.style.letterSpacing = '0.1em';
        
        // Split text into individual characters with spans
        text.split('').forEach((char) => {
          const span = document.createElement('span');
          span.textContent = char;
          span.className = 'edge-light-char';
          span.style.margin = '0 0.02em';
          wrapper.appendChild(span);
        });
        
        heading.appendChild(wrapper);
      });

      // Animate the edge lighting
      const animate = () => {
        const time = Date.now() / 1000;
        headingRefs.current.forEach((heading) => {
          if (!heading) return;
          const chars = heading.querySelectorAll('.edge-light-char');
          chars.forEach((char, i) => {
            const offset = i * 0.1;
            const brightness = Math.sin(time + offset) * 0.5 + 0.5;
            char.style.textShadow = `
              0 0 ${2 + brightness * 8}px rgba(88, 166, 255, ${0.3 + brightness * 0.7}),
              0 0 ${1 + brightness * 4}px rgba(88, 166, 255, ${0.2 + brightness * 0.4})
            `;
          });
        });
        requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    };

    animateEdgeLighting();

    const glowInterval = setInterval(() => {
      setRandomGlow(true);
      
      setGlowPosition({
        x: Math.random() * 100,
        y: Math.random() * 100
      });
      
      const animationDuration = 3000;
      const startTime = Date.now();
      
      const animateGlow = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / animationDuration;
        
        if (progress < 1) {
          setGlowPosition(prev => ({
            x: prev.x + (Math.sin(progress * Math.PI * 2) * 2),
            y: prev.y + (Math.cos(progress * Math.PI * 2) * 2)
          }));
          requestAnimationFrame(animateGlow);
        } else {
          setRandomGlow(false);
        }
      };
      
      requestAnimationFrame(animateGlow);
    }, Math.random() * 8000 + 4000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(glowInterval);
    };
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Developer",
      text: "GitKit has transformed how we analyze our projects. The insights are invaluable.",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=0D8ABC&color=fff"
    },
    {
      name: "Marcus Rodriguez",
      role: "Tech Lead",
      text: "The actionable recommendations have helped us improve code quality significantly.",
      avatar: "https://ui-avatars.com/api/?name=Marcus+Rodriguez&background=58A6FF&color=fff"
    },
    {
      name: "Alex Kim",
      role: "Open Source Maintainer",
      text: "Perfect for maintaining high standards across multiple repositories.",
      avatar: "https://ui-avatars.com/api/?name=Alex+Kim&background=238636&color=fff"
    }
  ];

  const faqs = [
    {
      question: "How does GitKit analyze repositories?",
      answer: "GitKit uses advanced algorithms to analyze code patterns, contribution history, and project structure to provide meaningful insights and recommendations."
    },
    {
      question: "Is GitKit suitable for personal projects?",
      answer: "Absolutely! GitKit works great for projects of any size, from personal repositories to large enterprise codebases."
    },
    {
      question: "How often is the analysis updated?",
      answer: "GitKit provides real-time analysis with updates whenever changes are pushed to your repositories."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200">
      <Navbar scrolled={scrolled} headingRefs={headingRefs} />
      <Hero headingRefs={headingRefs} />
      <Features headingRefs={headingRefs} />
      <Testimonials headingRefs={headingRefs} />
      <FAQ headingRefs={headingRefs} />
      <Contact headingRefs={headingRefs} />
      <Footer />

      <style>{`
        .github-gradient {
          background: linear-gradient(180deg, #0d1117 0%, #161b22 100%);
        }

        .edge-light-text {
          position: relative;
        }

        .edge-light-wrapper {
          display: inline-block;
        }

        .edge-light-char {
          display: inline-block;
          position: relative;
          transition: text-shadow 0.3s ease;
        }

        @keyframes edgeLight {
          0%, 100% {
            text-shadow: 
              0 0 4px rgba(88, 166, 255, 0.3),
              0 0 8px rgba(88, 166, 255, 0.2);
          }
          50% {
            text-shadow: 
              0 0 8px rgba(88, 166, 255, 0.7),
              0 0 16px rgba(88, 166, 255, 0.5);
          }
        }

        .glow-text {
          position: relative;
          overflow: hidden;
        }

        .random-glow {
          position: relative;
        }

        .random-glow::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(88, 166, 255, 0.2),
            rgba(88, 166, 255, 0.4),
            rgba(88, 166, 255, 0.2),
            transparent
          );
          filter: blur(5px);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
          pointer-events: none;
          transform: translateX(${glowPosition.x}%) translateY(${glowPosition.y}%) rotate(${glowPosition.x * 3.6}deg);
          transition: transform 3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .random-glow::after {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(88, 166, 255, 0.1),
            rgba(88, 166, 255, 0.2),
            rgba(88, 166, 255, 0.1),
            transparent
          );
          filter: blur(3px);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
          pointer-events: none;
          transform: translateX(${-glowPosition.x}%) translateY(${-glowPosition.y}%) rotate(${-glowPosition.x * 3.6}deg);
          transition: transform 3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-glow-effect:hover {
          box-shadow: 0 0 15px rgba(88, 166, 255, 0.5);
        }

        /* Button glow effects */
        .hover:glow-effect {
          position: relative;
          overflow: hidden;
        }

        .hover:glow-effect::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(35, 134, 54, 0.2),
            rgba(35, 134, 54, 0.4),
            rgba(35, 134, 54, 0.2),
            transparent
          );
          filter: blur(4px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .hover:glow-effect:hover::before {
          opacity: 1;
        }

        /* Enhanced focus effects for form elements */
        input:focus, textarea:focus {
          box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Home;