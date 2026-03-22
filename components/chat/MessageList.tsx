import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '@/lib/types/db';

export interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-4xl mb-4">💬</p>
          <p className="text-white/60 text-lg mb-2">Start a conversation</p>
          <p className="text-white/40 text-sm">
            Ask your AI coach about workouts, nutrition, or supplements
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 pb-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent text-sm">🤖</span>
          </div>
          <div className="flex-1 bg-white/5 rounded-lg p-4 max-w-[80%]">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};
