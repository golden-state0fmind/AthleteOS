/**
 * User Profile Service
 * 
 * Provides CRUD operations for user profile data stored in IndexedDB.
 * Requirements: 17.4, 18.3
 */

import { getDB } from '../db';
import type { UserProfile } from '../types/db';

/**
 * Retrieves the user profile from IndexedDB.
 * 
 * @returns Promise<UserProfile | null> The user profile or null if not found
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('userProfile', 'readonly');
    const store = transaction.objectStore('userProfile');
    const request = store.get('singleton');

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get user profile: ${request.error?.message}`));
    };
  });
}

/**
 * Creates a new user profile in IndexedDB.
 * 
 * @param profile User profile data without id, createdAt, and updatedAt
 * @returns Promise<UserProfile> The created user profile with all fields
 */
export async function createUserProfile(
  profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<UserProfile> {
  const db = await getDB();
  const now = new Date().toISOString();

  const newProfile: UserProfile = {
    ...profile,
    id: 'singleton',
    createdAt: now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('userProfile', 'readwrite');
    const store = transaction.objectStore('userProfile');
    const request = store.add(newProfile);

    request.onsuccess = () => {
      resolve(newProfile);
    };

    request.onerror = () => {
      reject(new Error(`Failed to create user profile: ${request.error?.message}`));
    };
  });
}

/**
 * Updates the user profile in IndexedDB.
 * 
 * @param updates Partial user profile data to update
 * @returns Promise<UserProfile> The updated user profile
 */
export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const db = await getDB();
  
  // Get existing profile
  const existingProfile = await getUserProfile();
  
  if (!existingProfile) {
    throw new Error('User profile does not exist. Create a profile first.');
  }

  const updatedProfile: UserProfile = {
    ...existingProfile,
    ...updates,
    id: 'singleton', // Ensure id remains singleton
    updatedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('userProfile', 'readwrite');
    const store = transaction.objectStore('userProfile');
    const request = store.put(updatedProfile);

    request.onsuccess = () => {
      resolve(updatedProfile);
    };

    request.onerror = () => {
      reject(new Error(`Failed to update user profile: ${request.error?.message}`));
    };
  });
}
