/**
 * Chat Service
 * 
 * Provides CRUD operations for chat message data stored in IndexedDB.
 * Requirements: 15.6
 */

import { getDB } from '../db';
import type { ChatMessage } from '../types/db';

/**
 * Generates a UUID v4 string.
 * 
 * @returns string A UUID v4 identifier
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Adds a new chat message to IndexedDB.
 * 
 * @param message Chat message data without id
 * @returns Promise<ChatMessage> The created chat message with all fields
 */
export async function addChatMessage(
  message: Omit<ChatMessage, 'id'>
): Promise<ChatMessage> {
  const db = await getDB();

  const newMessage: ChatMessage = {
    ...message,
    id: generateUUID(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chatHistory', 'readwrite');
    const store = transaction.objectStore('chatHistory');
    const request = store.add(newMessage);

    request.onsuccess = () => {
      resolve(newMessage);
    };

    request.onerror = () => {
      reject(new Error(`Failed to add chat message: ${request.error?.message}`));
    };
  });
}

/**
 * Retrieves chat messages from IndexedDB, sorted by timestamp (oldest first).
 * 
 * @param limit Optional maximum number of messages to retrieve
 * @returns Promise<ChatMessage[]> Array of chat messages
 */
export async function getChatHistory(limit?: number): Promise<ChatMessage[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chatHistory', 'readonly');
    const store = transaction.objectStore('chatHistory');
    const index = store.index('timestamp');
    
    // Open cursor in ascending order (oldest first for chat display)
    const request = index.openCursor(null, 'next');
    const messages: ChatMessage[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      
      if (cursor && (!limit || messages.length < limit)) {
        messages.push(cursor.value);
        cursor.continue();
      } else {
        resolve(messages);
      }
    };

    request.onerror = () => {
      reject(new Error(`Failed to get chat history: ${request.error?.message}`));
    };
  });
}

/**
 * Clears all chat messages from IndexedDB.
 * 
 * @returns Promise<void>
 */
export async function clearChatHistory(): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chatHistory', 'readwrite');
    const store = transaction.objectStore('chatHistory');
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to clear chat history: ${request.error?.message}`));
    };
  });
}
