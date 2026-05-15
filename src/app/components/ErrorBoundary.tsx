import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { useRouteError, useNavigate } from 'react-router';
import { Card } from './ui/card';
import { Button } from './ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// ─── Core boundary class ───────────────────────────────────────────────────────

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught render error:', error.message, info.componentStack);
    this.props.onError?.(error, info);
  }

  reset = (): void => this.setState({ hasError: false, error: null });

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <DefaultErrorFallback error={this.state.error!} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

// ─── DefaultErrorFallback ─────────────────────────────────────────────────────
// Rendered inside the layout (sidebar stays visible). Matches ErrorState style.

function DefaultErrorFallback({
  error,
  onReset,
}: {
  error: Error;
  onReset: () => void;
}): ReactNode {
  return (
    <Card className="border-red-500/30 bg-red-500/10 p-8 text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
      <p className="mt-4 text-base font-semibold text-red-300">Something went wrong</p>
      <p className="mt-2 text-sm text-red-200">{error.message}</p>
      <Button
        variant="outline"
        className="mt-4 border-red-500/30 text-red-100 hover:bg-red-500/10"
        onClick={onReset}
      >
        <RefreshCcw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </Card>
  );
}

// ─── RootErrorFallback ────────────────────────────────────────────────────────
// Full-screen fallback used when the router itself fails to render.

export function RootErrorFallback(): ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <Card className="w-full max-w-md border-red-500/30 bg-red-500/10 p-10 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h1 className="mt-4 text-xl font-bold text-red-300">Something went wrong</h1>
        <p className="mt-2 text-sm text-red-200">
          The application encountered an unexpected error. Please try reloading.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            className="border-red-500/30 text-red-100 hover:bg-red-500/10"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reload page
          </Button>
          <Button
            variant="outline"
            className="border-white/10 text-gray-200 hover:bg-white/5"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            <Home className="mr-2 h-4 w-4" />
            Go home
          </Button>
        </div>
      </Card>

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>
    </div>
  );
}

// ─── RouteErrorFallback ───────────────────────────────────────────────────────
// Used as `errorElement` on route objects; reads the React Router error.

export function RouteErrorFallback(): ReactNode {
  const routeError = useRouteError();
  const navigate = useNavigate();

  const message =
    routeError instanceof Error
      ? routeError.message
      : typeof routeError === 'string'
        ? routeError
        : 'An unexpected routing error occurred.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <Card className="w-full max-w-md border-red-500/30 bg-red-500/10 p-10 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h1 className="mt-4 text-xl font-bold text-red-300">Page Error</h1>
        <p className="mt-2 text-sm text-red-200">{message}</p>
        <Button
          variant="outline"
          className="mt-6 border-red-500/30 text-red-100 hover:bg-red-500/10"
          onClick={() => navigate(-1)}
        >
          Go back
        </Button>
      </Card>

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>
    </div>
  );
}
