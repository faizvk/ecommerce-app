import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console; in production you'd send to a real error tracker (Sentry etc.)
    console.error("App error caught:", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-5 text-3xl">
            ⚠️
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-[0.92rem] text-gray-500 mb-6 leading-relaxed">
            We hit an unexpected error. The team has been notified — try reloading or head back to the home page.
          </p>
          {this.state.error?.message && (
            <pre className="text-[0.72rem] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg p-3 text-left overflow-x-auto mb-6 max-h-32">
              {String(this.state.error.message)}
            </pre>
          )}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => { this.reset(); window.location.reload(); }}
              className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold cursor-pointer hover:bg-brand-dark transition-all border-0"
            >
              Reload page
            </button>
            <Link
              to="/"
              onClick={this.reset}
              className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold no-underline transition-all hover:border-gray-300"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
