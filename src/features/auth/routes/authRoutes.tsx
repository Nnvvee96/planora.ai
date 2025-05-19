/**
 * Auth Routes
 * 
 * Routes for authentication flow.
 * Following Planora's architectural principles with feature-first organization.
 */

import { RouteObject } from 'react-router-dom';
import { AuthCallback } from '../components/AuthCallback';

/**
 * Auth routes configuration
 * Defines the routes for authentication features
 */
export const authRoutes: RouteObject[] = [
  {
    path: '/auth/callback',
    element: <AuthCallback />
  }
];
