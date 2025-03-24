import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import api from '../utils/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const HealthScore = ({ repo, expanded = false }) => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    let retryTimeout;

    const fetchHealth = async () => {
      if (!repo?.owner?.login || !repo?.name) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Enhanced endpoint for AI-powered health analysis
        const response = await api.get(`/api/repository/${repo.owner.login}/${repo.name}/health`, {
          params: {
            analyze_code: true, // Request code analysis
            detailed: expanded, // Get more details if expanded view
          }
        });
        
        if (mounted) {
          // Map API response to component state with enhanced metrics
          setHealth({
            score: response.data.overallScore || 0,
            metrics: response.data.metrics || {
              codeQuality: 0,
              maintainability: 0,
              security: 0,
              documentation: 0,
              testCoverage: 0
            },
            issues: response.data.issues || {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0
            },
            recommendations: response.data.recommendations || [],
            codeExamples: response.data.codeExamples || [] // Added code examples
          });
        }
      } catch (err) {
        console.error('Failed to fetch health data:', err);
        if (mounted) {
          setError('Failed to load health data');
          toast.error('Failed to load health data');

          // Implement retry logic
          if (retryCount < MAX_RETRIES) {
            retryTimeout = setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, RETRY_DELAY);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (repo) {
      fetchHealth();
    }

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [repo, retryCount, expanded]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161b22] rounded-lg p-6 border border-gray-800/50 hover:border-blue-500/30 transition-colors duration-300"
      >
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-gray-400 font-secondary">
              {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Analyzing code and repository health...'}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161b22] rounded-lg p-6 border border-red-500/30"
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-500 text-center">
            <p className="font-secondary mb-2">{error}</p>
            {retryCount < MAX_RETRIES ? (
              <span className="text-gray-400 font-secondary">
                Retrying... ({retryCount}/{MAX_RETRIES})
              </span>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRetryCount(0)}
                className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors duration-300 font-secondary"
              >
                Try Again
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!health) {
    return null;
  }

  const data = {
    labels: ['Health Score', 'Remaining'],
    datasets: [{
      data: [health.score, 100 - health.score],
      backgroundColor: [
        health.score >= 70 ? 'rgba(34, 197, 94, 0.8)' : // green
        health.score >= 40 ? 'rgba(234, 179, 8, 0.8)' : // yellow
        'rgba(239, 68, 68, 0.8)', // red
        'rgba(75, 85, 99, 0.2)' // gray
      ],
      borderWidth: 0,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#161b22',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    cutout: '80%',
  };

  // Get score color for status text
  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Get status text based on score
  const getStatus = (score) => {
    if (score >= 70) return 'Healthy';
    if (score >= 40) return 'Needs Attention';
    return 'Critical Issues';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#161b22] rounded-lg p-6 border border-gray-800/50 hover:border-blue-500/30 transition-colors duration-300"
    >
      <h3 className="text-lg font-display font-semibold text-white mb-4">Health Score</h3>
      <div className={`${expanded ? 'h-96' : 'h-64'} relative`}>
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="text-center">
            <span className="text-3xl font-display font-bold text-white">{health.score}</span>
            <span className="text-gray-400 ml-1">/ 100</span>
          </div>
          <div className={`mt-2 font-medium ${getScoreColor(health.score)}`}>
            {getStatus(health.score)}
          </div>
        </div>
      </div>
      
      {health.recommendations && health.recommendations.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-display font-semibold text-white mb-2">AI Recommendations</h4>
          <ul className="space-y-2">
            {health.recommendations.slice(0, expanded ? health.recommendations.length : 3).map((rec, index) => (
              <li key={index} className="text-sm text-gray-400 font-secondary flex items-start">
                <span className="text-blue-500 mr-2">•</span> 
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {expanded && health.metrics && (
        <div className="mt-6">
          <h4 className="text-sm font-display font-semibold text-white mb-4">AI-Analyzed Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(health.metrics).map(([key, value]) => (
              <div key={key} className="bg-[#0d1117] p-4 rounded-lg">
                <div className="text-gray-400 text-xs mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      value >= 70 ? 'bg-green-500' : 
                      value >= 40 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
                <div className="text-xs text-right mt-1 text-gray-400">{value}%</div>
                {expanded && (
                  <div className="mt-2 text-xs text-gray-300">
                    {getMetricDescription(key, value)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {expanded && health.issues && Object.values(health.issues).some(v => v > 0) && (
        <div className="mt-6">
          <h4 className="text-sm font-display font-semibold text-white mb-2">Detected Issues</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(health.issues).map(([severity, count]) => (
              <div key={severity} className="bg-[#0d1117] p-4 rounded-lg">
                <p className="text-gray-400 text-xs capitalize">{severity} Issues</p>
                <p className={`text-lg font-bold ${
                  severity === 'critical' ? 'text-red-500' : 
                  severity === 'high' ? 'text-orange-500' :
                  severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                }`}>{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {expanded && health.codeExamples && health.codeExamples.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-display font-semibold text-white mb-4">Code Analysis Examples</h4>
          <div className="space-y-4">
            {health.codeExamples.map((example, index) => (
              <div key={index} className="bg-[#0d1117] p-4 rounded-lg">
                <div className="flex items-start space-x-2 mb-2">
                  {example.type === 'issue' ? (
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-1" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center mt-1">
                      <span className="text-green-500 text-xs">✓</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-300 font-medium">{example.title}</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  {example.location && (
                    <span className="bg-gray-800 px-2 py-1 rounded text-gray-400">{example.location}</span>
                  )}
                </div>
                <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                  {example.code}
                </pre>
                <div className="mt-2 text-xs text-gray-400">
                  {example.comment}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Helper function to provide descriptions based on metric keys and values
const getMetricDescription = (key, value) => {
  const descriptions = {
    codeQuality: {
      low: "Code has significant quality issues that need attention",
      medium: "Code meets basic quality standards but needs improvement",
      high: "Code follows good quality practices and standards"
    },
    maintainability: {
      low: "Code is difficult to maintain with high technical debt",
      medium: "Code is moderately maintainable with some technical debt",
      high: "Code is clean and easy to maintain"
    },
    security: {
      low: "Several potential security vulnerabilities identified",
      medium: "Some minor security concerns need addressing",
      high: "Code follows good security practices"
    },
    documentation: {
      low: "Code lacks proper documentation and comments",
      medium: "Basic documentation exists but needs improvement",
      high: "Well-documented code with clear comments"
    },
    testCoverage: {
      low: "Little to no test coverage detected",
      medium: "Partial test coverage with key areas missing",
      high: "Good test coverage across critical components"
    }
  };

  const level = value >= 70 ? 'high' : value >= 40 ? 'medium' : 'low';
  return descriptions[key]?.[level] || `${level.charAt(0).toUpperCase() + level.slice(1)} ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`;
};

export default HealthScore;