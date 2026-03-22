import React from 'react';
import { Card } from '../ui/Card';
import type { WorkoutEntry } from '@/lib/types/db';

export interface WorkoutCardProps {
  workout: WorkoutEntry;
  onClick?: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onClick }) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sourceIcon = workout.source === 'image' ? '📸' : '✍️';

  return (
    <Card 
      padding="md" 
      hover={!!onClick}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{sourceIcon}</span>
            <h3 className="text-lg font-semibold text-white">
              {workout.exerciseType}
            </h3>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-white/60 mb-2">
            {workout.estimatedReps !== null && (
              <span>
                <span className="text-white/80">Reps:</span> {workout.estimatedReps}
              </span>
            )}
            {workout.sets !== null && (
              <span>
                <span className="text-white/80">Sets:</span> {workout.sets}
              </span>
            )}
            {workout.duration !== null && (
              <span>
                <span className="text-white/80">Duration:</span> {workout.duration} min
              </span>
            )}
            {workout.caloriesBurned !== null && (
              <span className="text-accent">
                <span className="text-white/80">🔥</span> {workout.caloriesBurned} cal
              </span>
            )}
          </div>

          {workout.formFeedback && (
            <p className="text-sm text-white/70 mb-2 line-clamp-2">
              {workout.formFeedback}
            </p>
          )}

          {workout.notes && (
            <p className="text-sm text-white/60 italic line-clamp-1">
              Note: {workout.notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-xs text-white/50">{formatDate(workout.timestamp)}</p>
      </div>
    </Card>
  );
};
