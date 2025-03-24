import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import { Loader2 } from 'lucide-react';
import api from '../utils/api';

const ActivityGraph = ({ repo, expanded = false }) => {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'quarter', 'year'

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        
        // Get the GitHub token from localStorage
        const githubToken = localStorage.getItem('github_token');
        if (!githubToken) {
          throw new Error('GitHub token not found');
        }

        // Set the GitHub token in the request headers
        api.defaults.headers.common['x-github-token'] = githubToken;
        
        // Fetch activity data
        const response = await api.get(
          `/api/repository/${repo.owner.login}/${repo.name}/activity`
        );
        
        setActivityData(response.data);
      } catch (err) {
        console.error('Failed to fetch activity data:', err);
        setError('Failed to load activity data');
        toast.error('Failed to load activity data');
        
        // Generate mock data in development
        if (process.env.NODE_ENV === 'development') {
          setActivityData(generateMockData());
        }
      } finally {
        setLoading(false);
      }
    };

    if (repo) {
      fetchActivityData();
    }
  }, [repo]);

  const generateMockData = () => {
    // Create dates for the past year
    const dates = [];
    const today = new Date();
    
    for (let i = 365; i > 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Generate random activity
    return {
      commits: dates.map(date => ({
        date,
        count: Math.floor(Math.random() * 5)
      })),
      issues: dates.map(date => ({
        date,
        count: Math.floor(Math.random() * 3)
      })),
      pullRequests: dates.map(date => ({
        date,
        count: Math.floor(Math.random() * 2)
      }))
    };
  };

  const prepareChartData = () => {
    if (!activityData) return null;
    
    // Determine date range based on timeframe
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    // Generate all dates in the range
    const dateRange = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dateRange.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Create activity maps for quick lookup
    const commitMap = new Map();
    const issueMap = new Map();
    const prMap = new Map();
    
    activityData.commits?.forEach(item => {
      const date = item.date.split('T')[0];
      commitMap.set(date, (commitMap.get(date) || 0) + item.count);
    });
    
    activityData.issues?.forEach(item => {
      const date = item.date.split('T')[0];
      issueMap.set(date, (issueMap.get(date) || 0) + item.count);
    });
    
    activityData.pullRequests?.forEach(item => {
      const date = item.date.split('T')[0];
      prMap.set(date, (prMap.get(date) || 0) + item.count);
    });
    
    // Prepare chart data
    return {
      labels: dateRange,
      datasets: [
        {
          label: 'Commits',
          data: dateRange.map(date => commitMap.get(date) || 0),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        },
        {
          label: 'Issues',
          data: dateRange.map(date => issueMap.get(date) || 0),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4
        },
        {
          label: 'Pull Requests',
          data: dateRange.map(date => prMap.get(date) || 0),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxTicksLimit: expanded ? 20 : 10,
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-[#161b22] rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-gray-400">Loading activity data...</span>
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
            <p className="mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  if (!chartData) return null;

  return (
    <div className="bg-[#161b22] rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Repository Activity</h2>
        <div className="flex space-x-2">
          <select
            className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="quarter">Past Quarter</option>
            <option value="year">Past Year</option>
          </select>
        </div>
      </div>

      <div style={{ height: expanded ? '400px' : '300px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Commits</h3>
            <p className="text-3xl font-bold text-white">
              {chartData.datasets[0].data.reduce((sum, val) => sum + val, 0)}
            </p>
            <p className="text-gray-400 text-sm mt-2">Total in selected period</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Issues</h3>
            <p className="text-3xl font-bold text-white">
              {chartData.datasets[1].data.reduce((sum, val) => sum + val, 0)}
            </p>
            <p className="text-gray-400 text-sm mt-2">Total in selected period</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-400 mb-2">Pull Requests</h3>
            <p className="text-3xl font-bold text-white">
              {chartData.datasets[2].data.reduce((sum, val) => sum + val, 0)}
            </p>
            <p className="text-gray-400 text-sm mt-2">Total in selected period</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityGraph;