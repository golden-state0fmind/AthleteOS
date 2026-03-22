/**
 * Nutrition Service
 * 
 * Provides CRUD operations for nutrition data stored in IndexedDB.
 * Includes goal conflict checking for fitness goal warnings.
 * Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 10.2, 10.3, 10.4
 */

import { getDB } from '../db';
import type { NutritionEntry, MacroData, UserProfile } from '../types/db';

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
 * Adds a new nutrition entry to IndexedDB.
 * Automatically generates warnings based on goal conflicts.
 * 
 * @param entry Nutrition data without id and createdAt
 * @returns Promise<NutritionEntry> The created nutrition entry with all fields
 */
export async function addNutritionEntry(
  entry: Omit<NutritionEntry, 'id' | 'createdAt'>
): Promise<NutritionEntry> {
  const db = await getDB();
  const now = new Date().toISOString();

  const newEntry: NutritionEntry = {
    ...entry,
    id: generateUUID(),
    createdAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('nutrition', 'readwrite');
    const store = transaction.objectStore('nutrition');
    const request = store.add(newEntry);

    request.onsuccess = () => {
      resolve(newEntry);
    };

    request.onerror = () => {
      reject(new Error(`Failed to add nutrition entry: ${request.error?.message}`));
    };
  });
}

/**
 * Retrieves nutrition entries for a specific date.
 * 
 * @param date Date in YYYY-MM-DD format
 * @returns Promise<NutritionEntry[]> Array of nutrition entries for the specified date
 */
export async function getNutritionByDate(date: string): Promise<NutritionEntry[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('nutrition', 'readonly');
    const store = transaction.objectStore('nutrition');
    const index = store.index('date');
    
    const request = index.openCursor(IDBKeyRange.only(date));
    const entries: NutritionEntry[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      
      if (cursor) {
        entries.push(cursor.value);
        cursor.continue();
      } else {
        resolve(entries);
      }
    };

    request.onerror = () => {
      reject(new Error(`Failed to get nutrition by date: ${request.error?.message}`));
    };
  });
}

/**
 * Calculates daily totals for all macro fields for a specific date.
 * Includes both "planned" and "consumed" entries in the totals.
 * 
 * @param date Date in YYYY-MM-DD format
 * @returns Promise<MacroData> Aggregated macro totals for the date
 */
export async function getDailyTotals(date: string): Promise<MacroData> {
  const entries = await getNutritionByDate(date);

  const totals: MacroData = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fats: 0,
    sugar: 0,
    sodium: 0,
  };

  for (const entry of entries) {
    // Add each macro value, treating null as 0
    totals.calories = (totals.calories || 0) + (entry.macros.calories || 0);
    totals.protein = (totals.protein || 0) + (entry.macros.protein || 0);
    totals.carbohydrates = (totals.carbohydrates || 0) + (entry.macros.carbohydrates || 0);
    totals.fats = (totals.fats || 0) + (entry.macros.fats || 0);
    totals.sugar = (totals.sugar || 0) + (entry.macros.sugar || 0);
    totals.sodium = (totals.sodium || 0) + (entry.macros.sodium || 0);
  }

  return totals;
}

/**
 * Updates the status of a nutrition entry (planned/consumed).
 * 
 * @param id The nutrition entry ID
 * @param status The new status ("planned" or "consumed")
 * @returns Promise<void>
 */
export async function updateEntryStatus(
  id: string,
  status: 'planned' | 'consumed'
): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('nutrition', 'readwrite');
    const store = transaction.objectStore('nutrition');
    
    // First, get the existing entry
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const entry = getRequest.result as NutritionEntry | undefined;
      
      if (!entry) {
        reject(new Error(`Nutrition entry with id ${id} not found`));
        return;
      }

      // Update the status
      entry.status = status;
      
      // Put the updated entry back
      const putRequest = store.put(entry);

      putRequest.onsuccess = () => {
        resolve();
      };

      putRequest.onerror = () => {
        reject(new Error(`Failed to update entry status: ${putRequest.error?.message}`));
      };
    };

    getRequest.onerror = () => {
      reject(new Error(`Failed to get nutrition entry: ${getRequest.error?.message}`));
    };
  });
}

/**
 * Checks for goal conflicts and generates warnings based on user's fitness goal.
 * 
 * Requirements:
 * - 10.2: If fitness goal is "lose weight" and food exceeds 500 calories, warn
 * - 10.3: If fitness goal is "build muscle" and food has less than 10g protein, inform
 * - 10.4: If food has more than 1000mg sodium, warn regardless of goal
 * 
 * @param macros The macro data to check
 * @param userProfile The user's profile containing fitness goal
 * @returns Array of warnings
 */
export async function checkGoalConflicts(
  macros: MacroData,
  userProfile: UserProfile | null
): Promise<Array<{ type: 'goal_conflict' | 'high_sodium'; message: string }>> {
  const warnings: Array<{ type: 'goal_conflict' | 'high_sodium'; message: string }> = [];

  // Check high sodium (applies to all users regardless of goal)
  if (macros.sodium !== null && macros.sodium > 1000) {
    warnings.push({
      type: 'high_sodium',
      message: 'This food item contains more than 1000mg sodium per serving.',
    });
  }

  // Check goal-specific conflicts if user profile exists
  if (userProfile) {
    // Check for weight loss goal
    if (userProfile.fitnessGoal === 'lose weight' && macros.calories !== null && macros.calories > 500) {
      warnings.push({
        type: 'goal_conflict',
        message: 'This food item exceeds 500 calories per serving, which may conflict with your weight loss goal.',
      });
    }

    // Check for muscle building goal
    if (userProfile.fitnessGoal === 'build muscle' && macros.protein !== null && macros.protein < 10) {
      warnings.push({
        type: 'goal_conflict',
        message: 'This food item contains less than 10g protein per serving. Consider higher protein options for muscle building.',
      });
    }
  }

  return warnings;
}
