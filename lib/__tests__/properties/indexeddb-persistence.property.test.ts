/**
 * Property-Based Test for IndexedDB Persistence
 * 
 * Feature: athlete-os, Property 11: IndexedDB Persistence
 * 
 * Property: For any data stored in IndexedDB (workouts, nutrition, supplements, profile),
 * the data should remain accessible after simulating a browser session restart
 * (closing and reopening the database connection).
 * 
 * Validates: Requirements 4.5, 8.5
 */

import fc from 'fast-check';
import { initDB, closeDB, deleteDB } from '../../db';

describe('Property 11: IndexedDB Persistence', () => {
  beforeEach(async () => {
    // Clean up before each test
    try {
      await deleteDB();
    } catch (e) {
      // Database might not exist
    }
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      await deleteDB();
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  it('should persist workout data across database session restart', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          timestamp: fc.date().map(d => d.toISOString()),
          source: fc.constantFrom('image', 'manual'),
          exerciseType: fc.string({ minLength: 1, maxLength: 50 }),
          estimatedReps: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: null }),
          sets: fc.option(fc.integer({ min: 1, max: 100 }), { nil: null }),
          duration: fc.option(fc.integer({ min: 1, max: 600 }), { nil: null }),
          formFeedback: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
          notes: fc.option(fc.string({ maxLength: 1000 }), { nil: null }),
          createdAt: fc.date().map(d => d.toISOString()),
        }),
        async (workoutData) => {
          // Session 1: Store workout data
          const db1 = await initDB();
          const tx1 = db1.transaction('workouts', 'readwrite');
          const store1 = tx1.objectStore('workouts');
          await store1.add(workoutData);
          await new Promise<void>((resolve, reject) => {
            tx1.oncomplete = () => resolve();
            tx1.onerror = () => reject(tx1.error);
          });
          closeDB(db1);

          // Simulate browser session restart by reopening database
          const db2 = await initDB();
          const tx2 = db2.transaction('workouts', 'readonly');
          const store2 = tx2.objectStore('workouts');
          const retrieved = await store2.get(workoutData.id);
          await new Promise<void>((resolve, reject) => {
            tx2.oncomplete = () => resolve();
            tx2.onerror = () => reject(tx2.error);
          });
          closeDB(db2);

          // Assert data persisted correctly
          expect(retrieved).toBeDefined();
          expect(retrieved.id).toBe(workoutData.id);
          expect(retrieved.timestamp).toBe(workoutData.timestamp);
          expect(retrieved.source).toBe(workoutData.source);
          expect(retrieved.exerciseType).toBe(workoutData.exerciseType);
          expect(retrieved.estimatedReps).toBe(workoutData.estimatedReps);
          expect(retrieved.sets).toBe(workoutData.sets);
          expect(retrieved.duration).toBe(workoutData.duration);
          expect(retrieved.formFeedback).toBe(workoutData.formFeedback);
          expect(retrieved.notes).toBe(workoutData.notes);
          expect(retrieved.createdAt).toBe(workoutData.createdAt);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should persist nutrition data across database session restart', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          timestamp: fc.date().map(d => d.toISOString()),
          date: fc.date().map(d => d.toISOString().split('T')[0]), // YYYY-MM-DD
          status: fc.constantFrom('planned', 'consumed'),
          foodName: fc.string({ minLength: 1, maxLength: 100 }),
          servingSize: fc.option(fc.string({ maxLength: 50 }), { nil: null }),
          macros: fc.record({
            calories: fc.option(fc.integer({ min: 0, max: 5000 }), { nil: null }),
            protein: fc.option(fc.integer({ min: 0, max: 500 }), { nil: null }),
            carbohydrates: fc.option(fc.integer({ min: 0, max: 500 }), { nil: null }),
            fats: fc.option(fc.integer({ min: 0, max: 500 }), { nil: null }),
            sugar: fc.option(fc.integer({ min: 0, max: 500 }), { nil: null }),
            sodium: fc.option(fc.integer({ min: 0, max: 10000 }), { nil: null }),
          }),
          warnings: fc.array(
            fc.record({
              type: fc.constantFrom('goal_conflict', 'high_sodium'),
              message: fc.string({ maxLength: 200 }),
            }),
            { maxLength: 3 }
          ),
          createdAt: fc.date().map(d => d.toISOString()),
        }),
        async (nutritionData) => {
          // Session 1: Store nutrition data
          const db1 = await initDB();
          const tx1 = db1.transaction('nutrition', 'readwrite');
          const store1 = tx1.objectStore('nutrition');
          await store1.add(nutritionData);
          await new Promise<void>((resolve, reject) => {
            tx1.oncomplete = () => resolve();
            tx1.onerror = () => reject(tx1.error);
          });
          closeDB(db1);

          // Simulate browser session restart
          const db2 = await initDB();
          const tx2 = db2.transaction('nutrition', 'readonly');
          const store2 = tx2.objectStore('nutrition');
          const retrieved = await store2.get(nutritionData.id);
          await new Promise<void>((resolve, reject) => {
            tx2.oncomplete = () => resolve();
            tx2.onerror = () => reject(tx2.error);
          });
          closeDB(db2);

          // Assert data persisted correctly
          expect(retrieved).toBeDefined();
          expect(retrieved.id).toBe(nutritionData.id);
          expect(retrieved.timestamp).toBe(nutritionData.timestamp);
          expect(retrieved.date).toBe(nutritionData.date);
          expect(retrieved.status).toBe(nutritionData.status);
          expect(retrieved.foodName).toBe(nutritionData.foodName);
          expect(retrieved.servingSize).toBe(nutritionData.servingSize);
          expect(retrieved.macros).toEqual(nutritionData.macros);
          expect(retrieved.warnings).toEqual(nutritionData.warnings);
          expect(retrieved.createdAt).toBe(nutritionData.createdAt);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should persist supplement data across database session restart', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          dosage: fc.string({ minLength: 1, maxLength: 50 }),
          frequency: fc.constantFrom('daily', 'twice_daily', 'weekly', 'as_needed'),
          timing: fc.string({ minLength: 1, maxLength: 100 }),
          safetyNotes: fc.string({ maxLength: 500 }),
          effectiveness: fc.string({ maxLength: 500 }),
          active: fc.boolean(),
          createdAt: fc.date().map(d => d.toISOString()),
          updatedAt: fc.date().map(d => d.toISOString()),
        }),
        async (supplementData) => {
          // Session 1: Store supplement data
          const db1 = await initDB();
          const tx1 = db1.transaction('supplements', 'readwrite');
          const store1 = tx1.objectStore('supplements');
          await store1.add(supplementData);
          await new Promise<void>((resolve, reject) => {
            tx1.oncomplete = () => resolve();
            tx1.onerror = () => reject(tx1.error);
          });
          closeDB(db1);

          // Simulate browser session restart
          const db2 = await initDB();
          const tx2 = db2.transaction('supplements', 'readonly');
          const store2 = tx2.objectStore('supplements');
          const retrieved = await store2.get(supplementData.id);
          await new Promise<void>((resolve, reject) => {
            tx2.oncomplete = () => resolve();
            tx2.onerror = () => reject(tx2.error);
          });
          closeDB(db2);

          // Assert data persisted correctly
          expect(retrieved).toBeDefined();
          expect(retrieved.id).toBe(supplementData.id);
          expect(retrieved.name).toBe(supplementData.name);
          expect(retrieved.dosage).toBe(supplementData.dosage);
          expect(retrieved.frequency).toBe(supplementData.frequency);
          expect(retrieved.timing).toBe(supplementData.timing);
          expect(retrieved.safetyNotes).toBe(supplementData.safetyNotes);
          expect(retrieved.effectiveness).toBe(supplementData.effectiveness);
          expect(retrieved.active).toBe(supplementData.active);
          expect(retrieved.createdAt).toBe(supplementData.createdAt);
          expect(retrieved.updatedAt).toBe(supplementData.updatedAt);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should persist user profile data across database session restart', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.constant('singleton'),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          age: fc.integer({ min: 13, max: 120 }),
          weight: fc.integer({ min: 20, max: 300 }),
          height: fc.integer({ min: 100, max: 250 }),
          fitnessGoal: fc.constantFrom('lose weight', 'build muscle', 'maintain', 'performance'),
          macroTargets: fc.option(
            fc.record({
              calories: fc.integer({ min: 1000, max: 5000 }),
              protein: fc.integer({ min: 50, max: 300 }),
              carbohydrates: fc.integer({ min: 50, max: 500 }),
              fats: fc.integer({ min: 20, max: 200 }),
            }),
            { nil: undefined }
          ),
          createdAt: fc.date().map(d => d.toISOString()),
          updatedAt: fc.date().map(d => d.toISOString()),
        }),
        async (profileData) => {
          // Session 1: Store profile data
          const db1 = await initDB();
          const tx1 = db1.transaction('userProfile', 'readwrite');
          const store1 = tx1.objectStore('userProfile');
          await store1.add(profileData);
          await new Promise<void>((resolve, reject) => {
            tx1.oncomplete = () => resolve();
            tx1.onerror = () => reject(tx1.error);
          });
          closeDB(db1);

          // Simulate browser session restart
          const db2 = await initDB();
          const tx2 = db2.transaction('userProfile', 'readonly');
          const store2 = tx2.objectStore('userProfile');
          const retrieved = await store2.get('singleton');
          await new Promise<void>((resolve, reject) => {
            tx2.oncomplete = () => resolve();
            tx2.onerror = () => reject(tx2.error);
          });
          closeDB(db2);

          // Assert data persisted correctly
          expect(retrieved).toBeDefined();
          expect(retrieved.id).toBe('singleton');
          expect(retrieved.name).toBe(profileData.name);
          expect(retrieved.age).toBe(profileData.age);
          expect(retrieved.weight).toBe(profileData.weight);
          expect(retrieved.height).toBe(profileData.height);
          expect(retrieved.fitnessGoal).toBe(profileData.fitnessGoal);
          expect(retrieved.macroTargets).toEqual(profileData.macroTargets);
          expect(retrieved.createdAt).toBe(profileData.createdAt);
          expect(retrieved.updatedAt).toBe(profileData.updatedAt);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should persist supplement checklist data across database session restart', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          supplementId: fc.uuid(),
          date: fc.date().map(d => d.toISOString().split('T')[0]), // YYYY-MM-DD
          taken: fc.boolean(),
          takenAt: fc.option(fc.date().map(d => d.toISOString()), { nil: null }),
        }),
        async (checklistData) => {
          // Session 1: Store checklist data
          const db1 = await initDB();
          const tx1 = db1.transaction('supplementChecklist', 'readwrite');
          const store1 = tx1.objectStore('supplementChecklist');
          await store1.add(checklistData);
          await new Promise<void>((resolve, reject) => {
            tx1.oncomplete = () => resolve();
            tx1.onerror = () => reject(tx1.error);
          });
          closeDB(db1);

          // Simulate browser session restart
          const db2 = await initDB();
          const tx2 = db2.transaction('supplementChecklist', 'readonly');
          const store2 = tx2.objectStore('supplementChecklist');
          const retrieved = await store2.get(checklistData.id);
          await new Promise<void>((resolve, reject) => {
            tx2.oncomplete = () => resolve();
            tx2.onerror = () => reject(tx2.error);
          });
          closeDB(db2);

          // Assert data persisted correctly
          expect(retrieved).toBeDefined();
          expect(retrieved.id).toBe(checklistData.id);
          expect(retrieved.supplementId).toBe(checklistData.supplementId);
          expect(retrieved.date).toBe(checklistData.date);
          expect(retrieved.taken).toBe(checklistData.taken);
          expect(retrieved.takenAt).toBe(checklistData.takenAt);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should persist chat history data across database session restart', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          role: fc.constantFrom('user', 'assistant'),
          content: fc.string({ minLength: 1, maxLength: 2000 }),
          timestamp: fc.date().map(d => d.toISOString()),
        }),
        async (chatData) => {
          // Session 1: Store chat data
          const db1 = await initDB();
          const tx1 = db1.transaction('chatHistory', 'readwrite');
          const store1 = tx1.objectStore('chatHistory');
          await store1.add(chatData);
          await new Promise<void>((resolve, reject) => {
            tx1.oncomplete = () => resolve();
            tx1.onerror = () => reject(tx1.error);
          });
          closeDB(db1);

          // Simulate browser session restart
          const db2 = await initDB();
          const tx2 = db2.transaction('chatHistory', 'readonly');
          const store2 = tx2.objectStore('chatHistory');
          const retrieved = await store2.get(chatData.id);
          await new Promise<void>((resolve, reject) => {
            tx2.oncomplete = () => resolve();
            tx2.onerror = () => reject(tx2.error);
          });
          closeDB(db2);

          // Assert data persisted correctly
          expect(retrieved).toBeDefined();
          expect(retrieved.id).toBe(chatData.id);
          expect(retrieved.role).toBe(chatData.role);
          expect(retrieved.content).toBe(chatData.content);
          expect(retrieved.timestamp).toBe(chatData.timestamp);
        }
      ),
      { numRuns: 10 }
    );
  });
});
