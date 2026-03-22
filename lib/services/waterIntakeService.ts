/**
 * Water Intake Service
 * 
 * Handles all water intake tracking operations including adding entries,
 * retrieving daily totals, and managing water intake history.
 * 
 * Note: All amounts are stored in fluid ounces (oz).
 */

import { getDB } from '../db';
import type { WaterIntakeEntry } from '../types/db';

/**
 * Generates a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Adds a water intake entry
 */
export async function addWaterIntake(
  data: Omit<WaterIntakeEntry, 'id' | 'createdAt'>
): Promise<WaterIntakeEntry> {
  const db = await getDB();
  const now = new Date().toISOString();

  const entry: WaterIntakeEntry = {
    id: generateUUID(),
    ...data,
    createdAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['waterIntake'], 'readwrite');
    const store = transaction.objectStore('waterIntake');
    const request = store.add(entry);

    request.onsuccess = () => resolve(entry);
    request.onerror = () => reject(new Error('Failed to add water intake entry'));
  });
}

/**
 * Gets all water intake entries for a specific date
 */
export async function getWaterIntakeByDate(date: string): Promise<WaterIntakeEntry[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['waterIntake'], 'readonly');
    const store = transaction.objectStore('waterIntake');
    const index = store.index('date');
    const request = index.getAll(date);

    request.onsuccess = () => {
      const entries = request.result as WaterIntakeEntry[];
      // Sort by timestamp (most recent first)
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(entries);
    };
    request.onerror = () => reject(new Error('Failed to fetch water intake entries'));
  });
}

/**
 * Gets the total water intake for a specific date
 * @returns Total water intake in fluid ounces
 */
export async function getDailyWaterTotal(date: string): Promise<number> {
  const entries = await getWaterIntakeByDate(date);
  return entries.reduce((total, entry) => total + entry.amount, 0);
}

/**
 * Deletes a water intake entry
 */
export async function deleteWaterIntake(id: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['waterIntake'], 'readwrite');
    const store = transaction.objectStore('waterIntake');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to delete water intake entry'));
  });
}

/**
 * Gets all water intake entries (for export)
 */
export async function getAllWaterIntake(): Promise<WaterIntakeEntry[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['waterIntake'], 'readonly');
    const store = transaction.objectStore('waterIntake');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as WaterIntakeEntry[]);
    request.onerror = () => reject(new Error('Failed to fetch all water intake entries'));
  });
}
