/**
 * Unit tests for Chat Context Builder
 * 
 * Tests:
 * - System prompt construction with complete context
 * - System prompt with empty arrays
 * - System prompt with null values in nutrition
 * - Proper formatting of workout data
 * - Proper formatting of nutrition data
 * - Proper formatting of supplement data
 * 
 * Requirements:
 * - 15.3: Build system prompt with chat context
 * - 16.1: Include user profile in context
 * - 16.2: Include recent workouts (last 7 days)
 * - 16.3: Include today's nutrition and active supplements
 */

import { buildSystemPrompt, ChatContext } from '../chatContext';

describe('buildSystemPrompt', () => {
  it('should build system prompt with complete user context', () => {
    const context: ChatContext = {
      userProfile: {
        name: 'John Doe',
        age: 30,
        weight: 75,
        height: 180,
        fitnessGoal: 'build muscle',
      },
      recentWorkouts: [
        {
          timestamp: '2025-01-15T10:00:00Z',
          exerciseType: 'Push-ups',
          reps: 20,
          sets: 3,
        },
        {
          timestamp: '2025-01-14T09:00:00Z',
          exerciseType: 'Squats',
          reps: 15,
          sets: 4,
        },
      ],
      todayNutrition: {
        entries: [
          {
            foodName: 'Chicken Breast',
            macros: {
              calories: 165,
              protein: 31,
              carbohydrates: 0,
              fats: 3.6,
              sugar: 0,
              sodium: 74,
            },
          },
          {
            foodName: 'Brown Rice',
            macros: {
              calories: 216,
              protein: 5,
              carbohydrates: 45,
              fats: 1.8,
              sugar: 0,
              sodium: 10,
            },
          },
        ],
        dailyTotals: {
          calories: 381,
          protein: 36,
          carbohydrates: 45,
          fats: 5.4,
          sugar: 0,
          sodium: 84,
        },
      },
      activeSupplements: [
        {
          name: 'Whey Protein',
          dosage: '30g',
          frequency: 'daily',
        },
        {
          name: 'Creatine',
          dosage: '5g',
          frequency: 'daily',
        },
      ],
    };

    const prompt = buildSystemPrompt(context);

    // Check user profile section
    expect(prompt).toContain('USER PROFILE:');
    expect(prompt).toContain('Name: John Doe');
    expect(prompt).toContain('Age: 30');
    expect(prompt).toContain('Weight: 75 kg');
    expect(prompt).toContain('Height: 180 cm');
    expect(prompt).toContain('Fitness Goal: build muscle');

    // Check recent workouts section
    expect(prompt).toContain('RECENT WORKOUTS (Last 7 days):');
    expect(prompt).toContain('Push-ups');
    expect(prompt).toContain('20 reps');
    expect(prompt).toContain('3 sets');
    expect(prompt).toContain('Squats');
    expect(prompt).toContain('15 reps');
    expect(prompt).toContain('4 sets');

    // Check today's nutrition section
    expect(prompt).toContain("TODAY'S NUTRITION:");
    expect(prompt).toContain('Chicken Breast: 165 cal, 31g protein');
    expect(prompt).toContain('Brown Rice: 216 cal, 5g protein');
    expect(prompt).toContain('Daily Totals: 381 cal, 36g protein, 45g carbs, 5.4g fats');

    // Check active supplements section
    expect(prompt).toContain('ACTIVE SUPPLEMENTS:');
    expect(prompt).toContain('Whey Protein (30g, daily)');
    expect(prompt).toContain('Creatine (5g, daily)');

    // Check coaching instructions
    expect(prompt).toContain('AI fitness coach');
    expect(prompt).toContain('personalized, actionable advice');
    expect(prompt).toContain('not a medical professional');
  });

  it('should handle empty workout history', () => {
    const context: ChatContext = {
      userProfile: {
        name: 'Jane Smith',
        age: 25,
        weight: 60,
        height: 165,
        fitnessGoal: 'lose weight',
      },
      recentWorkouts: [],
      todayNutrition: {
        entries: [],
        dailyTotals: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fats: 0,
          sugar: 0,
          sodium: 0,
        },
      },
      activeSupplements: [],
    };

    const prompt = buildSystemPrompt(context);

    expect(prompt).toContain('RECENT WORKOUTS: No workouts logged in the last 7 days.');
    expect(prompt).toContain("TODAY'S NUTRITION: No nutrition logged today.");
    expect(prompt).toContain('ACTIVE SUPPLEMENTS: None currently active.');
  });

  it('should handle null values in nutrition macros', () => {
    const context: ChatContext = {
      userProfile: {
        name: 'Bob',
        age: 35,
        weight: 80,
        height: 175,
        fitnessGoal: 'maintain',
      },
      recentWorkouts: [],
      todayNutrition: {
        entries: [
          {
            foodName: 'Protein Bar',
            macros: {
              calories: 200,
              protein: 15,
              carbohydrates: null,
              fats: null,
              sugar: null,
              sodium: null,
            },
          },
        ],
        dailyTotals: {
          calories: 200,
          protein: 15,
          carbohydrates: null,
          fats: null,
          sugar: null,
          sodium: null,
        },
      },
      activeSupplements: [],
    };

    const prompt = buildSystemPrompt(context);

    expect(prompt).toContain('Protein Bar: 200 cal, 15g protein');
    expect(prompt).toContain('Daily Totals: 200 cal, 15g protein, 0g carbs, 0g fats');
  });

  it('should format workouts with only reps (no sets)', () => {
    const context: ChatContext = {
      userProfile: {
        name: 'Alice',
        age: 28,
        weight: 65,
        height: 170,
        fitnessGoal: 'performance',
      },
      recentWorkouts: [
        {
          timestamp: '2025-01-15T10:00:00Z',
          exerciseType: 'Running',
          reps: null,
          sets: null,
        },
      ],
      todayNutrition: {
        entries: [],
        dailyTotals: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fats: 0,
          sugar: 0,
          sodium: 0,
        },
      },
      activeSupplements: [],
    };

    const prompt = buildSystemPrompt(context);

    expect(prompt).toContain('Running');
    expect(prompt).not.toContain('reps');
    expect(prompt).not.toContain('sets');
  });

  it('should format workouts with only sets (no reps)', () => {
    const context: ChatContext = {
      userProfile: {
        name: 'Charlie',
        age: 32,
        weight: 85,
        height: 185,
        fitnessGoal: 'build muscle',
      },
      recentWorkouts: [
        {
          timestamp: '2025-01-15T10:00:00Z',
          exerciseType: 'Plank',
          reps: null,
          sets: 3,
        },
      ],
      todayNutrition: {
        entries: [],
        dailyTotals: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fats: 0,
          sugar: 0,
          sodium: 0,
        },
      },
      activeSupplements: [],
    };

    const prompt = buildSystemPrompt(context);

    expect(prompt).toContain('Plank (3 sets)');
    expect(prompt).not.toContain('reps');
  });

  it('should include all fitness goal types', () => {
    const goals: Array<'lose weight' | 'build muscle' | 'maintain' | 'performance'> = [
      'lose weight',
      'build muscle',
      'maintain',
      'performance',
    ];

    goals.forEach((goal) => {
      const context: ChatContext = {
        userProfile: {
          name: 'Test User',
          age: 30,
          weight: 70,
          height: 175,
          fitnessGoal: goal,
        },
        recentWorkouts: [],
        todayNutrition: {
          entries: [],
          dailyTotals: {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fats: 0,
            sugar: 0,
            sodium: 0,
          },
        },
        activeSupplements: [],
      };

      const prompt = buildSystemPrompt(context);
      expect(prompt).toContain(`Fitness Goal: ${goal}`);
    });
  });

  it('should handle multiple nutrition entries correctly', () => {
    const context: ChatContext = {
      userProfile: {
        name: 'David',
        age: 40,
        weight: 90,
        height: 180,
        fitnessGoal: 'lose weight',
      },
      recentWorkouts: [],
      todayNutrition: {
        entries: [
          {
            foodName: 'Oatmeal',
            macros: {
              calories: 150,
              protein: 5,
              carbohydrates: 27,
              fats: 3,
              sugar: 1,
              sodium: 0,
            },
          },
          {
            foodName: 'Banana',
            macros: {
              calories: 105,
              protein: 1,
              carbohydrates: 27,
              fats: 0,
              sugar: 14,
              sodium: 1,
            },
          },
          {
            foodName: 'Almonds',
            macros: {
              calories: 164,
              protein: 6,
              carbohydrates: 6,
              fats: 14,
              sugar: 1,
              sodium: 0,
            },
          },
        ],
        dailyTotals: {
          calories: 419,
          protein: 12,
          carbohydrates: 60,
          fats: 17,
          sugar: 16,
          sodium: 1,
        },
      },
      activeSupplements: [],
    };

    const prompt = buildSystemPrompt(context);

    expect(prompt).toContain('Oatmeal: 150 cal, 5g protein');
    expect(prompt).toContain('Banana: 105 cal, 1g protein');
    expect(prompt).toContain('Almonds: 164 cal, 6g protein');
    expect(prompt).toContain('Daily Totals: 419 cal, 12g protein, 60g carbs, 17g fats');
  });
});
