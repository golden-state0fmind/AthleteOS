import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export interface CalorieBudgetCardProps {
  caloriesConsumed: number;
  caloriesBurned: number;
  caloriesTarget: number;
  fitnessGoal?: 'lose weight' | 'build muscle' | 'maintain' | 'performance';
}

export const CalorieBudgetCard: React.FC<CalorieBudgetCardProps> = ({
  caloriesConsumed,
  caloriesBurned,
  caloriesTarget,
  fitnessGoal = 'maintain',
}) => {
  const router = useRouter();
  // Net calories = consumed - burned
  const netCalories = caloriesConsumed - caloriesBurned;
  
  // Remaining budget
  const remainingBudget = caloriesTarget - netCalories;
  
  // Calculate percentage for progress bar
  const percentage = Math.min((netCalories / caloriesTarget) * 100, 100);
  
  // Determine status based on fitness goal
  const getStatus = () => {
    if (fitnessGoal === 'lose weight') {
      // For weight loss, being under target is good (deficit)
      if (remainingBudget > 0) {
        return { color: 'success' as const, label: 'Deficit', emoji: '✅' };
      } else {
        return { color: 'danger' as const, label: 'Surplus', emoji: '⚠️' };
      }
    } else if (fitnessGoal === 'build muscle') {
      // For muscle building, meeting target is important
      if (Math.abs(remainingBudget) < 100) {
        return { color: 'success' as const, label: 'On Track', emoji: '💪' };
      } else if (remainingBudget > 0) {
        return { color: 'warning' as const, label: 'Under Target', emoji: '📊' };
      } else {
        return { color: 'success' as const, label: 'Surplus', emoji: '✅' };
      }
    } else {
      // For maintain/performance, staying close to target is good
      if (Math.abs(remainingBudget) < 200) {
        return { color: 'success' as const, label: 'Balanced', emoji: '⚖️' };
      } else {
        return { color: 'warning' as const, label: 'Off Target', emoji: '📊' };
      }
    }
  };

  const status = getStatus();

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">Calorie Budget</h2>
        <span className="text-2xl">{status.emoji}</span>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-white/60 mb-1">Consumed</p>
          <p className="text-xl font-bold text-white">{caloriesConsumed.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/60 mb-1">Burned</p>
          <p className="text-xl font-bold text-accent">{caloriesBurned.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/60 mb-1">Net</p>
          <p className="text-xl font-bold text-white">{netCalories.toFixed(0)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <ProgressBar 
          progress={percentage} 
          variant={status.color}
          showLabel={false}
        />
      </div>

      {/* Budget status */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">
            {remainingBudget > 0 ? 'Remaining' : 'Over'} Budget
          </p>
          <p className={`text-2xl font-bold ${
            status.color === 'success' ? 'text-green-400' : 
            status.color === 'danger' ? 'text-red-400' : 
            'text-yellow-400'
          }`}>
            {Math.abs(remainingBudget).toFixed(0)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-white/60">Target</p>
          <p className="text-2xl font-bold text-white">{caloriesTarget.toFixed(0)}</p>
        </div>
      </div>

      {/* Status label */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${
            status.color === 'success' ? 'text-green-400' : 
            status.color === 'danger' ? 'text-red-400' : 
            'text-yellow-400'
          }`}>
            {status.label}
          </p>
          <button
            onClick={() => router.push('/settings')}
            className="text-xs text-white/50 hover:text-accent transition-colors"
          >
            Adjust targets
          </button>
        </div>
      </div>
    </Card>
  );
};
