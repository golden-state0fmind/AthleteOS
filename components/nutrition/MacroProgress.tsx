import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import type { MacroData } from '@/lib/types/db';

export interface MacroProgressProps {
  current: MacroData;
  targets: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
  };
}

export const MacroProgress: React.FC<MacroProgressProps> = ({ current, targets }) => {
  const getVariant = (current: number, target: number): 'default' | 'warning' | 'danger' => {
    const percentage = (current / target) * 100;
    if (percentage > 120) return 'danger';
    if (percentage > 100) return 'warning';
    return 'default';
  };

  return (
    <Card padding="md">
      <h2 className="text-lg font-semibold text-white mb-4">Macro Progress</h2>

      <div className="space-y-4">
        {/* Calories */}
        <ProgressBar
          value={current.calories || 0}
          max={targets.calories}
          label="Calories"
          showValues
          showPercentage
          variant={getVariant(current.calories || 0, targets.calories)}
        />

        {/* Protein */}
        <ProgressBar
          value={current.protein || 0}
          max={targets.protein}
          label="Protein (g)"
          showValues
          showPercentage
          variant={getVariant(current.protein || 0, targets.protein)}
        />

        {/* Carbohydrates */}
        <ProgressBar
          value={current.carbohydrates || 0}
          max={targets.carbohydrates}
          label="Carbs (g)"
          showValues
          showPercentage
          variant={getVariant(current.carbohydrates || 0, targets.carbohydrates)}
        />

        {/* Fats */}
        <ProgressBar
          value={current.fats || 0}
          max={targets.fats}
          label="Fats (g)"
          showValues
          showPercentage
          variant={getVariant(current.fats || 0, targets.fats)}
        />
      </div>

      {/* Warning for overages */}
      {Object.entries(targets).some(([key, target]) => {
        const currentValue = current[key as keyof MacroData] || 0;
        return currentValue > target * 1.2;
      }) && (
        <div className="mt-4 p-3 bg-red-500/20 rounded-lg">
          <p className="text-sm text-red-300">
            ⚠️ You've exceeded some macro targets by more than 20%
          </p>
        </div>
      )}
    </Card>
  );
};
