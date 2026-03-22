/**
 * Example usage of the IndexedDB initialization module
 * 
 * This file demonstrates how to initialize and use the AthleteOS database.
 */

import { initDB, getDB, closeDB } from '../db';
import type { UserProfile, WorkoutEntry, NutritionEntry } from '../types/db';

/**
 * Example: Initialize the database on application startup
 */
export async function initializeApp() {
  try {
    const db = await initDB();
    console.log('Database initialized successfully:', db.name, 'version', db.version);
    
    // Verify all object stores exist
    const stores = ['userProfile', 'workouts', 'nutrition', 'supplements', 'supplementChecklist', 'chatHistory'];
    stores.forEach(storeName => {
      if (db.objectStoreNames.contains(storeName)) {
        console.log(`✓ Object store '${storeName}' exists`);
      } else {
        console.error(`✗ Object store '${storeName}' missing`);
      }
    });
    
    closeDB(db);
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

/**
 * Example: Create a user profile
 */
export async function createUserProfile(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDB();
  
  const profile: UserProfile = {
    id: 'singleton',
    ...profileData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const transaction = db.transaction('userProfile', 'readwrite');
  const store = transaction.objectStore('userProfile');
  
  return new Promise<UserProfile>((resolve, reject) => {
    const request = store.put(profile);
    
    request.onsuccess = () => {
      console.log('User profile created successfully');
      resolve(profile);
    };
    
    request.onerror = () => {
      console.error('Failed to create user profile:', request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      closeDB(db);
    };
  });
}

/**
 * Example: Add a workout entry
 */
export async function addWorkout(workoutData: Omit<WorkoutEntry, 'id' | 'createdAt'>) {
  const db = await getDB();
  
  const workout: WorkoutEntry = {
    id: crypto.randomUUID(),
    ...workoutData,
    createdAt: new Date().toISOString(),
  };
  
  const transaction = db.transaction('workouts', 'readwrite');
  const store = transaction.objectStore('workouts');
  
  return new Promise<WorkoutEntry>((resolve, reject) => {
    const request = store.add(workout);
    
    request.onsuccess = () => {
      console.log('Workout added successfully:', workout.id);
      resolve(workout);
    };
    
    request.onerror = () => {
      console.error('Failed to add workout:', request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      closeDB(db);
    };
  });
}

/**
 * Example: Query workouts by timestamp index
 */
export async function getRecentWorkouts(limit: number = 10): Promise<WorkoutEntry[]> {
  const db = await getDB();
  
  const transaction = db.transaction('workouts', 'readonly');
  const store = transaction.objectStore('workouts');
  const index = store.index('timestamp');
  
  return new Promise((resolve, reject) => {
    const workouts: WorkoutEntry[] = [];
    
    // Open cursor in descending order (most recent first)
    const request = index.openCursor(null, 'prev');
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      
      if (cursor && workouts.length < limit) {
        workouts.push(cursor.value);
        cursor.continue();
      } else {
        resolve(workouts);
      }
    };
    
    request.onerror = () => {
      console.error('Failed to query workouts:', request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      closeDB(db);
    };
  });
}

/**
 * Example: Query nutrition entries by date
 */
export async function getNutritionByDate(date: string): Promise<NutritionEntry[]> {
  const db = await getDB();
  
  const transaction = db.transaction('nutrition', 'readonly');
  const store = transaction.objectStore('nutrition');
  const index = store.index('date');
  
  return new Promise((resolve, reject) => {
    const request = index.getAll(date);
    
    request.onsuccess = () => {
      console.log(`Found ${request.result.length} nutrition entries for ${date}`);
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('Failed to query nutrition entries:', request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      closeDB(db);
    };
  });
}

/**
 * Example: Check if database is initialized
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const db = await getDB();
    const isInitialized = db.objectStoreNames.length === 6;
    closeDB(db);
    return isInitialized;
  } catch (error) {
    return false;
  }
}
