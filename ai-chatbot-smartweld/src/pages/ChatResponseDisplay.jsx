import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ResultsPage } from '../components/chatbotComponents/ResultsPage';



const ChatResponse = ({ currentColor }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the stored API response from localStorage
    const loadResults = () => {
      const storedResults = localStorage.getItem('chatAnalysisResults');
      if (storedResults) {
        try {
          const parsedResults = JSON.parse(storedResults);
          setApiResponse(parsedResults);
        } catch (error) {
          console.error('Error parsing stored results:', error);
        }
      }
      setLoading(false);
    };

    // Force reload when URL changes (new timestamp parameter)
    setLoading(true);
    loadResults();

    // Listen for storage changes (in case data is updated from another tab/window)
    const handleStorageChange = (e) => {
      if (e.key === 'chatAnalysisResults') {
        loadResults();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event for same-tab updates
    const handleCustomStorageChange = () => {
      loadResults();
    };

    window.addEventListener('chatResultsUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chatResultsUpdated', handleCustomStorageChange);
    };
  }, [location.search]); // Re-run when URL parameters change

  const handleBackToChat = () => {
    // Clear the stored results and navigate back
    localStorage.removeItem('chatAnalysisResults');
    // Clear any existing data to ensure fresh start
    setApiResponse(null);
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading analysis results...</p>
        </div>
      </div>
    );
  }

  // Check if apiResponse is null or doesn't have the expected structure
  if (!apiResponse || !apiResponse.reply) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
          <p className="text-gray-400 mb-4">No analysis results are available.</p>
          <button
          type='button'
            onClick={handleBackToChat}
            className="px-4 py-2 dark:text-white rounded-md transition-colors"
            style={{ backgroundColor: currentColor }}
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white text-gray-200 dark:text-gray-200 dark:bg-gray-900 p-6">
      <ResultsPage apiResponse={apiResponse} onBack={handleBackToChat} />
    </div>
  );
};

export default ChatResponse;