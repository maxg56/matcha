import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '@/stores/adminAuthStore';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { isAuthenticated, checkAuth } = useAdminAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, [checkAuth]);

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to admin login with return URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated, redirect to admin dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};
