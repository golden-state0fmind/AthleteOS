/**
 * IndexedDB Database Initialization Module
 * 
 * This module handles the initialization and schema management for the AthleteOS IndexedDB database.
 * Database Name: athleteos-db
 * Schema Version: 1
 * 
 * Requirements: 4.1, 8.1, 11.4, 14.3, 24.1
 */

const DB_NAME = 'athleteos-db';
const DB_VERSION = 2;

/**
 * Opens and initializes the IndexedDB database with schema version 1.
 * Creates all object stores and indexes as specified in the design document.
 * 
 * @returns Promise<IDBDatabase> The opened database instance
 * @throws Error if database initialization fails
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Check for IndexedDB support
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction;

      if (!transaction) {
        reject(new Error('Transaction not available during upgrade'));
        return;
      }

      // Handle upgrade from no database to version 1
      if (event.oldVersion < 1) {
        createSchemaV1(db);
      }

      // Upgrade to version 2: Add waterIntake object store
      if (event.oldVersion < 2) {
        upgradeToV2(db);
      }

      // Future version upgrades can be handled here
      // if (event.oldVersion < 3) { ... }
    };
  });
}

/**
 * Creates the schema for database version 1.
 * Defines all object stores and their indexes.
 * 
 * @param db The IDBDatabase instance
 */
function createSchemaV1(db: IDBDatabase): void {
  // Object Store: userProfile
  // Single record store for user profile data
  if (!db.objectStoreNames.contains('userProfile')) {
    db.createObjectStore('userProfile', { keyPath: 'id' });
  }

  // Object Store: workouts
  // Stores workout entries with timestamp and exercise type indexes
  if (!db.objectStoreNames.contains('workouts')) {
    const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
    workoutStore.createIndex('timestamp', 'timestamp', { unique: false });
    workoutStore.createIndex('exerciseType', 'exerciseType', { unique: false });
  }

  // Object Store: nutrition
  // Stores nutrition entries with date, timestamp, and status indexes
  if (!db.objectStoreNames.contains('nutrition')) {
    const nutritionStore = db.createObjectStore('nutrition', { keyPath: 'id' });
    nutritionStore.createIndex('date', 'date', { unique: false });
    nutritionStore.createIndex('timestamp', 'timestamp', { unique: false });
    nutritionStore.createIndex('status', 'status', { unique: false });
  }

  // Object Store: supplements
  // Stores supplement entries with active status and name indexes
  if (!db.objectStoreNames.contains('supplements')) {
    const supplementStore = db.createObjectStore('supplements', { keyPath: 'id' });
    supplementStore.createIndex('active', 'active', { unique: false });
    supplementStore.createIndex('name', 'name', { unique: false });
  }

  // Object Store: supplementChecklist
  // Stores daily supplement checklist entries with date and supplementId indexes
  if (!db.objectStoreNames.contains('supplementChecklist')) {
    const checklistStore = db.createObjectStore('supplementChecklist', { keyPath: 'id' });
    checklistStore.createIndex('date', 'date', { unique: false });
    checklistStore.createIndex('supplementId', 'supplementId', { unique: false });
    // Compound index for ensuring daily uniqueness per supplement
    checklistStore.createIndex('date_supplementId', ['date', 'supplementId'], { unique: true });
  }

  // Object Store: chatHistory
  // Stores chat messages with timestamp index for chronological display
  if (!db.objectStoreNames.contains('chatHistory')) {
    const chatStore = db.createObjectStore('chatHistory', { keyPath: 'id' });
    chatStore.createIndex('timestamp', 'timestamp', { unique: false });
  }
}

/**
 * Upgrades the database schema to version 2.
 * Adds the waterIntake object store.
 * 
 * @param db The IDBDatabase instance
 */
function upgradeToV2(db: IDBDatabase): void {
  // Object Store: waterIntake
  // Stores water intake entries with date and timestamp indexes
  if (!db.objectStoreNames.contains('waterIntake')) {
    const waterStore = db.createObjectStore('waterIntake', { keyPath: 'id' });
    waterStore.createIndex('date', 'date', { unique: false });
    waterStore.createIndex('timestamp', 'timestamp', { unique: false });
  }
}

/**
 * Gets a reference to the database.
 * Opens the database if not already open.
 * 
 * @returns Promise<IDBDatabase> The database instance
 */
export async function getDB(): Promise<IDBDatabase> {
  return initDB();
}

/**
 * Closes the database connection.
 * 
 * @param db The database instance to close
 */
export function closeDB(db: IDBDatabase): void {
  db.close();
}

/**
 * Deletes the entire database.
 * Useful for testing or data reset scenarios.
 * 
 * @returns Promise<void>
 */
export function deleteDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onerror = () => {
      reject(new Error(`Failed to delete database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve();
    };

    request.onblocked = () => {
      console.warn('Database deletion blocked. Close all connections and try again.');
    };
  });
}
