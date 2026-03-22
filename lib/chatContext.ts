/**
 * Chat Context Builder
 * 
 * Constructs system prompts with user context for AI coaching conversations.
 * Includes user profile, recent workouts, today's nutrition, and active supplements.
 * 
 * Requirements: 15.3, 16.1, 16.2, 16.3
 */

import type { UserProfile, WorkoutEntry, NutritionEntry, MacroData, SupplementEntry } from './types/db';

/**
 * Chat context structure containing user data
 */
export interface ChatContext {
  userProfile: {
    name: string;
    age: number;
    weight: number;
    height: number;
    fitnessGoal: 'lose weight' | 'build muscle' | 'maintain' | 'performance';
  };
  recentWorkouts: Array<{
    timestamp: string;
    exerciseType: string;
    reps: number | null;
    sets: number | null;
  }>;
  todayNutrition: {
    entries: Array<{
      foodName: string;
      macros: MacroData;
    }>;
    dailyTotals: MacroData;
  };
  activeSupplements: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
}

/**
 * Builds a system prompt with user context for Claude API
 * 
 * @param context - User context data from IndexedDB services
 * @returns System prompt string with formatted user data
 */
export function buildSystemPrompt(context: ChatContext): string {
  const { userProfile, recentWorkouts, todayNutrition, activeSupplements } = context;

  let prompt = `You are an AI fitness coach for AthleteOS. Provide personalized, actionable advice based on the user's data.

USER PROFILE:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Weight: ${userProfile.weight} kg
- Height: ${userProfile.height} cm
- Fitness Goal: ${userProfile.fitnessGoal}
`;

  // Add recent workouts if available
  if (recentWorkouts.length > 0) {
    prompt += `\nRECENT WORKOUTS (Last 7 days):\n`;
    recentWorkouts.forEach((w) => {
      const date = new Date(w.timestamp).toLocaleDateString();
      prompt += `- ${date}: ${w.exerciseType}`;
      if (w.reps !== null) prompt += ` (${w.reps} reps`;
      if (w.sets !== null) {
        if (w.reps !== null) {
          prompt += `, ${w.sets} sets)`;
        } else {
          prompt += ` (${w.sets} sets)`;
        }
      } else if (w.reps !== null) {
        prompt += `)`;
      }
      prompt += `\n`;
    });
  } else {
    prompt += `\nRECENT WORKOUTS: No workouts logged in the last 7 days.\n`;
  }

  // Add today's nutrition if available
  if (todayNutrition.entries.length > 0) {
    prompt += `\nTODAY'S NUTRITION:\n`;
    todayNutrition.entries.forEach((e) => {
      prompt += `- ${e.foodName}: ${e.macros.calories ?? '?'} cal, ${e.macros.protein ?? '?'}g protein\n`;
    });
    prompt += `Daily Totals: ${todayNutrition.dailyTotals.calories ?? 0} cal, ${todayNutrition.dailyTotals.protein ?? 0}g protein, ${todayNutrition.dailyTotals.carbohydrates ?? 0}g carbs, ${todayNutrition.dailyTotals.fats ?? 0}g fats\n`;
  } else {
    prompt += `\nTODAY'S NUTRITION: No nutrition logged today.\n`;
  }

  // Add active supplements if available
  if (activeSupplements.length > 0) {
    prompt += `\nACTIVE SUPPLEMENTS:\n`;
    activeSupplements.forEach((s) => {
      prompt += `- ${s.name} (${s.dosage}, ${s.frequency})\n`;
    });
  } else {
    prompt += `\nACTIVE SUPPLEMENTS: None currently active.\n`;
  }

  prompt += `\nProvide concise, motivating responses. Reference specific data when relevant. Always include a disclaimer that you're not a medical professional for health-related questions.`;

  return prompt;
}
