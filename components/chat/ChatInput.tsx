import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  isLoading = false,
  placeholder = 'Ask your AI coach...',
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={placeholder}
          rows={1}
          className="w-full min-h-[44px] max-h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 resize-none focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 disabled:opacity-50"
        />
        <p className="text-xs text-white/40 mt-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
      
      <Button
        type="submit"
        variant="primary"
        disabled={!message.trim() || isLoading || disabled}
        className="flex-shrink-0"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Sending
          </span>
        ) : (
          'Send'
        )}
      </Button>
    </form>
  );
};
