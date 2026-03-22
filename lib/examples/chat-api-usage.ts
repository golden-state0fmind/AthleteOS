/**
 * Example: Using the Chat API
 * 
 * This example demonstrates how to call the /api/chat endpoint
 * with proper context from IndexedDB services.
 * 
 * Requirements: 15.2, 15.3, 15.4, 15.5
 */

import { getUserProfile } from '../services/userProfileService';
import { getWorkoutsByDateRange } from '../services/workoutService';
import { getNutritionByDate, getDailyTotals } from '../services/nutritionService';
import { getActiveSupplements } from '../services/supplementService';
import type { ChatContext } from '../chatContext';

/**
 * Example: Send a chat message with full user context
 */
export async function sendChatMessage(message: string): Promise<string> {
  // 1. Gather user context from IndexedDB
  const userProfile = await getUserProfile();
  
  if (!userProfile) {
    throw new Error('User profile not found. Please complete onboarding first.');
  }

  // 2. Get recent workouts (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentWorkouts = await getWorkoutsByDateRange(
    sevenDaysAgo.toISOString(),
    new Date().toISOString()
  );

  // 3. Get today's nutrition
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const todayNutritionEntries = await getNutritionByDate(today);
  const dailyTotals = await getDailyTotals(today);

  // 4. Get active supplements
  const activeSupplements = await getActiveSupplements();

  // 5. Build context object
  const context: ChatContext = {
    userProfile: {
      name: userProfile.name,
      age: userProfile.age,
      weight: userProfile.weight,
      height: userProfile.height,
      fitnessGoal: userProfile.fitnessGoal,
    },
    recentWorkouts: recentWorkouts.map((w) => ({
      timestamp: w.timestamp,
      exerciseType: w.exerciseType,
      reps: w.estimatedReps,
      sets: w.sets,
    })),
    todayNutrition: {
      entries: todayNutritionEntries.map((e) => ({
        foodName: e.foodName,
        macros: e.macros,
      })),
      dailyTotals,
    },
    activeSupplements: activeSupplements.map((s) => ({
      name: s.name,
      dosage: s.dosage,
      frequency: s.frequency,
    })),
  };

  // 6. Send request to API
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

  // 7. Handle response
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get chat response');
  }

  const data = await response.json();
  return data.response;
}

/**
 * Example: Simple chat interaction
 */
export async function exampleChatInteraction() {
  try {
    // Ask the AI coach a question
    const response = await sendChatMessage(
      'How am I doing with my fitness goals this week?'
    );

    console.log('AI Coach:', response);
    
    // The AI will reference:
    // - Your user profile (name, age, weight, height, fitness goal)
    // - Your workouts from the last 7 days
    // - Your nutrition logged today
    // - Your active supplements
    
    return response;
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}

/**
 * Example: Error handling
 */
export async function exampleWithErrorHandling() {
  try {
    const response = await sendChatMessage('What should I eat today?');
    return response;
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('Rate limit')) {
        console.error('Too many requests. Please wait and try again.');
      } else if (error.message.includes('unavailable')) {
        console.error('AI service is temporarily down. Try again later.');
      } else if (error.message.includes('profile not found')) {
        console.error('Please complete your profile setup first.');
      } else {
        console.error('Unexpected error:', error.message);
      }
    }
    throw error;
  }
}

/**
 * Example: Checking online status before chat
 */
export async function exampleWithOnlineCheck() {
  // Check if online (in a real app, use useOnlineStatus hook)
  if (!navigator.onLine) {
    throw new Error('Chat requires an internet connection');
  }

  const response = await sendChatMessage('Give me a workout suggestion');
  return response;
}
