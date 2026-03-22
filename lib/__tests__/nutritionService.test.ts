/**
 * Unit tests for nutritionService
 * 
 * Tests basic CRUD operations and goal conflict checking.
 */

import { deleteDB } from '../db';
import {
  addNutritionEntry,
  getNutritionByDate,
  getDailyTotals,
  updateEntryStatus,
  checkGoalConflicts,
} from '../services/nutritionService';
import type { NutritionEntry, MacroData, UserProfile } from '../types/db';

describe('nutritionService', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await deleteDB();
  });

  afterEach(async () => {
    // Clean up database after each test
    await deleteDB();
  });

  describe('addNutritionEntry', () => {
    it('should add a nutrition entry with generated id and createdAt', async () => {
      const entry: Omit<NutritionEntry, 'id' | 'createdAt'> = {
        timestamp: '2024-01-15T12:00:00.000Z',
        date: '2024-01-15',
        status: 'planned',
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
      };

      const result = await addNutritionEntry(entry);

      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.foodName).toBe('Chicken Breast');
      expect(result.status).toBe('planned');
      expect(result.macros.calories).toBe(165);
    });
  });

  describe('getNutritionByDate', () => {
    it('should retrieve nutrition entries for a specific date', async () => {
      const date = '2024-01-15';
      
      await addNutritionEntry({
        timestamp: '2024-01-15T08:00:00.000Z',
        date,
        status: 'consumed',
        foodName: 'Oatmeal',
        servingSize: '1 cup',
        macros: { calories: 150, protein: 5, carbohydrates: 27, fats: 3, sugar: 1, sodium: 0 },
        warnings: [],
      });

      await addNutritionEntry({
        timestamp: '2024-01-15T12:00:00.000Z',
        date,
        status: 'planned',
        foodName: 'Chicken Salad',
        servingSize: '1 bowl',
        macros: { calories: 300, protein: 25, carbohydrates: 15, fats: 12, sugar: 3, sodium: 450 },
        warnings: [],
      });

      const entries = await getNutritionByDate(date);

      expect(entries).toHaveLength(2);
      expect(entries.map(e => e.foodName)).toContain('Oatmeal');
      expect(entries.map(e => e.foodName)).toContain('Chicken Salad');
    });

    it('should return empty array for date with no entries', async () => {
      const entries = await getNutritionByDate('2024-01-20');
      expect(entries).toHaveLength(0);
    });
  });

  describe('getDailyTotals', () => {
    it('should calculate daily totals for all macros', async () => {
      const date = '2024-01-15';
      
      await addNutritionEntry({
        timestamp: '2024-01-15T08:00:00.000Z',
        date,
        status: 'consumed',
        foodName: 'Breakfast',
        servingSize: null,
        macros: { calories: 400, protein: 20, carbohydrates: 50, fats: 10, sugar: 5, sodium: 200 },
        warnings: [],
      });

      await addNutritionEntry({
        timestamp: '2024-01-15T12:00:00.000Z',
        date,
        status: 'planned',
        foodName: 'Lunch',
        servingSize: null,
        macros: { calories: 600, protein: 30, carbohydrates: 60, fats: 20, sugar: 10, sodium: 400 },
        warnings: [],
      });

      const totals = await getDailyTotals(date);

      expect(totals.calories).toBe(1000);
      expect(totals.protein).toBe(50);
      expect(totals.carbohydrates).toBe(110);
      expect(totals.fats).toBe(30);
      expect(totals.sugar).toBe(15);
      expect(totals.sodium).toBe(600);
    });

    it('should handle null values in macros', async () => {
      const date = '2024-01-15';
      
      await addNutritionEntry({
        timestamp: '2024-01-15T08:00:00.000Z',
        date,
        status: 'consumed',
        foodName: 'Unknown Food',
        servingSize: null,
        macros: { calories: 200, protein: null, carbohydrates: null, fats: 5, sugar: null, sodium: null },
        warnings: [],
      });

      const totals = await getDailyTotals(date);

      expect(totals.calories).toBe(200);
      expect(totals.protein).toBe(0);
      expect(totals.carbohydrates).toBe(0);
      expect(totals.fats).toBe(5);
      expect(totals.sugar).toBe(0);
      expect(totals.sodium).toBe(0);
    });

    it('should include both planned and consumed entries in totals', async () => {
      const date = '2024-01-15';
      
      await addNutritionEntry({
        timestamp: '2024-01-15T08:00:00.000Z',
        date,
        status: 'consumed',
        foodName: 'Consumed Meal',
        servingSize: null,
        macros: { calories: 300, protein: 15, carbohydrates: 30, fats: 10, sugar: 5, sodium: 200 },
        warnings: [],
      });

      await addNutritionEntry({
        timestamp: '2024-01-15T18:00:00.000Z',
        date,
        status: 'planned',
        foodName: 'Planned Meal',
        servingSize: null,
        macros: { calories: 400, protein: 20, carbohydrates: 40, fats: 15, sugar: 8, sodium: 300 },
        warnings: [],
      });

      const totals = await getDailyTotals(date);

      expect(totals.calories).toBe(700);
      expect(totals.protein).toBe(35);
    });
  });

  describe('updateEntryStatus', () => {
    it('should update entry status from planned to consumed', async () => {
      const entry = await addNutritionEntry({
        timestamp: '2024-01-15T12:00:00.000Z',
        date: '2024-01-15',
        status: 'planned',
        foodName: 'Lunch',
        servingSize: null,
        macros: { calories: 500, protein: 25, carbohydrates: 50, fats: 15, sugar: 5, sodium: 300 },
        warnings: [],
      });

      await updateEntryStatus(entry.id, 'consumed');

      const entries = await getNutritionByDate('2024-01-15');
      const updatedEntry = entries.find(e => e.id === entry.id);

      expect(updatedEntry?.status).toBe('consumed');
    });

    it('should throw error for non-existent entry', async () => {
      await expect(updateEntryStatus('non-existent-id', 'consumed')).rejects.toThrow();
    });
  });

  describe('checkGoalConflicts', () => {
    const mockUserProfile: UserProfile = {
      id: 'singleton',
      name: 'Test User',
      age: 30,
      weight: 70,
      height: 175,
      fitnessGoal: 'lose weight',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    it('should warn for high calorie food when goal is lose weight', async () => {
      const macros: MacroData = {
        calories: 600,
        protein: 20,
        carbohydrates: 50,
        fats: 30,
        sugar: 10,
        sodium: 400,
      };

      const warnings = await checkGoalConflicts(macros, mockUserProfile);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].type).toBe('goal_conflict');
      expect(warnings[0].message).toContain('500 calories');
    });

    it('should inform for low protein food when goal is build muscle', async () => {
      const muscleProfile: UserProfile = { ...mockUserProfile, fitnessGoal: 'build muscle' };
      const macros: MacroData = {
        calories: 200,
        protein: 5,
        carbohydrates: 40,
        fats: 5,
        sugar: 10,
        sodium: 200,
      };

      const warnings = await checkGoalConflicts(macros, muscleProfile);

      expect(warnings).toHaveLength(1);
      expect(warnings[0].type).toBe('goal_conflict');
      expect(warnings[0].message).toContain('10g protein');
    });

    it('should warn for high sodium regardless of goal', async () => {
      const macros: MacroData = {
        calories: 300,
        protein: 15,
        carbohydrates: 30,
        fats: 10,
        sugar: 5,
        sodium: 1500,
      };

      const warnings = await checkGoalConflicts(macros, mockUserProfile);

      expect(warnings.some(w => w.type === 'high_sodium')).toBe(true);
      expect(warnings.find(w => w.type === 'high_sodium')?.message).toContain('1000mg sodium');
    });

    it('should return multiple warnings when applicable', async () => {
      const macros: MacroData = {
        calories: 700,
        protein: 10,
        carbohydrates: 80,
        fats: 30,
        sugar: 20,
        sodium: 1200,
      };

      const warnings = await checkGoalConflicts(macros, mockUserProfile);

      expect(warnings.length).toBeGreaterThan(1);
      expect(warnings.some(w => w.type === 'goal_conflict')).toBe(true);
      expect(warnings.some(w => w.type === 'high_sodium')).toBe(true);
    });

    it('should return no warnings for healthy food matching goals', async () => {
      const macros: MacroData = {
        calories: 300,
        protein: 25,
        carbohydrates: 30,
        fats: 8,
        sugar: 3,
        sodium: 200,
      };

      const warnings = await checkGoalConflicts(macros, mockUserProfile);

      expect(warnings).toHaveLength(0);
    });

    it('should handle null user profile gracefully', async () => {
      const macros: MacroData = {
        calories: 600,
        protein: 5,
        carbohydrates: 50,
        fats: 20,
        sugar: 10,
        sodium: 1200,
      };

      const warnings = await checkGoalConflicts(macros, null);

      // Should only have high sodium warning, no goal-specific warnings
      expect(warnings).toHaveLength(1);
      expect(warnings[0].type).toBe('high_sodium');
    });
  });
});
