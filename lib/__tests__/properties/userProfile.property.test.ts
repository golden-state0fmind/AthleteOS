/**
 * Property-Based Tests for User Profile Service
 * 
 * **Property 35: User Profile Persistence Round Trip**
 * **Validates: Requirements 17.4**
 */

import * as fc from 'fast-check';
import { deleteDB } from '../../db';
import { createUserProfile, getUserProfile, updateUserProfile } from '../../services/userProfileService';
import type { UserProfile } from '../../types/db';

// Setup fake-indexeddb for testing
import 'fake-indexeddb/auto';

describe('User Profile Service - Property Tests', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await deleteDB();
  });

  afterEach(async () => {
    // Clean up database after each test
    await deleteDB();
  });

  describe('Property 35: User Profile Persistence Round Trip', () => {
    it('should persist and retrieve user profile data correctly', async () => {
      // Arbitrary for fitness goals
      const fitnessGoalArb = fc.constantFrom(
        'lose weight' as const,
        'build muscle' as const,
        'maintain' as const,
        'performance' as const
      );

      // Arbitrary for user profile (without id, createdAt, updatedAt)
      const userProfileArb = fc.record({
        name: fc.string({ minLength: 1, maxLength: 100 }),
        age: fc.integer({ min: 13, max: 120 }),
        weight: fc.float({ min: 30, max: 300, noNaN: true }),
        height: fc.float({ min: 100, max: 250, noNaN: true }),
        fitnessGoal: fitnessGoalArb,
        macroTargets: fc.option(
          fc.record({
            calories: fc.integer({ min: 1000, max: 5000 }),
            protein: fc.integer({ min: 50, max: 300 }),
            carbohydrates: fc.integer({ min: 50, max: 500 }),
            fats: fc.integer({ min: 20, max: 200 }),
          }),
          { nil: undefined }
        ),
      });

      await fc.assert(
        fc.asyncProperty(userProfileArb, async (profileData) => {
          // Create profile
          const created = await createUserProfile(profileData);

          // Verify created profile has required fields
          expect(created.id).toBe('singleton');
          expect(created.createdAt).toBeDefined();
          expect(created.updatedAt).toBeDefined();

          // Retrieve profile
          const retrieved = await getUserProfile();

          // Verify round trip
          expect(retrieved).not.toBeNull();
          expect(retrieved?.name).toBe(profileData.name);
          expect(retrieved?.age).toBe(profileData.age);
          expect(retrieved?.weight).toBe(profileData.weight);
          expect(retrieved?.height).toBe(profileData.height);
          expect(retrieved?.fitnessGoal).toBe(profileData.fitnessGoal);
          
          if (profileData.macroTargets) {
            expect(retrieved?.macroTargets).toEqual(profileData.macroTargets);
          } else {
            expect(retrieved?.macroTargets).toBeUndefined();
          }

          // Clean up for next iteration
          await deleteDB();
        }),
        { numRuns: 100 }
      );
    });

    it('should update user profile and persist changes', async () => {
      const fitnessGoalArb = fc.constantFrom(
        'lose weight' as const,
        'build muscle' as const,
        'maintain' as const,
        'performance' as const
      );

      const userProfileArb = fc.record({
        name: fc.string({ minLength: 1, maxLength: 100 }),
        age: fc.integer({ min: 13, max: 120 }),
        weight: fc.float({ min: 30, max: 300, noNaN: true }),
        height: fc.float({ min: 100, max: 250, noNaN: true }),
        fitnessGoal: fitnessGoalArb,
      });

      const updateArb = fc.record({
        weight: fc.float({ min: 30, max: 300, noNaN: true }),
        fitnessGoal: fitnessGoalArb,
      });

      await fc.assert(
        fc.asyncProperty(userProfileArb, updateArb, async (profileData, updates) => {
          // Create initial profile
          await createUserProfile(profileData);

          // Update profile
          const updated = await updateUserProfile(updates);

          // Verify updates applied
          expect(updated.weight).toBe(updates.weight);
          expect(updated.fitnessGoal).toBe(updates.fitnessGoal);
          expect(updated.name).toBe(profileData.name); // Unchanged field

          // Verify persistence
          const retrieved = await getUserProfile();
          expect(retrieved?.weight).toBe(updates.weight);
          expect(retrieved?.fitnessGoal).toBe(updates.fitnessGoal);

          // Clean up for next iteration
          await deleteDB();
        }),
        { numRuns: 100 }
      );
    });
  });
});
