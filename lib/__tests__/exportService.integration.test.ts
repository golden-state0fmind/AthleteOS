/**
 * Export Service Integration Tests
 * 
 * End-to-end tests for data export and import functionality.
 * Requirements: 24.4, 30.2, 30.4, 30.5
 */

import { exportUserData, importUserData } from '../services/exportService';
import { createUserProfile, getUserProfile } from '../services/userProfileService';
import { addWorkout } from '../services/workoutService';
import { addNutritionEntry } from '../services/nutritionService';
import { addSupplement } from '../services/supplementService';
import { deleteDB } from '../db';
import type { UserProfile, WorkoutEntry, NutritionEntry, SupplementEntry } from '../types/db';

describe('Export Service Integration', () => {
  beforeEach(async () => {
    await deleteDB();
  });

  afterEach(async () => {
    await deleteDB();
  });

  it('should export and import complete user data', async () => {
    // Create user profile
    const profile = await createUserProfile({
      name: 'Integration Test User',
      age: 30,
      weight: 75,
      height: 180,
      fitnessGoal: 'build muscle',
      macroTargets: {
        calories: 2800,
        protein: 180,
        carbohydrates: 350,
        fats: 90,
      },
    });

    // Add workout
    const workout = await addWorkout({
      timestamp: new Date().toISOString(),
      source: 'manual',
      exerciseType: 'Bench Press',
      estimatedReps: 10,
      sets: 3,
      duration: null,
      formFeedback: null,
      notes: 'Good session',
    });

    // Add nutrition entry
    const nutrition = await addNutritionEntry({
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      status: 'consumed',
      foodName: 'Chicken Breast',
      servingSize: '200g',
      macros: {
        calories: 330,
        protein: 62,
        carbohydrates: 0,
        fats: 7.2,
        sugar: 0,
        sodium: 148,
      },
      warnings: [],
    });

    // Add supplement
    const supplement = await addSupplement({
      name: 'Creatine Monohydrate',
      dosage: '5g',
      frequency: 'daily',
      timing: 'post-workout',
      safetyNotes: 'Generally safe for healthy adults',
      effectiveness: 'Effective for strength and muscle gains',
      active: true,
    });

    // Export all data
    const exportData = await exportUserData();

    // Verify export structure
    expect(exportData.version).toBe('1.0');
    expect(exportData.exportedAt).toBeDefined();
    expect(exportData.userProfile).toBeDefined();
    expect(exportData.workouts).toHaveLength(1);
    expect(exportData.nutrition).toHaveLength(1);
    expect(exportData.supplements).toHaveLength(1);

    // Clear database
    await deleteDB();

    // Verify database is empty
    const emptyProfile = await getUserProfile();
    expect(emptyProfile).toBeNull();

    // Import data
    await importUserData(exportData);

    // Verify all data was restored
    const restoredProfile = await getUserProfile();
    expect(restoredProfile).toEqual(profile);

    // Export again to verify all data
    const reExportData = await exportUserData();
    expect(reExportData.workouts).toHaveLength(1);
    expect(reExportData.workouts[0].exerciseType).toBe('Bench Press');
    expect(reExportData.nutrition).toHaveLength(1);
    expect(reExportData.nutrition[0].foodName).toBe('Chicken Breast');
    expect(reExportData.supplements).toHaveLength(1);
    expect(reExportData.supplements[0].name).toBe('Creatine Monohydrate');
  });

  it('should handle export with no user profile', async () => {
    // Add workout without user profile
    await addWorkout({
      timestamp: new Date().toISOString(),
      source: 'manual',
      exerciseType: 'Running',
      estimatedReps: null,
      sets: null,
      duration: 30,
      formFeedback: null,
      notes: null,
    });

    const exportData = await exportUserData();

    expect(exportData.version).toBe('1.0');
    expect(exportData.userProfile).toBeUndefined();
    expect(exportData.workouts).toHaveLength(1);
  });

  it('should validate export data format on import', async () => {
    const invalidData = {
      version: '2.0', // Unsupported version
      exportedAt: new Date().toISOString(),
    } as any;

    await expect(importUserData(invalidData)).rejects.toThrow('Invalid or unsupported export data version');
  });

  it('should preserve timestamps and IDs through export/import', async () => {
    const profile = await createUserProfile({
      name: 'Timestamp Test',
      age: 25,
      weight: 70,
      height: 175,
      fitnessGoal: 'lose weight',
    });

    const originalCreatedAt = profile.createdAt;
    const originalUpdatedAt = profile.updatedAt;

    // Export
    const exportData = await exportUserData();

    // Clear and import
    await deleteDB();
    await importUserData(exportData);

    // Verify timestamps preserved
    const restored = await getUserProfile();
    expect(restored?.createdAt).toBe(originalCreatedAt);
    expect(restored?.updatedAt).toBe(originalUpdatedAt);
  });
});
