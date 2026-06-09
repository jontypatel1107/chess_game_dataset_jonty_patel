import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, AlertTriangle } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <Helmet>
        <title>404 - Not Found | Chess Analytics</title>
      </Helmet>
      
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-red-100 dark:bg-red-900/20 rounded-full text-red-600">
            <AlertTriangle size={64} />
          </div>
        </div>
        <h1 className="text-8xl font-black text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Page Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved to a different coordinate.
        </p>
        <Button icon={Home} onClick={() => navigate('/')} fullWidth>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
