import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const ContributionHeatmap = ({ repo, expanded = false }) => {
  const [contributions, setContributions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('year'); // Options: 'year', 'month', 'quarter'

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        // Get the GitHub token from localStorage
        const githubToken = localStorage.getItem('github_token');
        if (!githubToken) {
          throw new Error('GitHub token not found');
        }

        // Set the GitHub token in the request headers
        api.defaults.headers.common['x-github-token'] = githubToken;
        
        // Make the actual API call
        const response = await api.get(
          `/api/repository/${repo.owner.login}/${repo.name}/activity`
        );
        
        // Process the data into our required format
        const activityData = response.data;
        
        // Convert API data to the heatmap format
        const processedData = processContributionData(activityData, dateRange);
        setContributions(processedData);
      } catch (err) {
        console.error('Failed to fetch contributions:', err);
        setError('Failed to load contribution data');
        toast.error('Failed to load contribution data');
        
        // Fallback to mock data if in development
        if (process.env.NODE_ENV === 'development') {
          const mockContributions = generateMockData(dateRange);
          setContributions(mockContributions);
        }
      } finally {
        setLoading(false);
      }
    };

    if (repo) {
      fetchContributions();
    }
  }, [repo, dateRange]);

  // Helper function to process API data into heatmap format
  const processContributionData = (activityData, range) => {
    // Get number of weeks based on range
    const weekCount = range === 'year' ? 52 : range === 'quarter' ? 13 : 4;
    
    // Create a mapping of dates to counts
    const dateCountMap = new Map();
    
    // Process commits, issues, and PRs
    [...(activityData.commits || []), 
     ...(activityData.issues || []), 
     ...(activityData.pullRequests || [])]
      .forEach(item => {
        const date = new Date(item.date).toISOString().split('T')[0];
        dateCountMap.set(date, (dateCountMap.get(date) || 0) + item.count);
      });
    
    // Generate the weeks and days structure
    const today = new Date();
    const weeks = [];
    let totalCount = 0;
    
    // Start from weekCount weeks ago
    for (let w = weekCount - 1; w >= 0; w--) {
      const week = { days: [] };
      
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + (6 - d)));
        const dateStr = date.toISOString().split('T')[0];
        const count = dateCountMap.get(dateStr) || 0;
        totalCount += count;
        
        week.days.push({
          count,
          date
        });
      }
      
      weeks.push(week);
    }
    
    return {
      weeks,
      total: totalCount
    };
  };
  
  // Generate mock data for development/fallback
  const generateMockData = (range) => {
    const weekCount = range === 'year' ? 52 : range === 'quarter' ? 13 : 4;
    const weeks = Array.from({ length: weekCount }, (_, weekIndex) => ({
      days: Array.from({ length: 7 }, (_, dayIndex) => ({
        count: Math.floor(Math.random() * 10),
        date: new Date(Date.now() - (weekCount - 1 - weekIndex) * 7 * 24 * 60 * 60 * 1000 + dayIndex * 24 * 60 * 60 * 1000)
      }))
    }));
    
    // Calculate total
    const total = weeks.reduce(
      (sum, week) => sum + week.days.reduce((daySum, day) => daySum + day.count, 0), 
      0
    );
    
    return { weeks, total };
  };

  if (loading) {
    return (
      <div className="bg-[#161b22] rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#161b22] rounded-lg p-6">
        <div className="text-red-500">{error}</div>
        <button 
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!contributions) {
    return null;
  }

  const getColor = (count) => {
    if (count === 0) return 'bg-gray-800';
    if (count <= 2) return 'bg-green-900';
    if (count <= 4) return 'bg-green-800';
    if (count <= 6) return 'bg-green-700';
    return 'bg-green-600';
  };

  // Calculate how many weeks to display based on screen size and expanded state
  const getDisplayWeeks = () => {
    if (expanded) return contributions.weeks;
    
    // For non-expanded view, we'll show only the latest 13 weeks (quarter)
    // or the entire dataset if it's smaller than 13 weeks
    return contributions.weeks.slice(-Math.min(13, contributions.weeks.length));
  };
  
  const displayWeeks = getDisplayWeeks();

  return (
    <div className="bg-[#161b22] rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Contribution Activity</h2>
        <div className="flex space-x-4">
          <div className="text-gray-400 text-sm">
            Total: {contributions.total} contributions
          </div>
          {expanded && (
            <div className="flex space-x-2">
              <select 
                className="bg-gray-800 text-white border border-gray-700 rounded px-2 py-1 text-sm"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="year">Past Year</option>
                <option value="quarter">Past Quarter</option>
                <option value="month">Past Month</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className={`${expanded ? 'overflow-y-auto max-h-96' : ''}`}>
        {/* Day labels (Mon, Tue, etc.) */}
        <div className="flex">
          <div className="w-6 mr-2"></div> {/* Spacer for alignment */}
          <div className="flex flex-col text-xs text-gray-500 mr-2">
            <div className="h-3 mb-1">Mon</div>
            <div className="h-3 mb-1">Wed</div>
            <div className="h-3 mb-1">Fri</div>
          </div>
          
          {/* Main heatmap grid */}
          <div className="flex flex-1 overflow-x-auto pb-1"> 
            {displayWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1 mr-1">
                {week.days.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getColor(day.count)}`}
                    title={`${day.count} contributions on ${day.date.toLocaleDateString()}`}
                    data-date={day.date.toISOString().split('T')[0]}
                    data-count={day.count}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Month labels */}
        <div className="flex mt-2">
          <div className="w-8"></div> {/* Spacer for alignment */}
          <div className="flex flex-1 text-xs text-gray-500">
            {getMonthLabels(displayWeeks).map((month, index) => (
              <div 
                key={index} 
                className="flex-shrink-0"
                style={{ width: month.weeks * 16 + 'px' }} // 16px = width of week column (3px) + gap (1px) + right margin (1px)
              >
                {month.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
          <div className="w-3 h-3 rounded-sm bg-green-900"></div>
          <div className="w-3 h-3 rounded-sm bg-green-800"></div>
          <div className="w-3 h-3 rounded-sm bg-green-700"></div>
          <div className="w-3 h-3 rounded-sm bg-green-600"></div>
        </div>
        <span>More</span>
      </div>

      <div className="text-xs text-gray-400 text-center">
        Contribution activity over the past {dateRange === 'year' ? 'year' : dateRange === 'quarter' ? 'quarter' : 'month'}
      </div>
    </div>
  );
};

// Helper function to generate month labels for the x-axis
const getMonthLabels = (weeks) => {
  const months = [];
  let currentMonth = null;
  let weekCount = 0;
  
  weeks.forEach((week) => {
    // Use the first day of each week to determine the month
    const monthName = week.days[0].date.toLocaleString('default', { month: 'short' });
    
    if (monthName !== currentMonth) {
      if (currentMonth !== null) {
        months.push({ label: currentMonth, weeks: weekCount });
      }
      currentMonth = monthName;
      weekCount = 1;
    } else {
      weekCount++;
    }
  });
  
  // Add the last month
  if (currentMonth !== null) {
    months.push({ label: currentMonth, weeks: weekCount });
  }
  
  return months;
};

export default ContributionHeatmap;