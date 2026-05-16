interface Props {
  users: { userId: string; role: string }[];
}

export function TypingIndicator({ users }: Props) {
  if (users.length === 0) return null;

  const label = users.some((u) => u.role === 'admin')
    ? 'Support is typing'
    : 'Someone is typing';

  return (
    <div className="flex items-center gap-2 px-1 text-xs text-gray-500">
      <span>{label}</span>
      {/* Animated dots */}
      <span className="flex gap-0.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:300ms]" />
      </span>
    </div>
  );
}
