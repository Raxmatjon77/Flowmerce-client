import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ErrorState, LoadingState } from '../components/AsyncState';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { StarRating } from '../components/chat/StarRating';
import {
  getConversation,
  getMessages,
  rateConversation,
  sendMessage,
  uploadAttachment,
} from '../../lib/customer-api';
import { useApiData } from '../../lib/use-api';
import { useChatSocket } from '../../lib/useChatSocket';
import { getStoredUserId } from '../../lib/auth';
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

function StatusBadge({ status }: { status: ConversationDto['status'] }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export function SupportThread() {
  const { id } = useParams<{ id: string }>();
  const currentUserId = getStoredUserId();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rating state
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Uploading state
  const [uploading, setUploading] = useState(false);

  const {
    data: conversation,
    loading: convLoading,
    error: convError,
    reload: reloadConv,
  } = useApiData(() => getConversation(id!), [id]);

  const {
    data: restMessages,
    loading: msgsLoading,
    error: msgsError,
    reload: reloadMessages,
  } = useApiData(() => getMessages(id!), [id]);

  const { messages, sendMessage: socketSend, sendTyping, isConnected, typingUsers } =
    useChatSocket(id ?? '', restMessages ?? []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(
    (content: string) => {
      // Try socket first; if not connected fall back to REST
      if (isConnected) {
        socketSend(content);
      } else {
        if (!id) return;
        sendMessage(id, content)
          .then(() => reloadMessages())
          .catch((err: unknown) => {
            toast.error(err instanceof Error ? err.message : 'Failed to send message.');
          });
      }
    },
    [id, isConnected, socketSend, reloadMessages],
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!id) return;
      setUploading(true);
      try {
        await uploadAttachment(id, file);
        reloadMessages();
        toast.success(`${file.name} uploaded.`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed.');
      } finally {
        setUploading(false);
      }
    },
    [id, reloadMessages],
  );

  async function handleRatingSubmit() {
    if (!id || ratingStars === 0) return;
    setSubmittingRating(true);
    try {
      await rateConversation(id, ratingStars, ratingComment);
      setRatingSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  }

  const isClosed = conversation?.status === 'closed';
  const inputDisabled = isClosed || uploading;

  const isLoading = convLoading || msgsLoading;
  const isError = convError ?? msgsError;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Link to="/support">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
          {conversation ? (
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white">{conversation.subject}</h1>
              <StatusBadge status={conversation.status} />
            </div>
          ) : null}
        </div>

        {/* Connection indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          {isConnected ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-gray-500">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Loading / Error states */}
      {isLoading ? <LoadingState label="Loading conversation…" /> : null}
      {isError ? <ErrorState message={isError} onRetry={() => { reloadConv(); reloadMessages(); }} /> : null}

      {!isLoading && !isError ? (
        <>
          {/* Messages area */}
          <Card className="flex min-h-0 flex-1 flex-col border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">
                    No messages yet. Send one to start the conversation.
                  </p>
                ) : null}
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === currentUserId}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Typing indicator */}
            <div className="px-4 pb-1">
              <TypingIndicator users={typingUsers} />
            </div>

            {/* Rating panel (closed conversations without submitted rating) */}
            {isClosed && !ratingSubmitted ? (
              <div className="border-t border-white/10 bg-slate-800/30 p-4">
                <p className="mb-3 text-sm font-medium text-white">
                  Rate your support experience
                </p>
                <StarRating value={ratingStars} onChange={setRatingStars} />
                <textarea
                  className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/50"
                  placeholder="Optional comment…"
                  rows={2}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                />
                <Button
                  className="mt-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
                  disabled={ratingStars === 0 || submittingRating}
                  onClick={() => void handleRatingSubmit()}
                >
                  {submittingRating ? 'Submitting…' : 'Submit Rating'}
                </Button>
              </div>
            ) : null}

            {isClosed && ratingSubmitted ? (
              <div className="border-t border-white/10 bg-slate-800/30 p-4">
                <p className="text-center text-sm text-green-400">
                  Thank you for your feedback!
                </p>
              </div>
            ) : null}

            {/* Input area */}
            <div className="border-t border-white/10 p-4">
              <ChatInput
                onSend={handleSend}
                onTyping={sendTyping}
                onFileSelect={(file) => void handleFileSelect(file)}
                disabled={inputDisabled}
              />
              {uploading ? (
                <p className="mt-1.5 text-xs text-gray-500">Uploading attachment…</p>
              ) : null}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
