import { ReactNode } from 'react';
import { AlertTriangle, LoaderCircle, RefreshCcw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <Card className="border-white/10 bg-slate-900/50 p-8 text-center backdrop-blur-sm">
      <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-purple-400" />
      <p className="mt-4 text-sm text-gray-400">{label}</p>
    </Card>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-red-500/30 bg-red-500/10 p-8 text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
      <p className="mt-4 text-sm text-red-200">{message}</p>
      {onRetry ? (
        <Button
          variant="outline"
          className="mt-4 border-red-500/30 text-red-100 hover:bg-red-500/10"
          onClick={onRetry}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      ) : null}
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-slate-900/50 p-8 text-center backdrop-blur-sm">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-gray-400">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}
