import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Loader2,
  Star,
  GitFork,
  Eye,
  AlertCircle,
  ArrowLeft,
  FileCode,
  GitBranch,
  GitPullRequest,
  Shield,
  Book,
  BarChart2,
  Network,
  Activity,
  Heart,
  FileText
} from 'lucide-react';
import api from '../utils/api';
import HealthScore from '../components/HealthScore';
import DependencyGraph from '../components/DependencyGraph';
import ActivityGraph from '../components/ActivityGraph';
import ContributionHeatmap from '../components/ContributionHeatmap';
import DocumentationGenerator from '../components/DocumentationGenerator';

const RepoAnalysis = () => {
  const { owner, repo } = useParams();
  const navigate = useNavigate();
  const [repository, setRepository] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First fetch repository details
        const repoRes = await api.get(`/api/github/repositories/${owner}/${repo}`);
        if (!repoRes.data) {
          throw new Error('Failed to fetch repository data');
        }
        setRepository(repoRes.data);

        // Then fetch analysis
        const analysisRes = await api.get(`/api/repository/${owner}/${repo}/analysis`);
        if (!analysisRes.data) {
          throw new Error('Failed to fetch analysis data');
        }
        
        // Update repository with additional data from analysis
        setRepository(prev => ({
          ...prev,
          ...analysisRes.data.repository
        }));
        
        // Set analysis data
        setAnalysis(analysisRes.data.analysis);
      } catch (err) {
        console.error('Failed to fetch repository data:', err);
        const errorMessage = err.response?.data?.error || err.response?.data?.details || err.message || 'Failed to load repository data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0d1117]">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="font-display text-lg">Analyzing repository...</span>
        </div>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0d1117]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-display font-semibold text-white">Error Loading Repository</h2>
          <p className="text-gray-400">{error || 'Repository not found'}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return to Dashboard
          </motion.button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'insights', label: 'AI Insights', icon: BarChart2 },
    { id: 'dependencies', label: 'Dependencies', icon: Network },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'health', label: 'Health', icon: Heart },
    { id: 'documentation', label: 'Documentation', icon: FileText }
  ];

  return (
    <div className="nav-content-wrapper">
    <div className="min-h-screen bg-[#0d1117] text-gray-200 pb-12"> {/* Added pt-20 for padding-top */}
    {/* Header */}
    <div className="bg-[#161b22] border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-display font-bold text-white flex items-center">
                <FileCode className="w-6 h-6 mr-2 text-blue-500" />
                {repository.name}
              </h1>
              <p className="text-gray-400 font-secondary mt-1">{repository.description}</p>
            </div>
          </div>

          {/* Repository Stats */}
          <div className="flex items-center space-x-6 mt-6 text-sm text-gray-400 font-secondary">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              {repository.stargazers_count} stars
            </div>
            <div className="flex items-center">
              <GitFork className="w-4 h-4 mr-1" />
              {repository.forks_count} forks
            </div>
            <div className="flex items-center">
              <GitBranch className="w-4 h-4 mr-1" />
              {repository.default_branch}
            </div>
            <div className="flex items-center">
              <GitPullRequest className="w-4 h-4 mr-1" />
              {repository.open_issues_count} open issues
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              {repository.license?.name || 'No license'}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-6">
            {tabs.map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-display text-sm flex items-center space-x-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <HealthScore repo={repository} />
              <ActivityGraph repo={repository} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <DependencyGraph repo={repository} />
              <ContributionHeatmap repo={repository} />
            </motion.div>
          </div>
        )}

        {activeTab === 'insights' && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Project Category & Technologies */}
            <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800/50">
              <h3 className="text-lg font-display font-semibold text-white mb-4">
                Project Category & Technologies
              </h3>
              <div className="space-y-4 font-secondary text-gray-300">
                {analysis.technologies?.map((tech, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion & Complexity */}
            <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800/50">
              <h3 className="text-lg font-display font-semibold text-white mb-4">
                Project Completion & Complexity
              </h3>
              <div className="space-y-4 font-secondary text-gray-300">
                <div>
                  <p className="text-sm text-gray-400">Completion Status</p>
                  <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${analysis.completion || 0}%` }}
                    />
                  </div>
                  <p className="mt-1 text-sm">{analysis.completion || 0}% Complete</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Complexity Level</p>
                  <p className="mt-1">{analysis.complexity || 'Moderate'}</p>
                </div>
              </div>
            </div>

            {/* Code Quality */}
            <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800/50">
              <h3 className="text-lg font-display font-semibold text-white mb-4">
                Code Quality & Best Practices
              </h3>
              <div className="space-y-4 font-secondary text-gray-300">
                {analysis.codeQuality?.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center mt-1">
                      <span className="text-blue-500 text-sm">{index + 1}</span>
                    </div>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Debt */}
            <div className="bg-[#161b22] rounded-lg p-6 border border-gray-800/50">
              <h3 className="text-lg font-display font-semibold text-white mb-4">
                Technical Debt Assessment
              </h3>
              <div className="space-y-4 font-secondary text-gray-300">
                {analysis.technicalDebt?.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mt-1" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="col-span-2 bg-[#161b22] rounded-lg p-6 border border-gray-800/50">
              <h3 className="text-lg font-display font-semibold text-white mb-4">
                Recommendations
              </h3>
              <div className="space-y-4 font-secondary text-gray-300">
                {analysis.recommendations?.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center mt-1">
                      <span className="text-green-500 text-sm">✓</span>
                    </div>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'dependencies' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DependencyGraph repo={repository} expanded />
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-8">
              <ActivityGraph repo={repository} expanded />
              <ContributionHeatmap repo={repository} expanded />
            </div>
          </motion.div>
        )}

        {activeTab === 'health' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HealthScore repo={repository} expanded />
          </motion.div>
        )}
        
        {activeTab === 'documentation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DocumentationGenerator repository={repository} />
          </motion.div>
        )}
      </div>
    </div>
    </div>
  );
};

export default RepoAnalysis;