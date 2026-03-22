import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export interface QuickChatProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const QuickChat: React.FC<QuickChatProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <Card padding="md">
      <h2 className="text-lg font-semibold text-white mb-4">Quick Chat</h2>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          placeholder="Ask your AI coach..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading || disabled}
          className="flex-1"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!message.trim() || isLoading || disabled}
        >
          {isLoading ? '...' : 'Send'}
        </Button>
      </form>

      {disabled && (
        <p className="text-sm text-yellow-500 mt-2">
          Chat requires an internet connection
        </p>
      )}
    </Card>
  );
};
