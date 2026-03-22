/**
 * TypeScript type definitions for IndexedDB schema
 * 
 * These types match the schema defined in the design document
 * and are used throughout the application for type safety.
 */

/**
 * User Profile stored in the userProfile object store
 */
export interface UserProfile {
  id: 'singleton'; // Single record identifier
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  fitnessGoal: 'lose weight' | 'build muscle' | 'maintain' | 'performance';
  macroTargets?: {
    calories: number;
    protein: number; // grams
    carbohydrates: number; // grams
    fats: number; // grams
  };
  dailyWaterTarget?: number; // fluid ounces (default: 128oz = 1 gallon)
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Workout entry stored in the workouts object store
 */
export interface WorkoutEntry {
  id: string; // UUID
  timestamp: string; // ISO 8601 timestamp
  source: 'image' | 'manual';
  exerciseType: string;
  estimatedReps: number | null;
  sets: number | null;
  duration: number | null; // minutes
  caloriesBurned: number | null; // estimated calories burned
  formFeedback: string | null;
  notes: string | null;
  createdAt: string; // ISO 8601 timestamp
}

/**
 * Macronutrient data structure
 */
export interface MacroData {
  calories: number | null;
  protein: number | null; // grams
  carbohydrates: number | null; // grams
  fats: number | null; // grams
  sugar: number | null; // grams
  sodium: number | null; // milligrams
}

/**
 * Nutrition entry stored in the nutrition object store
 */
export interface NutritionEntry {
  id: string; // UUID
  timestamp: string; // ISO 8601 timestamp
  date: string; // YYYY-MM-DD for grouping
  status: 'planned' | 'consumed';
  foodName: string;
  servingSize: string | null;
  macros: MacroData;
  warnings: Array<{
    type: 'goal_conflict' | 'high_sodium';
    message: string;
  }>;
  createdAt: string; // ISO 8601 timestamp
}

/**
 * Supplement entry stored in the supplements object store
 */
export interface SupplementEntry {
  id: string; // UUID
  name: string;
  dosage: string;
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed';
  timing: string; // e.g., "morning", "with meals"
  safetyNotes: string;
  effectiveness: string;
  active: boolean; // For soft deletion
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Supplement checklist entry stored in the supplementChecklist object store
 */
export interface SupplementChecklistEntry {
  id: string; // UUID
  supplementId: string; // Foreign key to supplements
  date: string; // YYYY-MM-DD
  taken: boolean;
  takenAt: string | null; // ISO 8601 timestamp
}

/**
 * Water intake entry stored in the waterIntake object store
 */
export interface WaterIntakeEntry {
  id: string; // UUID
  timestamp: string; // ISO 8601 timestamp
  date: string; // YYYY-MM-DD for grouping
  amount: number; // fluid ounces
  createdAt: string; // ISO 8601 timestamp
}

/**
 * Chat message stored in the chatHistory object store
 */
export interface ChatMessage {
  id: string; // UUID
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO 8601 timestamp
}

/**
 * Data export format
 */
export interface ExportData {
  version: '1.0';
  exportedAt: string; // ISO 8601 timestamp
  userProfile: UserProfile;
  workouts: WorkoutEntry[];
  nutrition: NutritionEntry[];
  supplements: SupplementEntry[];
  supplementChecklist: SupplementChecklistEntry[];
  waterIntake: WaterIntakeEntry[];
  chatHistory: ChatMessage[];
}
