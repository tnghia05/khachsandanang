import React from 'react';

const LoadingSpinner = ({ message = 'Đang tải...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-500 mb-4"></div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
