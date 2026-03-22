import React from 'react';
import { Card } from '../ui/Card';

export interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  longestStreak,
}) => {
  return (
    <Card padding="md" className="bg-gradient-to-br from-accent/20 to-accent/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60 mb-1">Current Streak</p>
          <p className="text-4xl font-bold text-accent">
            {currentStreak}
            <span className="text-lg text-white/60 ml-2">days</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-white/60 mb-1">Longest Streak</p>
          <p className="text-2xl font-bold text-white">
            {longestStreak}
            <span className="text-sm text-white/60 ml-1">days</span>
          </p>
        </div>
      </div>

      {currentStreak > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-white/80">
            {currentStreak === 1 
              ? "Great start! Keep it going 🔥" 
              : currentStreak >= longestStreak
              ? "New record! You're on fire! 🔥🔥🔥"
              : "Keep pushing! You're doing great! 💪"}
          </p>
        </div>
      )}

      {currentStreak === 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-white/60">
            Start your streak today! 💪
          </p>
        </div>
      )}
    </Card>
  );
};
