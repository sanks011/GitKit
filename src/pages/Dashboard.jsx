import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { toast } from 'react-hot-toast';
import RepositoryFilters from '../components/RepositoryFilters';
import RepositoryAnalysis from '../components/RepositoryAnalysis';
import RepositoryList from '../components/RepositoryList';
import UserProfile from '../components/UserProfile';
import DependencyGraph from '../components/DependencyGraph';
import ActivityGraph from '../components/ActivityGraph';
import HealthScore from '../components/HealthScore';
import ContributionHeatmap from '../components/ContributionHeatmap';
import { motion } from 'framer-motion';
import {
  Loader2,
  Star,
  GitFork,
  Eye,
  AlertCircle,
  Users,
  MapPin,
  Link as LinkIcon,
  Mail,
  Calendar,
  Search,
  Filter,
  SortAsc,
  Code2
} from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, githubToken, signInWithGitHub, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [filteredRepositories, setFilteredRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initializedRef = useRef(false);
  const [filters, setFilters] = useState({
    language: '',
    sortBy: 'updated',
    activity: '',
    size: '',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [languages, setLanguages] = useState([]);

  // Initialize dashboard with GitHub data
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      navigate('/login');
      return;
    }

    if (!githubToken) {
      setError('GitHub connection required');
      setLoading(false);
      return;
    }

    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile and repositories from our backend
        const [profileResponse, reposResponse] = await Promise.all([
          api.get('/api/github/profile'),
          api.get('/api/github/repositories')
        ]);

        if (!profileResponse.data) {
          throw new Error('Failed to fetch GitHub profile');
        }

        if (!Array.isArray(reposResponse.data)) {
          throw new Error('Invalid repositories data received');
        }

        setProfile(profileResponse.data);
        setRepositories(reposResponse.data);
        setFilteredRepositories(reposResponse.data);

        // Extract unique languages
        const uniqueLanguages = [...new Set(reposResponse.data
          .map(repo => repo.language)
          .filter(Boolean))];
        setLanguages(uniqueLanguages);
      } catch (err) {
        console.error('Dashboard initialization failed:', err);
        
        if (err.response?.status === 401) {
          setError('GitHub authentication required. Please sign in again.');
          // Clear GitHub token as it might be invalid
          localStorage.removeItem('github_token');
          navigate('/login');
        } else {
          setError(err.message || 'Failed to load GitHub data');
        }
        
        // Clear data on error
        setProfile(null);
        setRepositories([]);
        setFilteredRepositories([]);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [authLoading, user, githubToken, navigate]);

  // Apply filters
  useEffect(() => {
    if (!repositories.length) return;

    let filtered = [...repositories];

    // Language filter
    if (filters.language) {
      filtered = filtered.filter(repo => repo.language === filters.language);
    }

    // Activity filter
    if (filters.activity) {
      const now = new Date();
      filtered = filtered.filter(repo => {
        const lastUpdate = new Date(repo.updated_at);
        const daysDiff = (now - lastUpdate) / (1000 * 60 * 60 * 24);
        
        switch (filters.activity) {
          case 'active':
            return daysDiff <= 30;
          case 'maintained':
            return daysDiff <= 90;
          case 'inactive':
            return daysDiff > 90;
          default:
            return true;
        }
      });
    }

    // Size filter
    if (filters.size) {
      filtered = filtered.filter(repo => {
        switch (filters.size) {
          case 'small':
            return repo.size < 1000;
          case 'medium':
            return repo.size >= 1000 && repo.size < 10000;
          case 'large':
            return repo.size >= 10000;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(searchTerm) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm)) ||
        (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(searchTerm)))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'forks':
          return b.forks_count - a.forks_count;
        case 'issues':
          return b.open_issues_count - a.open_issues_count;
        case 'updated':
          return new Date(b.updated_at) - new Date(a.updated_at);
        default:
          return 0;
      }
    });

    setFilteredRepositories(filtered);
  }, [repositories, filters]);

  const filteredRepos = repositories
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLanguage = !filterLanguage || repo.language === filterLanguage;
      return matchesSearch && matchesLanguage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'forks':
          return b.forks_count - a.forks_count;
        case 'updated':
          return new Date(b.updated_at) - new Date(a.updated_at);
        default:
          return 0;
      }
    });

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0d1117]">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="font-display text-lg">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1117] p-4">
        <div className="max-w-md w-full space-y-8 bg-[#161b22] p-8 rounded-lg border border-gray-800/50">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              {error ? 'Authentication Error' : 'Welcome to GitKit'}
            </h2>
            <p className="text-gray-400 font-secondary mb-8">
              {error || 'Connect your GitHub account to get started'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signInWithGitHub}
            className="w-full flex items-center justify-center px-4 py-3 bg-[#238636] text-white rounded-lg font-display hover:bg-[#2ea043] transition-colors duration-300"
          >
            Connect GitHub
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="nav-content-wrapper">
    <div className="min-h-screen bg-[#0d1117] text-gray-200 pb-12"> {/* Added pt-20 for padding-top */}
  {/* Profile Section */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Avatar */}
              <div className="relative group">
                <img
                  src={profile?.avatar_url}
                  alt={profile?.login}
                  className="w-full rounded-full border-4 border-gray-800/50 group-hover:border-blue-500/30 transition-colors duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </div>

              {/* Name & Bio */}
              <div>
                <h1 className="text-2xl font-display font-bold text-white">{profile?.name}</h1>
                <p className="text-lg text-gray-400 font-secondary">{profile?.login}</p>
                {profile?.bio && (
                  <p className="mt-3 text-gray-300 font-secondary">{profile?.bio}</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-gray-400 font-secondary">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{profile?.followers} followers</span>
                </div>
                <span>•</span>
                <div>{profile?.following} following</div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 text-gray-400 font-secondary">
                {profile?.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profile.location}
                  </div>
                )}
                {profile?.blog && (
                  <div className="flex items-center">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    <a href={profile.blog} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {profile.blog}
                    </a>
                  </div>
                )}
                {profile?.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href={`mailto:${profile.email}`} className="text-blue-500 hover:underline">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile?.created_at && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Repositories */}
          <div className="lg:col-span-3">
            {/* Search & Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#161b22] rounded-lg p-4 border border-gray-800/50 mb-6"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Find a repository..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-gray-800/50 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500/50 font-secondary"
                  />
                </div>

                {/* Language Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-[#0d1117] border border-gray-800/50 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500/50 font-secondary appearance-none"
                  >
                    <option value="">All languages</option>
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="relative">
                  <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-[#0d1117] border border-gray-800/50 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500/50 font-secondary appearance-none"
                  >
                    <option value="updated">Last updated</option>
                    <option value="stars">Stars</option>
                    <option value="forks">Forks</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Repository List */}
            <div className="space-y-4">
              {filteredRepos.map((repo) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-[#161b22] rounded-lg p-6 border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/repo/${repo.owner.login}/${repo.name}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-display font-semibold text-blue-500 hover:underline">
                        {repo.name}
                      </h3>
                      {repo.description && (
                        <p className="mt-2 text-gray-400 font-secondary">{repo.description}</p>
                      )}
                      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400 font-secondary">
                        {repo.language && (
                          <div className="flex items-center">
                            <Code2 className="w-4 h-4 mr-1" />
                            {repo.language}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center">
                          <GitFork className="w-4 h-4 mr-1" />
                          {repo.forks_count}
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {repo.watchers_count}
                        </div>
                        {repo.open_issues_count > 0 && (
                          <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {repo.open_issues_count}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 font-secondary">
                      Updated {new Date(repo.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Dashboard; 