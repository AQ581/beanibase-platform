import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { BeanibaseLogo } from './BeanibaseLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Ignore benign Vite WebSocket errors that happen in the AI Studio environment
    if (error.message?.includes('WebSocket') || error.message?.includes('vite')) {
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F5F2ED] text-center">
          <BeanibaseLogo size="lg" className="mb-8" />
          <h1 className="text-4xl font-serif font-bold mb-4 tracking-tight">Oops! The cushion slipped.</h1>
          <p className="text-gray-500 max-w-md mb-8 font-light leading-relaxed">
            Something went wrong while fluffing your experience. Don't worry, your progress is safe.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-black text-white rounded-full font-bold hover:scale-105 transition-all shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Reset the Coach</span>
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-12 p-6 bg-white rounded-2xl text-left text-xs text-red-500 overflow-auto max-w-2xl border border-red-100 shadow-sm">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
