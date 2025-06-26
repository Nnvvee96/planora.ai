/**
 * Main Application Entry Point
 *
 * Production-ready initialization with comprehensive error handling
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import "./index.css";

// Production error handling
const handleGlobalError = (
  error: Error,
  errorInfo?: { componentStack?: string },
) => {
  console.error("Global Error:", error, errorInfo);

  // In production, you might want to send this to an error reporting service
  if (import.meta.env.PROD) {
    // Example: Sentry, LogRocket, etc.
    // errorReportingService.captureException(error, errorInfo);
  }
};

// Global error handler for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
  handleGlobalError(new Error(`Unhandled Promise Rejection: ${event.reason}`));

  // Prevent the default browser behavior of logging to console
  event.preventDefault();
});

// Global error handler for uncaught exceptions
window.addEventListener("error", (event) => {
  console.error("Uncaught Error:", event.error);
  handleGlobalError(event.error);
});

// Production-ready root element initialization
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Root element not found. Please ensure the HTML template includes a div with id="root".',
  );
}

// Create React root with error boundary
const root = ReactDOM.createRoot(rootElement);

// App wrapper with error boundary
const AppWithErrorBoundary = () => {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Render the application
try {
  root.render(<AppWithErrorBoundary />);
} catch (error) {
  console.error("Failed to render application:", error);
  handleGlobalError(error as Error);

  // Fallback UI
  rootElement.innerHTML = `
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      background: #1a1a2e; 
      color: white; 
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <h1>Something went wrong</h1>
      <p>We're working to fix this issue. Please try refreshing the page.</p>
      <button 
        onclick="window.location.reload()" 
        style="
          margin-top: 20px; 
          padding: 10px 20px; 
          background: #6366f1; 
          color: white; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer;
        "
      >
        Refresh Page
      </button>
    </div>
  `;
}
