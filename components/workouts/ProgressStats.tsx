import React from 'react';
import { Card } from '../ui/Card';

export interface ProgressStatsProps {
  currentStreak: number;
  longestStreak: number;
  weeklyFrequency: number;
  mostFrequentExercise?: string;
  totalWorkouts: number;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  currentStreak,
  longestStreak,
  weeklyFrequency,
  mostFrequentExercise,
  totalWorkouts,
}) => {
  return (
    <Card padding="md">
      <h2 className="text-lg font-semibold text-white mb-4">Progress Stats</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-accent">{currentStreak}</p>
          <p className="text-xs text-white/50">days</p>
        </div>

        {/* Longest Streak */}
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Longest Streak</p>
          <p className="text-2xl font-bold text-white">{longestStreak}</p>
          <p className="text-xs text-white/50">days</p>
        </div>

        {/* Weekly Frequency */}
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">This Week</p>
          <p className="text-2xl font-bold text-white">{weeklyFrequency}</p>
          <p className="text-xs text-white/50">workouts</p>
        </div>

        {/* Total Workouts */}
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{totalWorkouts}</p>
          <p className="text-xs text-white/50">workouts</p>
        </div>
      </div>

      {mostFrequentExercise && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-white/60 mb-1">Most Frequent Exercise</p>
          <p className="text-lg font-semibold text-white">{mostFrequentExercise}</p>
        </div>
      )}
    </Card>
  );
};
