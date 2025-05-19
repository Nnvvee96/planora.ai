/**
 * Error Boundary Component
 * 
 * Component for catching JavaScript errors and displaying fallback UI.
 * Following Planora's architectural principles with feature-first organization.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component to catch JavaScript errors
 * and display a fallback UI instead of crashing the app
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error, 
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });
    
    // You could also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
          <details className="whitespace-pre-wrap text-sm text-red-600">
            <summary>Click to see details</summary>
            <p className="mt-2">{this.state.error?.toString()}</p>
            <p className="mt-2">{this.state.errorInfo?.componentStack}</p>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
