import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = ({ profile }) => {
  const { logout } = useAuth();

  if (!profile) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center">
        <img
          src={profile.avatar_url}
          alt={profile.login}
          className="w-32 h-32 rounded-full mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold">{profile.name || profile.login}</h2>
        {profile.bio && (
          <p className="text-gray-600 mt-2">{profile.bio}</p>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{profile.public_repos}</div>
            <div className="text-sm text-gray-500">Repositories</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{profile.followers}</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{profile.following}</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
        </div>

        {profile.company && (
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
            </svg>
            <span>{profile.company}</span>
          </div>
        )}

        {profile.location && (
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{profile.location}</span>
          </div>
        )}

        {profile.blog && (
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            <a href={profile.blog} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {profile.blog}
            </a>
          </div>
        )}

        {profile.twitter_username && (
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
            </svg>
            <a href={`https://twitter.com/${profile.twitter_username}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              @{profile.twitter_username}
            </a>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={logout}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile; 