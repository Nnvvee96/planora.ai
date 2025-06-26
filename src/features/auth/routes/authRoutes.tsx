/**
 * Auth Routes
 *
 * Routes for authentication flow.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { Suspense, lazy } from "react";
import { RouteObject } from "react-router-dom";

// Directly lazy-load components to avoid circular dependencies with authApi
const AuthCallback = lazy(() =>
  import("../components/AuthCallback").then((module) => ({
    default: module.AuthCallback,
  })),
);
const EmailConfirmation = lazy(() =>
  import("../components/EmailConfirmation").then((module) => ({
    default: module.EmailConfirmation,
  })),
);
const EmailChangeVerification = lazy(() =>
  import("../components/EmailChangeVerification").then((module) => ({
    default: module.EmailChangeVerification,
  })),
);
const ForgotPassword = lazy(() =>
  import("../components/ForgotPassword").then((module) => ({
    default: module.ForgotPassword,
  })),
);
const ResetPassword = lazy(() =>
  import("../components/ResetPassword").then((module) => ({
    default: module.ResetPassword,
  })),
);

// Simple loading fallback inline to avoid exporting components from routes file
const loadingFallback = (
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
    path: "/auth/callback",
    element: (
      <Suspense fallback={loadingFallback}>
        <AuthCallback />
      </Suspense>
    ),
  },
  {
    path: "/auth/email-confirmation",
    element: (
      <Suspense fallback={loadingFallback}>
        <EmailConfirmation />
      </Suspense>
    ),
  },
  {
    path: "/auth/email-change-verification",
    element: (
      <Suspense fallback={loadingFallback}>
        <EmailChangeVerification />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={loadingFallback}>
        <ForgotPassword />
      </Suspense>
    ),
  },
  {
    path: "/auth/reset-password",
    element: (
      <Suspense fallback={loadingFallback}>
        <ResetPassword />
      </Suspense>
    ),
  },
];
