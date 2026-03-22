/**
 * Export Service
 * 
 * Provides data export and import functionality for backing up and restoring
 * all user data stored in IndexedDB.
 * Requirements: 24.4, 30.2, 30.4
 */

import { getDB } from '../db';
import type {
  ExportData,
  UserProfile,
  WorkoutEntry,
  NutritionEntry,
  SupplementEntry,
  SupplementChecklistEntry,
  ChatMessage,
} from '../types/db';

/**
 * Exports all user data from IndexedDB to a JSON-serializable object.
 * 
 * Requirements:
 * - 30.2: Generate JSON file containing all user data
 * - 30.4: Include timestamp and schema version identifier
 * 
 * @returns Promise<ExportData> Complete export of all user data
 * @throws Error if data retrieval fails
 */
export async function exportUserData(): Promise<ExportData> {
  const db = await getDB();

  // Retrieve all data from each object store
  const userProfile = await getAllFromStore<UserProfile>(db, 'userProfile');
  const workouts = await getAllFromStore<WorkoutEntry>(db, 'workouts');
  const nutrition = await getAllFromStore<NutritionEntry>(db, 'nutrition');
  const supplements = await getAllFromStore<SupplementEntry>(db, 'supplements');
  const supplementChecklist = await getAllFromStore<SupplementChecklistEntry>(db, 'supplementChecklist');
  const chatHistory = await getAllFromStore<ChatMessage>(db, 'chatHistory');

  // Construct export data with version and timestamp
  const exportData: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userProfile: userProfile[0], // Single record
    workouts,
    nutrition,
    supplements,
    supplementChecklist,
    chatHistory,
  };

  return exportData;
}

/**
 * Imports user data from an exported JSON object, restoring all data to IndexedDB.
 * 
 * Requirements:
 * - 30.5: Restore data from exported JSON file
 * 
 * @param exportData The exported data object to import
 * @returns Promise<void>
 * @throws Error if import fails or data format is invalid
 */
export async function importUserData(exportData: ExportData): Promise<void> {
  // Validate export data format
  if (!exportData.version || exportData.version !== '1.0') {
    throw new Error('Invalid or unsupported export data version');
  }

  if (!exportData.exportedAt) {
    throw new Error('Invalid export data: missing exportedAt timestamp');
  }

  const db = await getDB();

  // Import data to each object store
  // Note: This will add to existing data, not replace it
  // For a full restore, the user should clear data first

  // Import user profile (single record, will replace existing)
  if (exportData.userProfile) {
    await putToStore(db, 'userProfile', exportData.userProfile);
  }

  // Import workouts
  if (exportData.workouts && Array.isArray(exportData.workouts)) {
    for (const workout of exportData.workouts) {
      await putToStore(db, 'workouts', workout);
    }
  }

  // Import nutrition entries
  if (exportData.nutrition && Array.isArray(exportData.nutrition)) {
    for (const entry of exportData.nutrition) {
      await putToStore(db, 'nutrition', entry);
    }
  }

  // Import supplements
  if (exportData.supplements && Array.isArray(exportData.supplements)) {
    for (const supplement of exportData.supplements) {
      await putToStore(db, 'supplements', supplement);
    }
  }

  // Import supplement checklist
  if (exportData.supplementChecklist && Array.isArray(exportData.supplementChecklist)) {
    for (const checklistEntry of exportData.supplementChecklist) {
      await putToStore(db, 'supplementChecklist', checklistEntry);
    }
  }

  // Import chat history
  if (exportData.chatHistory && Array.isArray(exportData.chatHistory)) {
    for (const message of exportData.chatHistory) {
      await putToStore(db, 'chatHistory', message);
    }
  }
}

/**
 * Helper function to retrieve all records from an object store.
 * 
 * @param db The database instance
 * @param storeName The name of the object store
 * @returns Promise<T[]> Array of all records in the store
 */
function getAllFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get all from ${storeName}: ${request.error?.message}`));
    };
  });
}

/**
 * Helper function to put a record into an object store.
 * Uses put() instead of add() to allow overwriting existing records.
 * 
 * @param db The database instance
 * @param storeName The name of the object store
 * @param data The data to store
 * @returns Promise<void>
 */
function putToStore(db: IDBDatabase, storeName: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to put to ${storeName}: ${request.error?.message}`));
    };
  });
}
