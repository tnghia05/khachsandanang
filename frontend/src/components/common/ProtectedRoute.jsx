import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!isAuthenticated) {
    toast.error('Vui lòng đăng nhập để truy cập trang này');
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
