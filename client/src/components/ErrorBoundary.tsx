import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
          <div className="glass rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
              <p className="text-white/70 mb-6">
                We encountered an unexpected error. Please refresh the page or try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-500 hover:to-pink-500 transition-all duration-300"
              >
                Refresh Page
              </button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-white/80 cursor-pointer">Error Details</summary>
                  <pre className="mt-2 text-xs text-red-200 bg-red-900/20 p-2 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;