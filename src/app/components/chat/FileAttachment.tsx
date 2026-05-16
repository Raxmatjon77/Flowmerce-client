import { Paperclip, Download } from 'lucide-react';
import type { AttachmentDto } from '../../../types/support';

interface Props {
  attachment: AttachmentDto;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileAttachment({ attachment }: Props) {
  return (
    <a
      href={attachment.url}
      download={attachment.originalName}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-800/60 px-3 py-2 text-sm transition-colors hover:bg-slate-700/60"
    >
      <Paperclip className="h-4 w-4 shrink-0 text-purple-400" />
      <span className="min-w-0 flex-1 truncate text-gray-200">{attachment.originalName}</span>
      <span className="shrink-0 text-xs text-gray-500">{formatBytes(attachment.sizeBytes)}</span>
      <Download className="h-3.5 w-3.5 shrink-0 text-gray-500" />
    </a>
  );
}
