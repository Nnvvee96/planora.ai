/**
 * Auth Routes
 * 
 * Routes for authentication flow.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { Suspense } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load components to avoid circular dependencies and initialization errors
const AuthCallback = React.lazy(() => import('../components/AuthCallback').then(module => ({
  default: module.AuthCallback
})));

const EmailConfirmation = React.lazy(() => import('../components/EmailConfirmation').then(module => ({
  default: module.EmailConfirmation
})));

const EmailChangeVerification = React.lazy(() => import('../components/EmailChangeVerification').then(module => ({
  default: module.EmailChangeVerification
})));

const ForgotPassword = React.lazy(() => import('../components/ForgotPassword').then(module => ({
  default: module.ForgotPassword
})));

const ResetPassword = React.lazy(() => import('../components/ResetPassword').then(module => ({
  default: module.ResetPassword
})));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-planora-accent-purple"></div>
  </div>
);

/**
 * Auth routes configuration
 * Defines the routes for authentication features
 */
export const authRoutes: RouteObject[] = [
  {
    path: '/auth/callback',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AuthCallback />
      </Suspense>
    )
  },
  {
    path: '/auth/email-confirmation',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <EmailConfirmation />
      </Suspense>
    )
  },
  {
    path: '/auth/email-change-verification',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <EmailChangeVerification />
      </Suspense>
    )
  },
  {
    path: '/forgot-password',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ForgotPassword />
      </Suspense>
    )
  },
  {
    path: '/auth/reset-password',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ResetPassword />
      </Suspense>
    )
  }
];
