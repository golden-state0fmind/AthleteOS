/**
 * Supplement Service
 * 
 * Provides CRUD operations for supplement data stored in IndexedDB.
 * Includes daily checklist functionality for tracking supplement intake.
 * Requirements: 11.4, 14.1, 14.2, 14.3
 */

import { getDB } from '../db';
import type { SupplementEntry, SupplementChecklistEntry } from '../types/db';

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
 * Adds a new supplement entry to IndexedDB.
 * 
 * @param supplement Supplement data without id, createdAt, and updatedAt
 * @returns Promise<SupplementEntry> The created supplement entry with all fields
 */
export async function addSupplement(
  supplement: Omit<SupplementEntry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SupplementEntry> {
  const db = await getDB();
  const now = new Date().toISOString();

  const newSupplement: SupplementEntry = {
    ...supplement,
    id: generateUUID(),
    createdAt: now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('supplements', 'readwrite');
    const store = transaction.objectStore('supplements');
    const request = store.add(newSupplement);

    request.onsuccess = () => {
      resolve(newSupplement);
    };

    request.onerror = () => {
      reject(new Error(`Failed to add supplement: ${request.error?.message}`));
    };
  });
}

/**
 * Retrieves all active supplements from IndexedDB.
 * 
 * @returns Promise<SupplementEntry[]> Array of active supplement entries
 */
export async function getActiveSupplements(): Promise<SupplementEntry[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('supplements', 'readonly');
    const store = transaction.objectStore('supplements');
    
    // Get all supplements and filter for active ones
    const request = store.getAll();

    request.onsuccess = () => {
      const allSupplements = request.result as SupplementEntry[];
      const activeSupplements = allSupplements.filter(s => s.active === true);
      resolve(activeSupplements);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get active supplements: ${request.error?.message}`));
    };
  });
}

/**
 * Deactivates a supplement (soft deletion).
 * Sets the active flag to false instead of deleting the record.
 * 
 * @param id The supplement entry ID
 * @returns Promise<void>
 */
export async function deactivateSupplement(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('supplements', 'readwrite');
    const store = transaction.objectStore('supplements');
    
    // First, get the existing supplement
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const supplement = getRequest.result as SupplementEntry | undefined;
      
      if (!supplement) {
        reject(new Error(`Supplement with id ${id} not found`));
        return;
      }

      // Update the active flag and updatedAt timestamp
      supplement.active = false;
      supplement.updatedAt = new Date().toISOString();
      
      // Put the updated supplement back
      const putRequest = store.put(supplement);

      putRequest.onsuccess = () => {
        resolve();
      };

      putRequest.onerror = () => {
        reject(new Error(`Failed to deactivate supplement: ${putRequest.error?.message}`));
      };
    };

    getRequest.onerror = () => {
      reject(new Error(`Failed to get supplement: ${getRequest.error?.message}`));
    };
  });
}

/**
 * Gets today's supplement checklist with taken status.
 * Returns active supplements with their taken status for the specified date.
 * 
 * @param date Date in YYYY-MM-DD format
 * @returns Promise<Array<SupplementEntry & { taken: boolean }>> Array of supplements with taken status
 */
export async function getTodayChecklist(
  date: string
): Promise<Array<SupplementEntry & { taken: boolean }>> {
  const db = await getDB();

  // Get all active supplements
  const activeSupplements = await getActiveSupplements();

  // Get checklist entries for the specified date
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('supplementChecklist', 'readonly');
    const store = transaction.objectStore('supplementChecklist');
    const index = store.index('date');
    
    const request = index.openCursor(IDBKeyRange.only(date));
    const checklistMap = new Map<string, boolean>();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      
      if (cursor) {
        const entry = cursor.value as SupplementChecklistEntry;
        checklistMap.set(entry.supplementId, entry.taken);
        cursor.continue();
      } else {
        // Combine active supplements with their taken status
        const checklist = activeSupplements.map((supplement) => ({
          ...supplement,
          taken: checklistMap.get(supplement.id) || false,
        }));
        
        resolve(checklist);
      }
    };

    request.onerror = () => {
      reject(new Error(`Failed to get today's checklist: ${request.error?.message}`));
    };
  });
}

/**
 * Marks a supplement as taken for a specific date.
 * Creates or updates a checklist entry with the current timestamp.
 * 
 * @param supplementId The supplement entry ID
 * @param date Date in YYYY-MM-DD format
 * @returns Promise<void>
 */
export async function markSupplementTaken(
  supplementId: string,
  date: string
): Promise<void> {
  const db = await getDB();
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('supplementChecklist', 'readwrite');
    const store = transaction.objectStore('supplementChecklist');
    const index = store.index('date_supplementId');
    
    // Check if an entry already exists for this supplement and date
    const getRequest = index.get([date, supplementId]);

    getRequest.onsuccess = () => {
      const existingEntry = getRequest.result as SupplementChecklistEntry | undefined;

      if (existingEntry) {
        // Update existing entry
        existingEntry.taken = true;
        existingEntry.takenAt = now;
        
        const putRequest = store.put(existingEntry);

        putRequest.onsuccess = () => {
          resolve();
        };

        putRequest.onerror = () => {
          reject(new Error(`Failed to update checklist entry: ${putRequest.error?.message}`));
        };
      } else {
        // Create new entry
        const newEntry: SupplementChecklistEntry = {
          id: generateUUID(),
          supplementId,
          date,
          taken: true,
          takenAt: now,
        };

        const addRequest = store.add(newEntry);

        addRequest.onsuccess = () => {
          resolve();
        };

        addRequest.onerror = () => {
          reject(new Error(`Failed to create checklist entry: ${addRequest.error?.message}`));
        };
      }
    };

    getRequest.onerror = () => {
      reject(new Error(`Failed to check for existing checklist entry: ${getRequest.error?.message}`));
    };
  });
}

/**
 * Marks a supplement as not taken for a specific date.
 * Updates the checklist entry to set taken to false.
 * 
 * @param supplementId The supplement entry ID
 * @param date Date in YYYY-MM-DD format
 * @returns Promise<void>
 */
export async function unmarkSupplementTaken(
  supplementId: string,
  date: string
): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('supplementChecklist', 'readwrite');
    const store = transaction.objectStore('supplementChecklist');
    const index = store.index('date_supplementId');
    
    // Check if an entry exists for this supplement and date
    const getRequest = index.get([date, supplementId]);

    getRequest.onsuccess = () => {
      const existingEntry = getRequest.result as SupplementChecklistEntry | undefined;

      if (existingEntry) {
        // Update existing entry
        existingEntry.taken = false;
        existingEntry.takenAt = null;
        
        const putRequest = store.put(existingEntry);

        putRequest.onsuccess = () => {
          resolve();
        };

        putRequest.onerror = () => {
          reject(new Error(`Failed to update checklist entry: ${putRequest.error?.message}`));
        };
      } else {
        // No entry exists, nothing to unmark
        resolve();
      }
    };

    getRequest.onerror = () => {
      reject(new Error(`Failed to check for existing checklist entry: ${getRequest.error?.message}`));
    };
  });
}
