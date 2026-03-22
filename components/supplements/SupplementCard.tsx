import React from 'react';
import { Card } from '../ui/Card';
import type { SupplementEntry } from '@/lib/types/db';

export interface SupplementCardProps {
  supplement: SupplementEntry;
  onClick?: () => void;
  onDeactivate?: (id: string) => void;
}

export const SupplementCard: React.FC<SupplementCardProps> = ({
  supplement,
  onClick,
  onDeactivate,
}) => {
  const frequencyLabels = {
    daily: 'Daily',
    twice_daily: 'Twice Daily',
    weekly: 'Weekly',
    as_needed: 'As Needed',
  };

  const handleDeactivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeactivate && confirm(`Remove ${supplement.name} from your supplement list?`)) {
      onDeactivate(supplement.id);
    }
  };

  return (
    <Card 
      padding="md" 
      hover={!!onClick}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            💊 {supplement.name}
          </h3>
          <div className="flex flex-wrap gap-2 text-sm text-white/60">
            <span className="bg-white/10 px-2 py-1 rounded">
              {supplement.dosage}
            </span>
            <span className="bg-accent/20 text-accent px-2 py-1 rounded">
              {frequencyLabels[supplement.frequency]}
            </span>
            {supplement.timing && (
              <span className="bg-white/10 px-2 py-1 rounded">
                {supplement.timing}
              </span>
            )}
          </div>
        </div>

        {onDeactivate && (
          <button
            onClick={handleDeactivate}
            className="ml-2 text-white/40 hover:text-red-500 transition-colors"
            aria-label="Remove supplement"
          >
            ✕
          </button>
        )}
      </div>

      {/* Safety Notes */}
      {supplement.safetyNotes && (
        <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs font-semibold text-yellow-300 mb-1">⚠️ Safety Notes</p>
          <p className="text-sm text-yellow-200/90">{supplement.safetyNotes}</p>
        </div>
      )}

      {/* Effectiveness */}
      {supplement.effectiveness && (
        <div className="mb-3 p-3 bg-white/5 rounded-lg">
          <p className="text-xs font-semibold text-white/60 mb-1">Effectiveness</p>
          <p className="text-sm text-white/80">{supplement.effectiveness}</p>
        </div>
      )}

      <div className="pt-2 border-t border-white/10">
        <p className="text-xs text-white/50">
          Added {new Date(supplement.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
};
