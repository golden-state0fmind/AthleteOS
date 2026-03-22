/**
 * Export Service Unit Tests
 * 
 * Tests for data export and import functionality.
 * Requirements: 24.4, 30.2, 30.4
 */

import { exportUserData, importUserData } from '../services/exportService';
import { getDB, deleteDB } from '../db';
import type {
  ExportData,
  UserProfile,
  WorkoutEntry,
  NutritionEntry,
  SupplementEntry,
  SupplementChecklistEntry,
  ChatMessage,
} from '../types/db';

// Helper to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

describe('Export Service', () => {
  beforeEach(async () => {
    // Clean database before each test
    await deleteDB();
  });

  afterEach(async () => {
    // Clean up after each test
    await deleteDB();
  });

  describe('exportUserData', () => {
    it('should export empty data when database is empty', async () => {
      const exportData = await exportUserData();

      expect(exportData.version).toBe('1.0');
      expect(exportData.exportedAt).toBeDefined();
      expect(new Date(exportData.exportedAt).getTime()).toBeLessThanOrEqual(Date.now());
      expect(exportData.userProfile).toBeUndefined();
      expect(exportData.workouts).toEqual([]);
      expect(exportData.nutrition).toEqual([]);
      expect(exportData.supplements).toEqual([]);
      expect(exportData.supplementChecklist).toEqual([]);
      expect(exportData.chatHistory).toEqual([]);
    });

    it('should export user profile data', async () => {
      const db = await getDB();
      
      const userProfile: UserProfile = {
        id: 'singleton',
        name: 'Test User',
        age: 30,
        weight: 75,
        height: 180,
        fitnessGoal: 'build muscle',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add user profile
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('userProfile', 'readwrite');
        const store = transaction.objectStore('userProfile');
        const request = store.add(userProfile);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      const exportData = await exportUserData();

      expect(exportData.userProfile).toEqual(userProfile);
    });

    it('should export workout entries', async () => {
      const db = await getDB();
      
      const workout: WorkoutEntry = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        source: 'manual',
        exerciseType: 'Push-ups',
        estimatedReps: 20,
        sets: 3,
        duration: 10,
        formFeedback: null,
        notes: 'Good form',
        createdAt: new Date().toISOString(),
      };

      // Add workout
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('workouts', 'readwrite');
        const store = transaction.objectStore('workouts');
        const request = store.add(workout);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      const exportData = await exportUserData();

      expect(exportData.workouts).toHaveLength(1);
      expect(exportData.workouts[0]).toEqual(workout);
    });

    it('should export nutrition entries', async () => {
      const db = await getDB();
      
      const nutrition: NutritionEntry = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        date: '2025-01-15',
        status: 'consumed',
        foodName: 'Chicken Breast',
        servingSize: '100g',
        macros: {
          calories: 165,
          protein: 31,
          carbohydrates: 0,
          fats: 3.6,
          sugar: 0,
          sodium: 74,
        },
        warnings: [],
        createdAt: new Date().toISOString(),
      };

      // Add nutrition entry
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('nutrition', 'readwrite');
        const store = transaction.objectStore('nutrition');
        const request = store.add(nutrition);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      const exportData = await exportUserData();

      expect(exportData.nutrition).toHaveLength(1);
      expect(exportData.nutrition[0]).toEqual(nutrition);
    });

    it('should export supplement entries', async () => {
      const db = await getDB();
      
      const supplement: SupplementEntry = {
        id: generateUUID(),
        name: 'Creatine',
        dosage: '5g',
        frequency: 'daily',
        timing: 'morning',
        safetyNotes: 'Generally safe',
        effectiveness: 'Effective for muscle building',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add supplement
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('supplements', 'readwrite');
        const store = transaction.objectStore('supplements');
        const request = store.add(supplement);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      const exportData = await exportUserData();

      expect(exportData.supplements).toHaveLength(1);
      expect(exportData.supplements[0]).toEqual(supplement);
    });

    it('should export supplement checklist entries', async () => {
      const db = await getDB();
      
      const checklistEntry: SupplementChecklistEntry = {
        id: generateUUID(),
        supplementId: generateUUID(),
        date: '2025-01-15',
        taken: true,
        takenAt: new Date().toISOString(),
      };

      // Add checklist entry
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('supplementChecklist', 'readwrite');
        const store = transaction.objectStore('supplementChecklist');
        const request = store.add(checklistEntry);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      const exportData = await exportUserData();

      expect(exportData.supplementChecklist).toHaveLength(1);
      expect(exportData.supplementChecklist[0]).toEqual(checklistEntry);
    });

    it('should export chat history', async () => {
      const db = await getDB();
      
      const chatMessage: ChatMessage = {
        id: generateUUID(),
        role: 'user',
        content: 'What should I eat today?',
        timestamp: new Date().toISOString(),
      };

      // Add chat message
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('chatHistory', 'readwrite');
        const store = transaction.objectStore('chatHistory');
        const request = store.add(chatMessage);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      const exportData = await exportUserData();

      expect(exportData.chatHistory).toHaveLength(1);
      expect(exportData.chatHistory[0]).toEqual(chatMessage);
    });

    it('should export all data types together', async () => {
      const db = await getDB();
      
      // Add various data
      const userProfile: UserProfile = {
        id: 'singleton',
        name: 'Test User',
        age: 25,
        weight: 70,
        height: 175,
        fitnessGoal: 'lose weight',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const workout: WorkoutEntry = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        source: 'image',
        exerciseType: 'Squats',
        estimatedReps: 15,
        sets: 4,
        duration: null,
        formFeedback: 'Good depth',
        notes: null,
        createdAt: new Date().toISOString(),
      };

      // Add all data
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(['userProfile', 'workouts'], 'readwrite');
        transaction.objectStore('userProfile').add(userProfile);
        transaction.objectStore('workouts').add(workout);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });

      const exportData = await exportUserData();

      expect(exportData.userProfile).toEqual(userProfile);
      expect(exportData.workouts).toHaveLength(1);
      expect(exportData.workouts[0]).toEqual(workout);
    });
  });

  describe('importUserData', () => {
    it('should reject invalid export data without version', async () => {
      const invalidData = {
        exportedAt: new Date().toISOString(),
      } as any;

      await expect(importUserData(invalidData)).rejects.toThrow('Invalid or unsupported export data version');
    });

    it('should reject invalid export data without exportedAt', async () => {
      const invalidData = {
        version: '1.0',
      } as any;

      await expect(importUserData(invalidData)).rejects.toThrow('Invalid export data: missing exportedAt timestamp');
    });

    it('should reject unsupported version', async () => {
      const invalidData = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
      } as any;

      await expect(importUserData(invalidData)).rejects.toThrow('Invalid or unsupported export data version');
    });

    it('should import user profile data', async () => {
      const userProfile: UserProfile = {
        id: 'singleton',
        name: 'Imported User',
        age: 28,
        weight: 80,
        height: 185,
        fitnessGoal: 'performance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const exportData: ExportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        userProfile,
        workouts: [],
        nutrition: [],
        supplements: [],
        supplementChecklist: [],
        chatHistory: [],
      };

      await importUserData(exportData);

      // Verify data was imported
      const db = await getDB();
      const imported = await new Promise<UserProfile>((resolve, reject) => {
        const transaction = db.transaction('userProfile', 'readonly');
        const store = transaction.objectStore('userProfile');
        const request = store.get('singleton');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      expect(imported).toEqual(userProfile);
    });

    it('should import workout entries', async () => {
      const workout: WorkoutEntry = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        source: 'manual',
        exerciseType: 'Deadlift',
        estimatedReps: 5,
        sets: 5,
        duration: 20,
        formFeedback: null,
        notes: 'Heavy day',
        createdAt: new Date().toISOString(),
      };

      const exportData: ExportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        userProfile: {} as UserProfile,
        workouts: [workout],
        nutrition: [],
        supplements: [],
        supplementChecklist: [],
        chatHistory: [],
      };

      await importUserData(exportData);

      // Verify data was imported
      const db = await getDB();
      const imported = await new Promise<WorkoutEntry[]>((resolve, reject) => {
        const transaction = db.transaction('workouts', 'readonly');
        const store = transaction.objectStore('workouts');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      expect(imported).toHaveLength(1);
      expect(imported[0]).toEqual(workout);
    });

    it('should import multiple entries of different types', async () => {
      const workout1: WorkoutEntry = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        source: 'manual',
        exerciseType: 'Bench Press',
        estimatedReps: 10,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
        createdAt: new Date().toISOString(),
      };

      const workout2: WorkoutEntry = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        source: 'image',
        exerciseType: 'Pull-ups',
        estimatedReps: 8,
        sets: 3,
        duration: null,
        formFeedback: 'Good form',
        notes: null,
        createdAt: new Date().toISOString(),
      };

      const nutrition: NutritionEntry = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        date: '2025-01-15',
        status: 'planned',
        foodName: 'Oatmeal',
        servingSize: '1 cup',
        macros: {
          calories: 150,
          protein: 5,
          carbohydrates: 27,
          fats: 3,
          sugar: 1,
          sodium: 0,
        },
        warnings: [],
        createdAt: new Date().toISOString(),
      };

      const exportData: ExportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        userProfile: {} as UserProfile,
        workouts: [workout1, workout2],
        nutrition: [nutrition],
        supplements: [],
        supplementChecklist: [],
        chatHistory: [],
      };

      await importUserData(exportData);

      // Verify workouts were imported
      const db = await getDB();
      const importedWorkouts = await new Promise<WorkoutEntry[]>((resolve, reject) => {
        const transaction = db.transaction('workouts', 'readonly');
        const store = transaction.objectStore('workouts');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      expect(importedWorkouts).toHaveLength(2);

      // Verify nutrition was imported
      const importedNutrition = await new Promise<NutritionEntry[]>((resolve, reject) => {
        const transaction = db.transaction('nutrition', 'readonly');
        const store = transaction.objectStore('nutrition');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      expect(importedNutrition).toHaveLength(1);
      expect(importedNutrition[0]).toEqual(nutrition);
    });

    it('should handle empty arrays in export data', async () => {
      const exportData: ExportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        userProfile: {} as UserProfile,
        workouts: [],
        nutrition: [],
        supplements: [],
        supplementChecklist: [],
        chatHistory: [],
      };

      // Should not throw
      await expect(importUserData(exportData)).resolves.not.toThrow();
    });
  });

  describe('export and import round-trip', () => {
    it('should preserve all data through export and import', async () => {
      const db = await getDB();
      
      // Create comprehensive test data
      const userProfile: UserProfile = {
        id: 'singleton',
        name: 'Round Trip User',
        age: 32,
        weight: 75,
        height: 178,
        fitnessGoal: 'maintain',
        macroTargets: {
          calories: 2500,
          protein: 150,
          carbohydrates: 300,
          fats: 80,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const workout: WorkoutEntry = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        source: 'manual',
        exerciseType: 'Running',
        estimatedReps: null,
        sets: null,
        duration: 30,
        formFeedback: null,
        notes: 'Morning run',
        createdAt: new Date().toISOString(),
      };

      // Add data
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(['userProfile', 'workouts'], 'readwrite');
        transaction.objectStore('userProfile').add(userProfile);
        transaction.objectStore('workouts').add(workout);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });

      // Export data
      const exportData = await exportUserData();

      // Clear database
      await deleteDB();

      // Import data back
      await importUserData(exportData);

      // Export again and compare
      const reExportData = await exportUserData();

      expect(reExportData.userProfile).toEqual(userProfile);
      expect(reExportData.workouts).toHaveLength(1);
      expect(reExportData.workouts[0]).toEqual(workout);
    });
  });
});
