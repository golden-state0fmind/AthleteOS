/**
 * Unit tests for workoutService
 * 
 * Tests CRUD operations and streak calculation for workout data.
 */

import { deleteDB, getDB } from '../db';
import {
  addWorkout,
  getWorkouts,
  getWorkoutsByDateRange,
  calculateWorkoutStreak,
} from '../services/workoutService';
import type { WorkoutEntry } from '../types/db';

describe('workoutService', () => {
  beforeEach(async () => {
    // Clean database before each test
    await deleteDB();
  });

  afterEach(async () => {
    // Clean up after each test
    const db = await getDB();
    db.close();
    await deleteDB();
  });

  describe('addWorkout', () => {
    it('should add a workout with generated id and createdAt', async () => {
      const workoutData: Omit<WorkoutEntry, 'id' | 'createdAt'> = {
        timestamp: new Date().toISOString(),
        source: 'manual',
        exerciseType: 'Push-ups',
        estimatedReps: 20,
        sets: 3,
        duration: 10,
        formFeedback: null,
        notes: 'Good form',
      };

      const result = await addWorkout(workoutData);

      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.exerciseType).toBe('Push-ups');
      expect(result.estimatedReps).toBe(20);
      expect(result.sets).toBe(3);
    });

    it('should add a workout from image analysis', async () => {
      const workoutData: Omit<WorkoutEntry, 'id' | 'createdAt'> = {
        timestamp: new Date().toISOString(),
        source: 'image',
        exerciseType: 'Squats',
        estimatedReps: 15,
        sets: null,
        duration: null,
        formFeedback: 'Keep your back straight',
        notes: null,
      };

      const result = await addWorkout(workoutData);

      expect(result.source).toBe('image');
      expect(result.formFeedback).toBe('Keep your back straight');
    });
  });

  describe('getWorkouts', () => {
    it('should return empty array when no workouts exist', async () => {
      const workouts = await getWorkouts();
      expect(workouts).toEqual([]);
    });

    it('should return workouts sorted by most recent first', async () => {
      const now = new Date();
      
      // Add workouts with different timestamps
      const workout1 = await addWorkout({
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        source: 'manual',
        exerciseType: 'Push-ups',
        estimatedReps: 20,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const workout2 = await addWorkout({
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        source: 'manual',
        exerciseType: 'Squats',
        estimatedReps: 15,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const workout3 = await addWorkout({
        timestamp: now.toISOString(), // Now
        source: 'manual',
        exerciseType: 'Lunges',
        estimatedReps: 10,
        sets: 2,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const workouts = await getWorkouts();

      expect(workouts).toHaveLength(3);
      expect(workouts[0].id).toBe(workout3.id); // Most recent
      expect(workouts[1].id).toBe(workout2.id);
      expect(workouts[2].id).toBe(workout1.id); // Oldest
    });

    it('should respect limit parameter', async () => {
      // Add 5 workouts
      for (let i = 0; i < 5; i++) {
        await addWorkout({
          timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
          source: 'manual',
          exerciseType: `Exercise ${i}`,
          estimatedReps: 10,
          sets: 3,
          duration: null,
          formFeedback: null,
          notes: null,
        });
      }

      const workouts = await getWorkouts(3);
      expect(workouts).toHaveLength(3);
    });
  });

  describe('getWorkoutsByDateRange', () => {
    it('should return workouts within date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      // Add workouts at different times
      await addWorkout({
        timestamp: threeDaysAgo.toISOString(),
        source: 'manual',
        exerciseType: 'Old workout',
        estimatedReps: 10,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const workout2 = await addWorkout({
        timestamp: twoDaysAgo.toISOString(),
        source: 'manual',
        exerciseType: 'In range 1',
        estimatedReps: 15,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const workout3 = await addWorkout({
        timestamp: yesterday.toISOString(),
        source: 'manual',
        exerciseType: 'In range 2',
        estimatedReps: 20,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      await addWorkout({
        timestamp: now.toISOString(),
        source: 'manual',
        exerciseType: 'Too recent',
        estimatedReps: 25,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      // Query for workouts from 3 days ago to yesterday
      const workouts = await getWorkoutsByDateRange(
        twoDaysAgo.toISOString(),
        yesterday.toISOString()
      );

      expect(workouts).toHaveLength(2);
      expect(workouts[0].id).toBe(workout3.id);
      expect(workouts[1].id).toBe(workout2.id);
    });

    it('should return empty array when no workouts in range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      await addWorkout({
        timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'manual',
        exerciseType: 'Old workout',
        estimatedReps: 10,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const workouts = await getWorkoutsByDateRange(
        yesterday.toISOString(),
        now.toISOString()
      );

      expect(workouts).toEqual([]);
    });
  });

  describe('calculateWorkoutStreak', () => {
    it('should return 0 for both streaks when no workouts exist', async () => {
      const streaks = await calculateWorkoutStreak();
      expect(streaks.current).toBe(0);
      expect(streaks.longest).toBe(0);
    });

    it('should return 1 for current and longest streak for a single workout today', async () => {
      await addWorkout({
        timestamp: new Date().toISOString(),
        source: 'manual',
        exerciseType: 'Push-ups',
        estimatedReps: 20,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const streaks = await calculateWorkoutStreak();
      expect(streaks.current).toBe(1);
      expect(streaks.longest).toBe(1);
    });

    it('should calculate current and longest streaks for consecutive days', async () => {
      const now = new Date();
      
      // Add workouts for today, yesterday, and day before
      for (let i = 0; i < 3; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        await addWorkout({
          timestamp: date.toISOString(),
          source: 'manual',
          exerciseType: `Exercise ${i}`,
          estimatedReps: 10,
          sets: 3,
          duration: null,
          formFeedback: null,
          notes: null,
        });
      }

      const streaks = await calculateWorkoutStreak();
      expect(streaks.current).toBe(3);
      expect(streaks.longest).toBe(3);
    });

    it('should return 0 for current streak if most recent workout is more than 1 day old', async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      await addWorkout({
        timestamp: twoDaysAgo.toISOString(),
        source: 'manual',
        exerciseType: 'Old workout',
        estimatedReps: 10,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const streaks = await calculateWorkoutStreak();
      expect(streaks.current).toBe(0);
      expect(streaks.longest).toBe(1);
    });

    it('should stop counting current streak when broken but track longest streak', async () => {
      const now = new Date();
      
      // Add workouts for today and yesterday
      await addWorkout({
        timestamp: now.toISOString(),
        source: 'manual',
        exerciseType: 'Today',
        estimatedReps: 10,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      await addWorkout({
        timestamp: yesterday.toISOString(),
        source: 'manual',
        exerciseType: 'Yesterday',
        estimatedReps: 10,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      // Skip day before yesterday (break in streak)
      
      // Add workout 3 days ago
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      await addWorkout({
        timestamp: threeDaysAgo.toISOString(),
        source: 'manual',
        exerciseType: '3 days ago',
        estimatedReps: 10,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const streaks = await calculateWorkoutStreak();
      expect(streaks.current).toBe(2); // Only today and yesterday count
      expect(streaks.longest).toBe(2); // Longest is also 2
    });

    it('should count multiple workouts on same day as one day', async () => {
      const now = new Date();
      
      // Add 3 workouts today
      for (let i = 0; i < 3; i++) {
        await addWorkout({
          timestamp: new Date(now.getTime() + i * 60 * 60 * 1000).toISOString(),
          source: 'manual',
          exerciseType: `Workout ${i}`,
          estimatedReps: 10,
          sets: 3,
          duration: null,
          formFeedback: null,
          notes: null,
        });
      }

      const streaks = await calculateWorkoutStreak();
      expect(streaks.current).toBe(1); // All 3 workouts count as 1 day
      expect(streaks.longest).toBe(1);
    });

    it('should track longest streak even when current streak is broken', async () => {
      const now = new Date();
      
      // Create a 5-day streak starting 10 days ago
      for (let i = 10; i >= 6; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        await addWorkout({
          timestamp: date.toISOString(),
          source: 'manual',
          exerciseType: `Old Exercise ${i}`,
          estimatedReps: 10,
          sets: 3,
          duration: null,
          formFeedback: null,
          notes: null,
        });
      }

      // Add a 2-day current streak
      await addWorkout({
        timestamp: now.toISOString(),
        source: 'manual',
        exerciseType: 'Today',
        estimatedReps: 10,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      await addWorkout({
        timestamp: yesterday.toISOString(),
        source: 'manual',
        exerciseType: 'Yesterday',
        estimatedReps: 10,
        sets: 3,
        duration: null,
        formFeedback: null,
        notes: null,
      });

      const streaks = await calculateWorkoutStreak();
      expect(streaks.current).toBe(2);
      expect(streaks.longest).toBe(5); // The old 5-day streak is the longest
    });
  });
});
