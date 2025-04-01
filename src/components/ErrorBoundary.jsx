import React from 'react';
import { useNavigate } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-300 mb-6">
            {this.state.error?.message || 'Please try again later'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {this.props.resetText || 'Try Again'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}