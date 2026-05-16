import { useRef, useState, KeyboardEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  onSend: (content: string) => void;
  onTyping: () => void;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, onTyping, onFileSelect, disabled = false }: Props) {
  const [value, setValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    onTyping();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset input so the same file can be re-selected later
      e.target.value = '';
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-slate-800/50 p-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Attach button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-gray-400 hover:text-white"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        title="Attach file"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      {/* Textarea */}
      <textarea
        className="min-h-[40px] flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        placeholder={disabled ? 'This conversation is closed.' : 'Type a message… (Enter to send, Shift+Enter for new line)'}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        style={{ maxHeight: '120px', overflowY: 'auto' }}
      />

      {/* Send button */}
      <Button
        type="button"
        size="icon"
        className="h-9 w-9 shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-40"
        disabled={disabled || !value.trim()}
        onClick={handleSend}
        title="Send message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
