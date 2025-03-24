import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../firebase';

const Profile = () => {
  const user = auth.currentUser;
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGithubData = async () => {
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('http://localhost:3000/api/github-data', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch GitHub data');
        
        const data = await response.json();
        setGithubData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchGithubData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <div className="flex items-center space-x-6">
          <img
            src={githubData?.profile?.avatar_url || user?.photoURL}
            alt="Profile"
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {githubData?.profile?.name || user?.displayName}
            </h1>
            <p className="text-gray-600">{user?.email}</p>
            <p className="mt-2 text-gray-700">{githubData?.profile?.bio}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900">Repositories</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {githubData?.profile?.public_repos}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900">Followers</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {githubData?.profile?.followers}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900">Following</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {githubData?.profile?.following}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Organizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {githubData?.orgs?.map((org) => (
              <div key={org.id} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4">
                <img
                  src={org.avatar_url}
                  alt={org.login}
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-medium">{org.login}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile; 