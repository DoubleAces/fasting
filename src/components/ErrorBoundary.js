/**
 * ErrorBoundary Component
 * 
 * React error boundary that catches JavaScript errors anywhere in the child
 * component tree, logs the errors, and displays a fallback UI instead of
 * crashing the entire app.
 * 
 * Usage:
 * ```jsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 * 
 * Or with custom fallback:
 * ```jsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 * 
 * Features:
 * - Catches errors in child components
 * - Prevents full app crash
 * - Logs errors to console (can be extended to send to error tracking service)
 * - Shows user-friendly error message
 * - Provides retry button to reset error state
 * 
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

'use client';

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (can be extended to send to error tracking service like Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: Send to error tracking service
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: errorInfo } });
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided by parent
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Something went wrong
            </h2>

            {/* Message */}
            <p className="text-red-700 mb-4">
              {this.props.errorMessage ||
                'An unexpected error occurred. Please try again or contact support if the problem persists.'}
            </p>

            {/* Error details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-sm">
                <summary className="cursor-pointer text-red-800 font-medium mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="bg-red-100 p-3 rounded overflow-auto text-xs text-red-900">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {/* Retry button */}
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try Again
              </button>

              {/* Reload page button */}
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-red-700 border border-red-300 rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
