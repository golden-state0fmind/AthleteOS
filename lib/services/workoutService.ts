/**
 * Workout Service
 * 
 * Provides CRUD operations for workout data stored in IndexedDB.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 5.3
 */

import { getDB } from '../db';
import type { WorkoutEntry } from '../types/db';

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
 * Adds a new workout entry to IndexedDB.
 * 
 * @param workout Workout data without id and createdAt
 * @returns Promise<WorkoutEntry> The created workout entry with all fields
 */
export async function addWorkout(
  workout: Omit<WorkoutEntry, 'id' | 'createdAt'>
): Promise<WorkoutEntry> {
  const db = await getDB();
  const now = new Date().toISOString();

  const newWorkout: WorkoutEntry = {
    ...workout,
    id: generateUUID(),
    createdAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('workouts', 'readwrite');
    const store = transaction.objectStore('workouts');
    const request = store.add(newWorkout);

    request.onsuccess = () => {
      resolve(newWorkout);
    };

    request.onerror = () => {
      reject(new Error(`Failed to add workout: ${request.error?.message}`));
    };
  });
}

/**
 * Retrieves workout entries from IndexedDB, sorted by most recent first.
 * 
 * @param limit Optional maximum number of workouts to retrieve
 * @returns Promise<WorkoutEntry[]> Array of workout entries
 */
export async function getWorkouts(limit?: number): Promise<WorkoutEntry[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('workouts', 'readonly');
    const store = transaction.objectStore('workouts');
    const index = store.index('timestamp');
    
    // Open cursor in descending order (most recent first)
    const request = index.openCursor(null, 'prev');
    const workouts: WorkoutEntry[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      
      if (cursor && (!limit || workouts.length < limit)) {
        workouts.push(cursor.value);
        cursor.continue();
      } else {
        resolve(workouts);
      }
    };

    request.onerror = () => {
      reject(new Error(`Failed to get workouts: ${request.error?.message}`));
    };
  });
}

/**
 * Retrieves workout entries within a specific date range.
 * 
 * @param startDate ISO 8601 timestamp for range start
 * @param endDate ISO 8601 timestamp for range end
 * @returns Promise<WorkoutEntry[]> Array of workout entries within the date range
 */
export async function getWorkoutsByDateRange(
  startDate: string,
  endDate: string
): Promise<WorkoutEntry[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('workouts', 'readonly');
    const store = transaction.objectStore('workouts');
    const index = store.index('timestamp');
    
    // Create IDBKeyRange for the date range
    const range = IDBKeyRange.bound(startDate, endDate);
    const request = index.openCursor(range, 'prev');
    const workouts: WorkoutEntry[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      
      if (cursor) {
        workouts.push(cursor.value);
        cursor.continue();
      } else {
        resolve(workouts);
      }
    };

    request.onerror = () => {
      reject(new Error(`Failed to get workouts by date range: ${request.error?.message}`));
    };
  });
}

/**
 * Calculates total calories burned from workouts for a specific date.
 * 
 * @param date Date in YYYY-MM-DD format
 * @returns Promise<number> Total calories burned for the date
 */
export async function getDailyCaloriesBurned(date: string): Promise<number> {
  const startDate = new Date(date).toISOString();
  const endDate = new Date(date + 'T23:59:59').toISOString();
  
  const workouts = await getWorkoutsByDateRange(startDate, endDate);
  
  return workouts.reduce((total, workout) => {
    return total + (workout.caloriesBurned || 0);
  }, 0);
}

/**
 * Calculates the current and longest workout streaks in consecutive days.
 * A streak is maintained if there is at least one workout per day.
 * 
 * @returns Promise<{ current: number; longest: number }> The current and longest workout streaks in days
 */
export async function calculateWorkoutStreak(): Promise<{ current: number; longest: number }> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('workouts', 'readonly');
    const store = transaction.objectStore('workouts');
    const index = store.index('timestamp');
    
    // Get all workouts in descending order
    const request = index.openCursor(null, 'prev');
    const workoutDates = new Set<string>();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      
      if (cursor) {
        const workout = cursor.value as WorkoutEntry;
        // Extract date in YYYY-MM-DD format
        const date = workout.timestamp.split('T')[0];
        workoutDates.add(date);
        cursor.continue();
      } else {
        // Calculate both current and longest streaks from the collected dates
        const streaks = calculateStreaksFromDates(workoutDates);
        resolve(streaks);
      }
    };

    request.onerror = () => {
      reject(new Error(`Failed to calculate workout streak: ${request.error?.message}`));
    };
  });
}

/**
 * Helper function to calculate both current and longest streaks from a set of workout dates.
 * 
 * @param workoutDates Set of dates in YYYY-MM-DD format
 * @returns { current: number; longest: number } The current and longest streaks in days
 */
function calculateStreaksFromDates(workoutDates: Set<string>): { current: number; longest: number } {
  if (workoutDates.size === 0) {
    return { current: 0, longest: 0 };
  }

  // Convert to sorted array (most recent first)
  const sortedDates = Array.from(workoutDates).sort().reverse();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Check if there's a workout today or yesterday (streak can continue from yesterday)
  const mostRecentDate = sortedDates[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Calculate current streak
  let currentStreak = 0;
  
  // If most recent workout is today or yesterday, calculate current streak
  if (mostRecentDate === today || mostRecentDate === yesterdayStr) {
    currentStreak = 1;
    let currentDate = new Date(mostRecentDate);
    
    for (let i = 1; i < sortedDates.length; i++) {
      // Calculate expected previous date
      currentDate.setDate(currentDate.getDate() - 1);
      const expectedDate = currentDate.toISOString().split('T')[0];
      
      if (sortedDates[i] === expectedDate) {
        currentStreak++;
      } else {
        // Current streak is broken
        break;
      }
    }
  }

  // Calculate longest streak by checking all consecutive sequences
  let longestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = new Date(sortedDates[i]);
    currentDate.setDate(currentDate.getDate() - 1);
    const expectedPrevDate = currentDate.toISOString().split('T')[0];
    
    if (sortedDates[i + 1] === expectedPrevDate) {
      tempStreak++;
    } else {
      // Streak broken, check if it's the longest
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  // Check the last streak
  longestStreak = Math.max(longestStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
}
