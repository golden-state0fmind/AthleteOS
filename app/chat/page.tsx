'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { addChatMessage, getChatHistory } from '@/lib/services/chatService';
import { getUserProfile } from '@/lib/services/userProfileService';
import { getWorkoutsByDateRange } from '@/lib/services/workoutService';
import { getNutritionByDate, getDailyTotals } from '@/lib/services/nutritionService';
import { getActiveSupplements } from '@/lib/services/supplementService';
import { buildSystemPrompt, type ChatContext } from '@/lib/chatContext';
import type { ChatMessage } from '@/lib/types/db';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const hasProcessedInitialMessage = useRef(false);

  useEffect(() => {
    loadChatHistory();
    
    // Online status detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Handle initial message from query params (from quick chat)
    const initialMessage = searchParams.get('message');
    if (initialMessage && !hasProcessedInitialMessage.current && !initialLoad) {
      hasProcessedInitialMessage.current = true;
      handleSendMessage(initialMessage);
    }
  }, [searchParams, initialLoad]);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory();
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setInitialLoad(false);
    }
  };

  const gatherContext = async (): Promise<ChatContext> => {
    // Get user profile
    const profile = await getUserProfile();
    
    // Get recent workouts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentWorkouts = await getWorkoutsByDateRange(
      sevenDaysAgo.toISOString(),
      new Date().toISOString()
    );

    // Get today's nutrition
    const today = new Date().toISOString().split('T')[0];
    const todayNutritionEntries = await getNutritionByDate(today);
    const dailyTotals = await getDailyTotals(today);

    // Get active supplements
    const activeSupplements = await getActiveSupplements();

    return {
      userProfile: {
        name: profile?.name || 'User',
        age: profile?.age || 0,
        weight: profile?.weight || 0,
        height: profile?.height || 0,
        fitnessGoal: profile?.fitnessGoal || 'maintain',
      },
      recentWorkouts: recentWorkouts.map(w => ({
        timestamp: w.timestamp,
        exerciseType: w.exerciseType,
        reps: w.estimatedReps,
        sets: w.sets,
      })),
      todayNutrition: {
        entries: todayNutritionEntries.map(e => ({
          foodName: e.foodName,
          macros: e.macros,
        })),
        dailyTotals,
      },
      activeSupplements: activeSupplements.map(s => ({
        name: s.name,
        dosage: s.dosage,
        frequency: s.frequency,
      })),
    };
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !isOnline) return;

    setIsLoading(true);

    try {
      // Add user message to chat
      const userMessage = await addChatMessage({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      });

      setMessages(prev => [...prev, userMessage]);

      // Gather context from IndexedDB
      const context = await gatherContext();

      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI coach');
      }

      const result = await response.json();

      // Add assistant message to chat
      const assistantMessage = await addChatMessage({
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
      });

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = await addChatMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      });

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      <Header title="AI Coach" showBackButton={false} />

      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Offline banner */}
        {!isOnline && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ You're offline. Chat requires an internet connection.
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4">
          <MessageList messages={messages} isLoading={isLoading} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-background pt-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!isOnline}
            isLoading={isLoading}
          />
        </div>
      </div>

      <Navigation />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pb-24 flex flex-col">
        <Header title="AI Coach" showBackButton={false} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">Loading...</p>
        </div>
        <Navigation />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
