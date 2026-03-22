import React from 'react';
import { Card } from '../ui/Card';

export interface GoalWarningProps {
  warnings: Array<{
    type: 'goal_conflict' | 'high_sodium';
    message: string;
  }>;
  onDismiss?: () => void;
}

export const GoalWarning: React.FC<GoalWarningProps> = ({ warnings, onDismiss }) => {
  if (warnings.length === 0) return null;

  return (
    <Card padding="md" className="border-l-4 border-yellow-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">
            ⚠️ Nutrition Alerts
          </h3>
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  warning.type === 'high_sodium'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}
              >
                <p className="text-sm">{warning.message}</p>
              </div>
            ))}
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-white/60 hover:text-white transition-colors"
            aria-label="Dismiss warnings"
          >
            ✕
          </button>
        )}
      </div>
    </Card>
  );
};
