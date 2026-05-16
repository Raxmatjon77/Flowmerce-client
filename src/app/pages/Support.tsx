import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MessageSquarePlus, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState';
import { createConversation, getConversations } from '../../lib/customer-api';
import { useApiData } from '../../lib/use-api';
import type { ConversationDto } from '../../types/support';

const STATUS_CONFIG: Record<
  ConversationDto['status'],
  { label: string; className: string }
> = {
  open: { label: 'Open', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  in_progress: { label: 'In Progress', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  resolved: { label: 'Resolved', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
  closed: { label: 'Closed', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: { status: ConversationDto['status'] }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export function Support() {
  const navigate = useNavigate();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: conversations, loading, error, reload } = useApiData(
    () => getConversations(),
    [],
  );

  async function handleCreate() {
    const trimmed = subject.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const conversation = await createConversation(trimmed);
      setShowNewTicket(false);
      setSubject('');
      void navigate(`/support/${conversation.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create ticket.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Support</h1>
          <p className="mt-1 text-gray-400">View and manage your support conversations.</p>
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
          onClick={() => setShowNewTicket(true)}
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* New ticket modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Open a New Ticket</h2>
            <label className="mb-1 block text-sm text-gray-400" htmlFor="subject">
              Subject
            </label>
            <Input
              id="subject"
              className="border-white/10 bg-white/5"
              placeholder="Describe your issue briefly…"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleCreate();
                if (e.key === 'Escape') setShowNewTicket(false);
              }}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => {
                  setShowNewTicket(false);
                  setSubject('');
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
                disabled={!subject.trim() || submitting}
                onClick={() => void handleCreate()}
              >
                {submitting ? 'Creating…' : 'Create Ticket'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Content */}
      {loading ? <LoadingState label="Loading conversations…" /> : null}
      {error ? <ErrorState message={error} onRetry={reload} /> : null}

      {!loading && !error && conversations !== null && conversations.length === 0 ? (
        <EmptyState
          title="No support tickets yet"
          description="Open a new ticket if you need help with your order or account."
          action={
            <Button
              className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
              onClick={() => setShowNewTicket(true)}
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Ticket
            </Button>
          }
        />
      ) : null}

      {!loading && !error && conversations && conversations.length > 0 ? (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <Card
              key={conv.id}
              className="cursor-pointer border-white/10 bg-slate-900/50 p-5 backdrop-blur-sm transition-colors hover:border-purple-500/30 hover:bg-slate-900/80"
              onClick={() => void navigate(`/support/${conv.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{conv.subject}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Opened {formatDate(conv.createdAt)}
                    </p>
                  </div>
                </div>
                <StatusBadge status={conv.status} />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
