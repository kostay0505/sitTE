'use client';
import { useState, useRef, KeyboardEvent } from 'react';
import { uploadFile } from '@/api/files/methods';
import { toImageSrc } from '@/utils/toImageSrc';

interface MessageInputProps {
  onSend: (body: string, imageUrl?: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadFile(formData);
      // result.filename is the stored filename
      onSend('', result.filename);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-white border-t border-gray-200">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="text-gray-400 hover:text-gray-600 p-2 flex-shrink-0"
        disabled={uploading}
        title="Прикрепить фото"
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Написать сообщение..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-400 max-h-32 overflow-y-auto"
        style={{ minHeight: '40px', color: '#111827' }}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="bg-green-500 text-white rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 disabled:opacity-50 hover:bg-green-600 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
}
