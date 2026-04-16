/**
 * Simple Universal Router - univercel-tech-forge
 * Basic routing for core pages only
 */

import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Lazy loaded components
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

// Auth guard component
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Route configuration
const routes = [
  // Public routes
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <LandingPage />
      </Suspense>
    )
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <LoginPage />
      </Suspense>
    )
  },
  
  // Protected routes
  {
    path: '/dashboard',
    element: (
      <AuthGuard>
        <Suspense fallback={<LoadingSpinner />}>
          <DashboardPage />
        </Suspense>
      </AuthGuard>
    )
  },
  
  // 404 fallback
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotFoundPage />
      </Suspense>
    )
  }
];

// Create router
const router = createBrowserRouter(routes);

// Universal router component
export const UniversalRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default UniversalRouter;
