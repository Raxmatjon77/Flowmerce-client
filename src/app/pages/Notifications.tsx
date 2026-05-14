import { Bell } from 'lucide-react';
import { Card } from '../components/ui/card';
import { StatusBadge } from '../components/StatusBadge';
import { Badge } from '../components/ui/badge';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { customerApi } from '../../lib/customer-api';
import { useApiData } from '../../lib/use-api';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

const CHANNEL_COLORS: Record<string, string> = {
  EMAIL: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  SMS: 'bg-green-500/20 text-green-300 border-green-500/30',
  PUSH: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

export function Notifications() {
  const { data, loading, error, reload } = useApiData(
    () => customerApi.listNotifications(),
    [],
  );

  const notifications = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <p className="mt-1 text-gray-400">Your messages and alerts.</p>
      </div>

      {loading ? <LoadingState label="Loading notifications..." /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {!loading && !error && notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="You'll see messages and alerts here when they arrive."
        />
      ) : null}

      {!loading && !error && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className="border-white/10 bg-slate-900/50 p-5 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-white/5 p-2">
                    <Bell className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-white">{notification.subject}</p>
                    <p className="text-sm text-gray-400">{notification.body}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className={CHANNEL_COLORS[notification.channel] ?? 'bg-gray-500/20 text-gray-300 border-gray-500/30'}
                    >
                      {notification.channel}
                    </Badge>
                    <StatusBadge status={notification.status} />
                  </div>
                  <p className="text-xs text-gray-500">{formatDateTime(notification.createdAt)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
