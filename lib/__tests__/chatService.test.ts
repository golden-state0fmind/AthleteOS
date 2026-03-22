/**
 * Unit tests for chatService
 * 
 * Tests CRUD operations for chat message data.
 */

import { deleteDB, getDB } from '../db';
import {
  addChatMessage,
  getChatHistory,
  clearChatHistory,
} from '../services/chatService';
import type { ChatMessage } from '../types/db';

describe('chatService', () => {
  beforeEach(async () => {
    // Clean database before each test
    await deleteDB();
  });

  afterEach(async () => {
    // Clean up after each test
    const db = await getDB();
    db.close();
    await deleteDB();
  });

  describe('addChatMessage', () => {
    it('should add a user message with generated id', async () => {
      const messageData: Omit<ChatMessage, 'id'> = {
        role: 'user',
        content: 'What should I eat for breakfast?',
        timestamp: new Date().toISOString(),
      };

      const result = await addChatMessage(messageData);

      expect(result.id).toBeDefined();
      expect(result.role).toBe('user');
      expect(result.content).toBe('What should I eat for breakfast?');
      expect(result.timestamp).toBeDefined();
    });

    it('should add an assistant message with generated id', async () => {
      const messageData: Omit<ChatMessage, 'id'> = {
        role: 'assistant',
        content: 'Based on your fitness goals, I recommend a high-protein breakfast.',
        timestamp: new Date().toISOString(),
      };

      const result = await addChatMessage(messageData);

      expect(result.id).toBeDefined();
      expect(result.role).toBe('assistant');
      expect(result.content).toBe('Based on your fitness goals, I recommend a high-protein breakfast.');
    });
  });

  describe('getChatHistory', () => {
    it('should return empty array when no messages exist', async () => {
      const messages = await getChatHistory();
      expect(messages).toEqual([]);
    });

    it('should return messages sorted by timestamp (oldest first)', async () => {
      const now = new Date();
      
      // Add messages with different timestamps
      const message1 = await addChatMessage({
        role: 'user',
        content: 'First message',
        timestamp: new Date(now.getTime() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
      });

      const message2 = await addChatMessage({
        role: 'assistant',
        content: 'Second message',
        timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      });

      const message3 = await addChatMessage({
        role: 'user',
        content: 'Third message',
        timestamp: new Date(now.getTime() - 1 * 60 * 1000).toISOString(), // 1 minute ago
      });

      const messages = await getChatHistory();

      expect(messages).toHaveLength(3);
      expect(messages[0].id).toBe(message1.id); // Oldest
      expect(messages[1].id).toBe(message2.id);
      expect(messages[2].id).toBe(message3.id); // Most recent
    });

    it('should respect limit parameter', async () => {
      const now = new Date();
      
      // Add 5 messages
      for (let i = 0; i < 5; i++) {
        await addChatMessage({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
          timestamp: new Date(now.getTime() + i * 60 * 1000).toISOString(),
        });
      }

      const messages = await getChatHistory(3);
      expect(messages).toHaveLength(3);
      expect(messages[0].content).toBe('Message 0');
      expect(messages[1].content).toBe('Message 1');
      expect(messages[2].content).toBe('Message 2');
    });

    it('should handle conversation with alternating roles', async () => {
      const now = new Date();
      
      await addChatMessage({
        role: 'user',
        content: 'How many calories should I eat?',
        timestamp: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
      });

      await addChatMessage({
        role: 'assistant',
        content: 'Based on your profile, aim for 2000 calories per day.',
        timestamp: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
      });

      await addChatMessage({
        role: 'user',
        content: 'What about protein?',
        timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      });

      await addChatMessage({
        role: 'assistant',
        content: 'Target 150g of protein daily for muscle building.',
        timestamp: new Date(now.getTime() - 1 * 60 * 1000).toISOString(),
      });

      const messages = await getChatHistory();

      expect(messages).toHaveLength(4);
      expect(messages[0].role).toBe('user');
      expect(messages[1].role).toBe('assistant');
      expect(messages[2].role).toBe('user');
      expect(messages[3].role).toBe('assistant');
    });
  });

  describe('clearChatHistory', () => {
    it('should clear all messages from chat history', async () => {
      const now = new Date();
      
      // Add several messages
      await addChatMessage({
        role: 'user',
        content: 'Message 1',
        timestamp: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
      });

      await addChatMessage({
        role: 'assistant',
        content: 'Message 2',
        timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      });

      await addChatMessage({
        role: 'user',
        content: 'Message 3',
        timestamp: new Date(now.getTime() - 1 * 60 * 1000).toISOString(),
      });

      // Verify messages exist
      let messages = await getChatHistory();
      expect(messages).toHaveLength(3);

      // Clear history
      await clearChatHistory();

      // Verify messages are cleared
      messages = await getChatHistory();
      expect(messages).toEqual([]);
    });

    it('should not throw error when clearing empty chat history', async () => {
      await expect(clearChatHistory()).resolves.not.toThrow();
      
      const messages = await getChatHistory();
      expect(messages).toEqual([]);
    });

    it('should allow adding new messages after clearing', async () => {
      // Add and clear messages
      await addChatMessage({
        role: 'user',
        content: 'Old message',
        timestamp: new Date().toISOString(),
      });

      await clearChatHistory();

      // Add new message
      const newMessage = await addChatMessage({
        role: 'user',
        content: 'New message',
        timestamp: new Date().toISOString(),
      });

      const messages = await getChatHistory();
      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe(newMessage.id);
      expect(messages[0].content).toBe('New message');
    });
  });
});
