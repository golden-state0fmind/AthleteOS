import React from 'react';
import { Card } from '../ui/Card';

export interface DailyMetricsProps {
  caloriesConsumed: number;
  caloriesTarget?: number;
  workoutCount: number;
  supplementsTaken: number;
  supplementsScheduled: number;
}

export const DailyMetrics: React.FC<DailyMetricsProps> = ({
  caloriesConsumed,
  caloriesTarget,
  workoutCount,
  supplementsTaken,
  supplementsScheduled,
}) => {
  const supplementPercentage = supplementsScheduled > 0 
    ? Math.round((supplementsTaken / supplementsScheduled) * 100) 
    : 0;

  return (
    <Card padding="md">
      <h2 className="text-lg font-semibold text-white mb-4">Today's Metrics</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Calories */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Calories</p>
            <p className="text-2xl font-bold text-white">
              {caloriesConsumed.toFixed(0)}
              {caloriesTarget && (
                <span className="text-base text-white/60 ml-1">
                  / {caloriesTarget}
                </span>
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-xl">🔥</span>
          </div>
        </div>

        {/* Workouts */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Workouts</p>
            <p className="text-2xl font-bold text-white">{workoutCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-xl">💪</span>
          </div>
        </div>

        {/* Supplements */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Supplements</p>
            <p className="text-2xl font-bold text-white">
              {supplementsTaken} / {supplementsScheduled}
              <span className="text-base text-white/60 ml-2">
                ({supplementPercentage}%)
              </span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-xl">💊</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
