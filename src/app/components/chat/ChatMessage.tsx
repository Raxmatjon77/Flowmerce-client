import type { MessageDto } from '../../../types/support';
import { FileAttachment } from './FileAttachment';

interface Props {
  message: MessageDto;
  isOwn: boolean;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatMessage({ message, isOwn }: Props) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[75%] flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender role badge */}
        <div className="flex items-center gap-2">
          {!isOwn && (
            <span className="text-xs font-medium text-purple-400">
              {message.senderRole === 'admin' ? 'Support' : 'Customer'}
            </span>
          )}
          <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
          {isOwn && (
            <span className="text-xs font-medium text-blue-400">You</span>
          )}
        </div>

        {/* Bubble */}
        {message.content ? (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isOwn
                ? 'rounded-tr-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                : 'rounded-tl-sm bg-slate-700/70 text-gray-100'
            }`}
          >
            {message.content}
          </div>
        ) : null}

        {/* Attachments */}
        {message.attachments.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {message.attachments.map((att) => (
              <FileAttachment key={att.id} attachment={att} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
