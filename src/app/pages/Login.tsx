import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Activity, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { login } from '../../lib/auth';

export function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userId.trim()) {
      setError('User ID is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(userId.trim(), password);
      void navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/25">
            <Activity className="h-9 w-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Flowmerce</h1>
            <p className="text-sm text-gray-400">Customer Portal</p>
          </div>
        </div>

        <h2 className="mb-6 text-center text-lg font-semibold text-white">
          Sign in to your account
        </h2>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="userId" className="text-sm font-medium text-gray-300">
              User ID
            </Label>
            <Input
              id="userId"
              type="text"
              placeholder="e.g. customer-001"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-gray-500"
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign in
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-purple-400 hover:text-purple-300">
            Register
          </Link>
        </div>
      </Card>
    </div>
  );
}
