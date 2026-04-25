import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-white/10 bg-slate-900/50 p-8 text-center backdrop-blur-sm">
        <p className="text-6xl font-bold text-white">404</p>
        <p className="mt-4 text-xl font-semibold text-white">Page not found</p>
        <p className="mt-2 text-sm text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500">
          <Link to="/">Go home</Link>
        </Button>
      </Card>
    </div>
  );
}
