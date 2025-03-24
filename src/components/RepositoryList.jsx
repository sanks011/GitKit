import React from 'react';

const RepositoryList = ({ repositories, onSelectRepo, selectedRepo }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all ${
            selectedRepo?.id === repo.id ? 'ring-2 ring-blue-500' : 'hover:shadow-xl'
          }`}
          onClick={() => onSelectRepo(repo)}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{repo.name}</h3>
            <div className="flex items-center space-x-2">
              <span className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {repo.stargazers_count}
              </span>
              <span className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {repo.forks_count}
              </span>
            </div>
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2">
            {repo.description || 'No description provided'}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {repo.topics?.map((topic) => (
              <span
                key={topic}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${
                repo.language ? 'bg-blue-500' : 'bg-gray-300'
              }`}></span>
              {repo.language || 'Unknown'}
            </div>
            <span>
              Updated {new Date(repo.updated_at).toLocaleDateString()}
            </span>
          </div>

          {repo.open_issues_count > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              {repo.open_issues_count} open issues
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RepositoryList; 