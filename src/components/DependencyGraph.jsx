import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';
import { Loader2, AlertCircle, Package } from 'lucide-react';
import api from '../utils/api';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const DependencyGraph = ({ repo, expanded = false }) => {
  const [dependencies, setDependencies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'production', 'development'

  useEffect(() => {
    const fetchDependencies = async () => {
      if (!repo?.owner?.login || !repo?.name) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/api/repository/${repo.owner.login}/${repo.name}/dependencies`);
        
        if (!response.data) {
          throw new Error('Empty response from API');
        }
        
        // Ensure we have the expected data structure
        const data = {
          production: Array.isArray(response.data.production) ? response.data.production : [],
          development: Array.isArray(response.data.development) ? response.data.development : []
        };
        
        setDependencies(data);
      } catch (err) {
        console.error('Failed to fetch dependencies:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load dependency data';
        setError(errorMessage);
        toast.error('Failed to load dependency data');
        
        // In development, provide mock data
        if (process.env.NODE_ENV === 'development') {
          setDependencies(generateMockData());
        }
      } finally {
        setLoading(false);
      }
    };

    if (repo) {
      fetchDependencies();
    }
  }, [repo]);

  // Helper to generate mock data in development environment
  const generateMockData = () => {
    return {
      production: Array.from({ length: 12 }, (_, i) => ({
        name: `prod-dependency-${i + 1}`,
        version: `^${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
      })),
      development: Array.from({ length: 8 }, (_, i) => ({
        name: `dev-dependency-${i + 1}`,
        version: `^${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
      }))
    };
  };

  if (loading) {
    return (
      <div className="bg-[#161b22] rounded-lg p-6">
        <div className="flex items-center space-x-2 text-gray-400 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="font-display text-lg">Loading dependencies...</span>
        </div>
        <div className={`${expanded ? 'h-96' : 'h-64'} bg-gray-700 bg-opacity-20 rounded animate-pulse`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#161b22] rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-500 mb-4">
          <AlertCircle className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Dependencies</h3>
        </div>
        <div className="text-red-400 mb-4">{error}</div>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dependencies || (!dependencies.production?.length && !dependencies.development?.length)) {
    return (
      <div className="bg-[#161b22] rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Package className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Dependencies</h3>
        </div>
        <div className="text-gray-400 py-8 text-center">No dependencies found for this repository</div>
      </div>
    );
  }

  // Calculate totals
  const prodTotal = dependencies.production.length;
  const devTotal = dependencies.development.length;
  const totalDeps = prodTotal + devTotal;

  // Prepare chart data
  const data = {
    labels: ['Production', 'Development'],
    datasets: [{
      data: [prodTotal, devTotal],
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 192, 0.8)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
      hoverOffset: 5
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = Math.round((value / totalDeps) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-[#161b22] rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Dependencies</h3>
        </div>
        
        <div className="text-sm text-gray-400">
          Total: {totalDeps} dependencies
        </div>
      </div>
      
      <div className={expanded ? 'h-80' : 'h-64'}>
        <Doughnut data={data} options={options} />
      </div>
      
      {expanded && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
            <h4 className="text-md font-semibold text-white">Dependency Details</h4>
            
            <div className="flex space-x-1 text-sm">
              <button
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeCategory === 'all' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveCategory('all')}
              >
                All ({totalDeps})
              </button>
              <button
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeCategory === 'production' ? 'bg-blue-900/50 text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveCategory('production')}
              >
                Production ({prodTotal})
              </button>
              <button
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeCategory === 'development' ? 'bg-teal-900/50 text-teal-400' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveCategory('development')}
              >
                Development ({devTotal})
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-80">
            {(activeCategory === 'all' || activeCategory === 'production') && prodTotal > 0 && (
              <div className="mb-4">
                {activeCategory === 'all' && (
                  <h5 className="text-sm font-medium text-blue-400 mb-2">Production Dependencies</h5>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Version</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {dependencies.production.map((dep, index) => (
                        <tr key={index} className="hover:bg-gray-800/50">
                          <td className="px-4 py-2 text-sm text-white">{dep.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-400">{dep.version}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {(activeCategory === 'all' || activeCategory === 'development') && devTotal > 0 && (
              <div>
                {activeCategory === 'all' && (
                  <h5 className="text-sm font-medium text-teal-400 mb-2">Development Dependencies</h5>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Version</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {dependencies.development.map((dep, index) => (
                        <tr key={index} className="hover:bg-gray-800/50">
                          <td className="px-4 py-2 text-sm text-white">{dep.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-400">{dep.version}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {((activeCategory === 'production' && prodTotal === 0) || 
              (activeCategory === 'development' && devTotal === 0) || 
              (activeCategory === 'all' && totalDeps === 0)) && (
              <div className="text-gray-400 text-center py-4">
                No {activeCategory !== 'all' ? activeCategory : ''} dependencies found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DependencyGraph;