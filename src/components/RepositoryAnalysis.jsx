import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import DocumentationGenerator from './DocumentationGenerator';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import DependencyGraph from './DependencyGraph';
import ActivityGraph from './ActivityGraph';
import HealthScore from './HealthScore';
import ContributionHeatmap from './ContributionHeatmap';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const RepositoryAnalysis = ({ repo }) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const analyzeRepository = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the GitHub token from localStorage
        const githubToken = localStorage.getItem('github_token');
        if (!githubToken) {
          throw new Error('GitHub token not found');
        }

        // Set the GitHub token in the request headers
        api.defaults.headers.common['x-github-token'] = githubToken;

        const response = await api.get(`/api/repository/${repo.owner.login}/${repo.name}/analysis`);
        setAnalysis(response.data);
      } catch (err) {
        console.error('Repository analysis failed:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze repository';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (repo && user) {
      analyzeRepository();
    }
  }, [repo, user]);

  if (loading) {
    return (
      <div className="bg-[#161b22] rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-gray-400 font-secondary">Analyzing repository...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#161b22] rounded-lg p-6 border border-red-500/30">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-500 text-center">
            <p className="font-secondary mb-2">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors duration-300 font-secondary"
            >
              Try Again
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const commitData = {
    labels: ['Last 7 days', '8-30 days', '31-90 days', '90+ days'],
    datasets: [{
      label: 'Commits',
      data: [
        analysis.repository.commits?.filter(c => {
          const date = new Date(c.commit.author.date);
          return (Date.now() - date) / (1000 * 60 * 60 * 24) <= 7;
        }).length || 0,
        analysis.repository.commits?.filter(c => {
          const date = new Date(c.commit.author.date);
          const days = (Date.now() - date) / (1000 * 60 * 60 * 24);
          return days > 7 && days <= 30;
        }).length || 0,
        analysis.repository.commits?.filter(c => {
          const date = new Date(c.commit.author.date);
          const days = (Date.now() - date) / (1000 * 60 * 60 * 24);
          return days > 30 && days <= 90;
        }).length || 0,
        analysis.repository.commits?.filter(c => {
          const date = new Date(c.commit.author.date);
          const days = (Date.now() - date) / (1000 * 60 * 60 * 24);
          return days > 90;
        }).length || 0,
      ],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  const languageData = {
    labels: Object.keys(analysis.repository.languages || {}),
    datasets: [{
      data: Object.values(analysis.repository.languages || {}),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ],
    }]
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-800/50">
        <button
          className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'} transition-colors duration-200`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'dependencies' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'} transition-colors duration-200`}
          onClick={() => setActiveTab('dependencies')}
        >
          Dependencies
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'activity' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'} transition-colors duration-200`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'health' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'} transition-colors duration-200`}
          onClick={() => setActiveTab('health')}
        >
          Health
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="space-y-8">
              <HealthScore repo={repo} />
              <ActivityGraph repo={repo} />
            </div>
            <div className="space-y-8">
              <DependencyGraph repo={repo} />
              <ContributionHeatmap repo={repo} />
            </div>
          </motion.div>
        )}

        {activeTab === 'dependencies' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DependencyGraph repo={repo} expanded />
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-8">
              <ActivityGraph repo={repo} expanded />
              <ContributionHeatmap repo={repo} expanded />
            </div>
          </motion.div>
        )}

        {activeTab === 'health' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HealthScore repo={repo} expanded />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RepositoryAnalysis;