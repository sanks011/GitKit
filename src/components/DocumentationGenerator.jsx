import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, Download, Copy, Check, X, FileText, Zap, Book, Code, FileCode, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cache for storing generated docs to prevent repeated API calls
const docCache = new Map();

const DocumentationGenerator = ({ repository }) => {
  const [generatedDocs, setGeneratedDocs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('readme');
  const [editing, setEditing] = useState(false);
  const [editedDocs, setEditedDocs] = useState('');
  const [copied, setCopied] = useState(false);
  const [fileAnalysis, setFileAnalysis] = useState(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // When the repository changes, reset analysis state
  useEffect(() => {
    if (!repository) return;
    setFileAnalysis(null);
    setAnalysisComplete(false);
  }, [repository]);

  // When the repository or selected type changes, check the cache first
  useEffect(() => {
    if (!repository) return;
    
    const cacheKey = `${repository.full_name}-${selectedType}`;
    if (docCache.has(cacheKey)) {
      setGeneratedDocs(docCache.get(cacheKey));
      setEditedDocs(docCache.get(cacheKey));
    } else {
      setGeneratedDocs(null);
      // Don't auto-generate, let user choose between quick and AI analysis
    }
  }, [repository, selectedType]);

  const analyzeRepository = async () => {
    if (!repository) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const token = await auth.currentUser.getIdToken();
      const githubToken = localStorage.getItem('github_token'); // Assuming you store GitHub token
      
      const response = await api.get(`/api/github/${repository.owner.login}/${repository.name}/analyze-for-docs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-GitHub-Token': githubToken
        }
      });
      
      // Process the repository analysis to extract key information
      const analysis = response.data;
      
      // Extract technologies from dependencies and languages
      const technologies = [];
      
      // Add languages
      if (analysis.repository.languages) {
        Object.keys(analysis.repository.languages).forEach(lang => {
          technologies.push(lang);
        });
      }
      
      // Add frameworks and libraries from dependencies
      if (analysis.repository.dependencies?.dependencies) {
        const deps = analysis.repository.dependencies.dependencies;
        // Look for common frameworks
        if (deps.react) technologies.push('React');
        if (deps.vue) technologies.push('Vue.js');
        if (deps.angular) technologies.push('Angular');
        if (deps.express) technologies.push('Express.js');
        if (deps.next) technologies.push('Next.js');
        if (deps.nuxt) technologies.push('Nuxt.js');
        if (deps.tailwindcss) technologies.push('Tailwind CSS');
        if (deps.bootstrap) technologies.push('Bootstrap');
        if (deps.firebase) technologies.push('Firebase');
        if (deps['@supabase/supabase-js']) technologies.push('Supabase');
        // Add more popular dependencies here
      }
      
      // Identify project type and purpose from files and dependencies
      let projectPurpose = 'A software project';
      
      if (analysis.files.some(f => f.path.includes('api/') || f.path.includes('server.js'))) {
        projectPurpose = 'A web server or API';
        if (analysis.files.some(f => f.path.includes('react') || f.path.includes('App.js'))) {
          projectPurpose = 'A full-stack web application with API backend';
        }
      } else if (analysis.files.some(f => f.path.includes('App.js') || f.path.includes('index.jsx') || f.path.includes('React'))) {
        projectPurpose = 'A React-based web application';
      } else if (analysis.files.some(f => f.path.includes('App.vue'))) {
        projectPurpose = 'A Vue.js-based web application';
      }
      
      // Extract potential features
      const features = [];
      
      // Look for authentication
      if (analysis.files.some(f => 
        f.content.includes('auth') || 
        f.content.includes('login') || 
        f.content.includes('signin')
      )) {
        features.push('User authentication');
      }
      
      // Look for database interactions
      if (analysis.files.some(f => 
        f.content.includes('mongoose') || 
        f.content.includes('sequelize') || 
        f.content.includes('prisma') ||
        f.content.includes('firestore')
      )) {
        features.push('Database integration');
      }
      
      // Look for file uploads
      if (analysis.files.some(f => 
        f.content.includes('multer') || 
        f.content.includes('upload') || 
        f.content.includes('storage')
      )) {
        features.push('File upload capabilities');
      }
      
      // Save the analysis
      const processedAnalysis = {
        technologies: [...new Set(technologies)], // Remove duplicates
        projectPurpose,
        features,
        fileCount: analysis.files.length,
        hasPackageJson: analysis.files.some(f => f.path === 'package.json'),
        hasReadme: analysis.files.some(f => f.path === 'README.md'),
        mainFiles: analysis.files.map(f => f.path)
      };
      
      setFileAnalysis(processedAnalysis);
      setAnalysisComplete(true);
      
      // Auto-generate after analysis
      generateDocumentation(selectedType, processedAnalysis);
      
    } catch (err) {
      console.error('Repository analysis failed:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to analyze repository';
      setError(errorMessage);
      toast.error(`Repository analysis failed: ${errorMessage}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateDocumentation = async (type, analysis = null) => {
    if (!repository) return;
    
    const cacheKey = `${repository.full_name}-${type}`;
    
    // Check if we have this in cache
    if (docCache.has(cacheKey)) {
      setGeneratedDocs(docCache.get(cacheKey));
      setEditedDocs(docCache.get(cacheKey));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = await auth.currentUser.getIdToken();
      const githubToken = localStorage.getItem('github_token');
      
      const response = await api.post('/api/github/generate-docs', {
        repoData: repository,
        docType: type,
        fileAnalysis: analysis || fileAnalysis
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-GitHub-Token': githubToken
        }
      });
      
      const docs = response.data.documentation;
      setGeneratedDocs(docs);
      setEditedDocs(docs);
      
      // Cache the result
      docCache.set(cacheKey, docs);
      
      toast.success('Documentation generated successfully');
    } catch (err) {
      console.error('Documentation generation failed:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate documentation';
      setError(errorMessage);
      toast.error(`Documentation generation failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setEditing(false);
  };

  const handleEditToggle = () => {
    if (editing) {
      // Save changes
      setGeneratedDocs(editedDocs);
      const cacheKey = `${repository.full_name}-${selectedType}`;
      docCache.set(cacheKey, editedDocs);
      toast.success('Documentation updated');
    } else {
      // Start editing
      setEditedDocs(generatedDocs);
    }
    setEditing(!editing);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedDocs)
      .then(() => {
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
      });
  };

  const handleDownload = () => {
    let filename;
    switch (selectedType) {
      case 'readme':
        filename = 'README.md';
        break;
      case 'contributing':
        filename = 'CONTRIBUTING.md';
        break;
      case 'codeOfConduct':
        filename = 'CODE_OF_CONDUCT.md';
        break;
      case 'api':
        filename = 'API.md';
        break;
      default:
        filename = 'documentation.md';
    }
    
    const blob = new Blob([generatedDocs], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  // Generate a basic documentation without AI analysis
  const handleQuickGenerate = () => {
    generateDocumentation(selectedType);
  };

  // Document type icons mapping
  const documentIcons = {
    readme: <Book className="w-4 h-4" />,
    contributing: <FileText className="w-4 h-4" />,
    codeOfConduct: <Shield className="w-4 h-4" />,
    api: <Code className="w-4 h-4" />
  };

  // Document type labels
  const docTypeLabels = {
    readme: 'README.md',
    contributing: 'CONTRIBUTING.md',
    codeOfConduct: 'CODE_OF_CONDUCT.md',
    api: 'API.md'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="bg-[#161b22] rounded-lg border border-gray-800/50 p-6">
        <div className="flex items-center mb-4">
          <FileCode className="text-blue-500 w-6 h-6 mr-2" />
          <h2 className="text-xl font-display font-semibold text-white">Documentation Generator</h2>
        </div>
        <p className="text-gray-400 font-secondary">
          Generate standardized documentation for your repository using AI-powered analysis.
        </p>
      </div>

      {/* Document Type Selection Tabs */}
      <div className="flex space-x-1">
        {Object.entries(docTypeLabels).map(([type, label]) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTypeChange(type)}
            className={`px-4 py-2 rounded-lg font-display text-sm flex items-center space-x-2 transition-colors duration-200 ${
              selectedType === type
                ? 'bg-blue-500/10 text-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {documentIcons[type]}
            <span>{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Generation Options */}
      {!generatedDocs && !loading && !analyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#161b22] rounded-lg border border-gray-800/50 overflow-hidden"
          >
            <button
              className="w-full h-full p-6 text-left transition-colors hover:bg-[#1c2330]"
              onClick={handleQuickGenerate}
              disabled={loading}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-display font-semibold text-white">Quick Generate</h3>
              </div>
              <p className="text-gray-400 font-secondary">
                Generate basic documentation using repository metadata. Best for simple projects or when speed is a priority.
              </p>
            </button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#161b22] rounded-lg border border-gray-800/50 overflow-hidden"
          >
            <button
              className="w-full h-full p-6 text-left transition-colors hover:bg-[#1c2330]"
              onClick={analyzeRepository}
              disabled={analyzing || loading}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-display font-semibold text-white">AI Analysis</h3>
              </div>
              <p className="text-gray-400 font-secondary">
                Analyze code structure for in-depth documentation. Best for complex projects requiring detailed explanations.
              </p>
            </button>
          </motion.div>
        </div>
      )}

      {/* Loading States */}
      {(analyzing || loading) && (
        <div className="bg-[#161b22] rounded-lg border border-gray-800/50 p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <span className="text-lg font-display text-white">
              {analyzing ? 'Analyzing repository structure...' : 'Generating documentation...'}
            </span>
            <p className="text-gray-400 font-secondary mt-2">
              {analyzing 
                ? 'This may take a moment as we scan code files and dependencies'
                : 'Creating comprehensive documentation based on repository analysis'}
            </p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && !analyzing && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#161b22] rounded-lg border border-red-900/50 p-6"
        >
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center mt-1">
              <X className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-white mb-1">Error Encountered</h3>
              <p className="text-gray-400 font-secondary">{error}</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => generateDocumentation(selectedType)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-display text-sm"
          >
            Try Again
          </motion.button>
        </motion.div>
      )}
      
      {/* Generated Documentation */}
      {generatedDocs && !loading && !analyzing && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#161b22] rounded-lg border border-gray-800/50 p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              {documentIcons[selectedType]}
              <h3 className="text-lg font-display font-semibold text-white">
                {docTypeLabels[selectedType]}
              </h3>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-display text-sm flex items-center space-x-2 transition-colors ${
                  editing 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                onClick={handleEditToggle}
                title={editing ? "Save changes" : "Edit documentation"}
              >
                {editing ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <span>Edit</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg font-display text-sm flex items-center space-x-2 transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                onClick={handleCopyToClipboard}
                title="Copy to clipboard"
                disabled={editing}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-green-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    <span>Copy</span>
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg font-display text-sm flex items-center space-x-2 transition-colors bg-gray-700 hover:bg-gray-600 text-white"
                onClick={handleDownload}
                title="Download file"
                disabled={editing}
              >
                <Download className="w-4 h-4 mr-1" />
                <span>Download</span>
              </motion.button>
            </div>
          </div>
          
          {editing ? (
            <textarea
              className="w-full h-96 bg-[#0d1117] text-gray-200 p-4 rounded-lg border border-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={editedDocs}
              onChange={(e) => setEditedDocs(e.target.value)}
            />
          ) : (
            <div className="bg-[#0d1117] p-4 rounded-lg overflow-auto max-h-96 border border-gray-700">
              <pre className="whitespace-pre-wrap text-gray-200 font-mono">{generatedDocs}</pre>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DocumentationGenerator;