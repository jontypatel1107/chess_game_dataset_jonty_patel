import React from 'react';
import { CircularProgress } from '@mui/material';

const Loader = ({ fullPage = false, size = 40 }) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
        <CircularProgress size={size} color="primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <CircularProgress size={size} color="primary" />
    </div>
  );
};

export default Loader;
