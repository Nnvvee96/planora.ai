/**
 * Auth Routes
 * 
 * Routes for authentication flow.
 * Following Planora's architectural principles with feature-first organization.
 */

import { RouteObject } from 'react-router-dom';
import { AuthCallback } from '../components/AuthCallback';
import { EmailConfirmation } from '../components/EmailConfirmation';
import { EmailChangeVerification } from '../components/EmailChangeVerification';
import { ForgotPassword } from '../components/ForgotPassword';
import { ResetPassword } from '../components/ResetPassword';

/**
 * Auth routes configuration
 * Defines the routes for authentication features
 */
export const authRoutes: RouteObject[] = [
  {
    path: '/auth/callback',
    element: <AuthCallback />
  },
  {
    path: '/auth/email-confirmation',
    element: <EmailConfirmation />
  },
  {
    path: '/auth/email-change-verification',
    element: <EmailChangeVerification />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/auth/reset-password',
    element: <ResetPassword />
  }
];
