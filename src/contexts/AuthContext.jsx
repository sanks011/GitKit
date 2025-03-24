import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GithubAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [githubToken, setGithubToken] = useState(null);

  // Load GitHub token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    console.log('Initial GitHub token check:', token ? 'Present' : 'Not found');
    if (token) {
      setGithubToken(token);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user ? 'User present' : 'No user');
      
      if (user) {
        try {
          // Get fresh Firebase token
          const firebaseToken = await user.getIdToken(true);
          localStorage.setItem('firebase_token', firebaseToken);
          console.log('Firebase token refreshed and stored');

          // Check for GitHub token
          const storedGithubToken = localStorage.getItem('github_token');
          console.log('GitHub token status:', storedGithubToken ? 'Present' : 'Not found');
          
          if (!storedGithubToken) {
            console.warn('No GitHub token found, user may need to reconnect GitHub');
            toast.error('GitHub connection required. Please sign in with GitHub.');
            // Clear Firebase token if GitHub token is missing
            localStorage.removeItem('firebase_token');
            setUser(null);
            setGithubToken(null);
            window.location.href = '/login';
            return;
          }

          setGithubToken(storedGithubToken);

          // Set user state with tokens
          const updatedUser = {
            ...user,
            firebaseToken,
            githubToken: storedGithubToken
          };
          setUser(updatedUser);
          console.log('User state updated with tokens');
        } catch (error) {
          console.error('Error during auth state change:', error);
          toast.error('Failed to authenticate. Please try again.');
          await signOut();
        }
      } else {
        // Clear tokens and state on sign out
        console.log('Clearing auth state and tokens');
        localStorage.removeItem('firebase_token');
        localStorage.removeItem('github_token');
        setUser(null);
        setGithubToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGitHub = async () => {
    try {
      console.log('Starting GitHub sign in process');
      const provider = new GithubAuthProvider();
      provider.addScope('repo');
      provider.addScope('read:user');
      provider.addScope('user:email');
      
      const result = await signInWithPopup(auth, provider);
      console.log('GitHub sign in successful');
      
      // Get GitHub token from credential
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (!token) {
        console.error('No GitHub token in credential');
        throw new Error('No GitHub token received');
      }

      console.log('GitHub token received');
      
      // Store GitHub token
      localStorage.setItem('github_token', token);
      setGithubToken(token);
      
      // Get fresh Firebase token
      const firebaseToken = await result.user.getIdToken(true);
      console.log('Firebase token refreshed');
      
      // Store Firebase token
      localStorage.setItem('firebase_token', firebaseToken);
      
      // Set user state with both tokens
      const updatedUser = {
        ...result.user,
        firebaseToken,
        githubToken: token
      };
      setUser(updatedUser);
      console.log('User state updated with fresh tokens');

      // Verify tokens are stored
      const storedFirebaseToken = localStorage.getItem('firebase_token');
      const storedGithubToken = localStorage.getItem('github_token');
      console.log('Token verification:', {
        hasFirebaseToken: !!storedFirebaseToken,
        hasGithubToken: !!storedGithubToken
      });

      toast.success('Successfully signed in with GitHub!');
      return result.user;
    } catch (error) {
      console.error('GitHub sign in error:', error);
      // Clear any partial state
      localStorage.removeItem('github_token');
      localStorage.removeItem('firebase_token');
      setGithubToken(null);
      toast.error(error.message || 'Failed to sign in with GitHub');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process');
      await firebaseSignOut(auth);
      localStorage.removeItem('firebase_token');
      localStorage.removeItem('github_token');
      setUser(null);
      setGithubToken(null);
      console.log('Sign out completed, all tokens cleared');
      toast.success('Signed out successfully');
      window.location.href = '/login'; // Force a full page reload to clear all state
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const value = {
    user,
    loading,
    githubToken,
    signInWithGitHub,
    logout: signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 