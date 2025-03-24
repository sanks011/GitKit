import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: '',  // Use relative URLs
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Get tokens from localStorage
      const firebaseToken = localStorage.getItem('firebase_token');
      const githubToken = localStorage.getItem('github_token');

      // Log token status for debugging
      console.log('API Request Debug:', {
        url: config.url,
        method: config.method,
        hasFirebaseToken: !!firebaseToken,
        hasGithubToken: !!githubToken,
        path: config.url?.split('/').pop(),
        currentHeaders: config.headers
      });

      // Validate tokens before adding to headers
      if (!firebaseToken) {
        console.error('Missing Firebase token');
        localStorage.removeItem('github_token'); // Clear GitHub token if Firebase token is missing
        throw new Error('No Firebase token found');
      }

      if (!githubToken) {
        console.error('Missing GitHub token');
        localStorage.removeItem('firebase_token'); // Clear Firebase token if GitHub token is missing
        throw new Error('No GitHub token found');
      }

      // Create new headers object to ensure we're not modifying the original
      const headers = {
        ...config.headers,
        'Authorization': `Bearer ${firebaseToken}`,
        'x-github-token': githubToken
      };

      // Update config with new headers
      config.headers = headers;

      // Log final headers (without sensitive data)
      console.log('Final Request Headers:', {
        ...config.headers,
        'Authorization': '[PRESENT]',
        'x-github-token': '[PRESENT]'
      });

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      // Clear tokens if they're invalid
      localStorage.removeItem('firebase_token');
      localStorage.removeItem('github_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      headers: response.config.headers
    });
    return response;
  },
  async (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      const errorMessage = 'Request timed out. Please try again.';
      console.error('Timeout Error:', {
        url: error.config?.url,
        timeout: error.config?.timeout,
        message: errorMessage
      });
      toast.error(errorMessage);
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('Authentication Error:', {
        url: error.config?.url,
        error: error.response?.data?.error,
        details: error.response?.data?.details,
        requestHeaders: error.config?.headers,
        responseHeaders: error.response?.headers
      });

      // Clear tokens if they're invalid
      if (error.response.data?.error === 'Invalid Firebase token' || 
          error.response.data?.error === 'Invalid GitHub token' ||
          error.response.data?.error === 'GitHub authentication required' ||
          error.response.data?.error === 'Firebase ID token has expired' ||
          error.response.data?.error === 'No authorization header provided' ||
          error.response.data?.error === 'No GitHub token provided' ||
          error.response.data?.error === 'No Firebase token found' ||
          error.response.data?.error === 'No GitHub token found') {
        localStorage.removeItem('firebase_token');
        localStorage.removeItem('github_token');
        window.location.href = '/login';
      }
      toast.error(error.response.data?.details || 'Authentication failed. Please sign in again.');
    }

    // Handle other errors
    const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
      headers: error.config?.headers
    });

    // Show error toast with more specific message
    toast.error(errorMessage || 'An error occurred. Please try again.');

    return Promise.reject(error);
  }
);

export default api; 