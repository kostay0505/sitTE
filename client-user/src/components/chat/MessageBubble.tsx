'use client';
import { toImageSrc } from '@/utils/toImageSrc';

interface MessageBubbleProps {
  body: string | null;
  imageUrl: string | null;
  isMine: boolean;
  createdAt: string;
}

export function MessageBubble({
  body,
  imageUrl,
  isMine,
  createdAt,
}: MessageBubbleProps) {
  const time = new Date(createdAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isMine
            ? 'bg-green-500 text-white rounded-br-sm'
            : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
        }`}
      >
        {imageUrl && (
          <div className="mb-1">
            <img
              src={toImageSrc(imageUrl)}
              alt="attachment"
              className="rounded-lg max-w-full max-h-64 object-contain"
            />
          </div>
        )}
        {body && (
          <p className="text-sm whitespace-pre-wrap break-words">{body}</p>
        )}
        <p
          className={`text-xs mt-1 text-right ${
            isMine ? 'text-green-100' : 'text-gray-400'
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
