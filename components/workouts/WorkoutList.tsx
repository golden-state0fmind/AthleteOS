import React from 'react';
import { WorkoutCard } from './WorkoutCard';
import type { WorkoutEntry } from '@/lib/types/db';

export interface WorkoutListProps {
  workouts: WorkoutEntry[];
  onWorkoutClick?: (workout: WorkoutEntry) => void;
  emptyMessage?: string;
}

export const WorkoutList: React.FC<WorkoutListProps> = ({
  workouts,
  onWorkoutClick,
  emptyMessage = 'No workouts logged yet. Start your fitness journey today!',
}) => {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60 text-lg mb-2">💪</p>
        <p className="text-white/60">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          onClick={onWorkoutClick ? () => onWorkoutClick(workout) : undefined}
        />
      ))}
    </div>
  );
};
