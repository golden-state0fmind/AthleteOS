import React from 'react';
import { Card } from '../ui/Card';
import type { SupplementEntry } from '@/lib/types/db';

export interface DailyChecklistProps {
  supplements: Array<SupplementEntry & { taken: boolean }>;
  onToggleTaken: (supplementId: string, taken: boolean) => void;
  date?: string;
}

export const DailyChecklist: React.FC<DailyChecklistProps> = ({
  supplements,
  onToggleTaken,
  date,
}) => {
  const takenCount = supplements.filter(s => s.taken).length;
  const totalCount = supplements.length;
  const percentage = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Today';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Daily Checklist</h2>
        <div className="text-right">
          <p className="text-sm text-white/60">{formatDate(date)}</p>
          <p className="text-xs text-accent font-medium">
            {takenCount} / {totalCount} ({percentage}%)
          </p>
        </div>
      </div>

      {supplements.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60">No supplements scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-2">
          {supplements.map((supplement) => (
            <div
              key={supplement.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                supplement.taken 
                  ? 'bg-accent/20 border border-accent/30' 
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <button
                onClick={() => onToggleTaken(supplement.id, !supplement.taken)}
                className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  supplement.taken
                    ? 'bg-accent border-accent'
                    : 'border-white/30 hover:border-accent'
                }`}
                aria-label={`Mark ${supplement.name} as ${supplement.taken ? 'not taken' : 'taken'}`}
              >
                {supplement.taken && (
                  <span className="text-white text-sm">✓</span>
                )}
              </button>

              <div className="flex-1">
                <p className={`font-medium ${supplement.taken ? 'text-white' : 'text-white/80'}`}>
                  {supplement.name}
                </p>
                <div className="flex gap-2 text-xs text-white/60 mt-1">
                  <span>{supplement.dosage}</span>
                  {supplement.timing && (
                    <>
                      <span>•</span>
                      <span>{supplement.timing}</span>
                    </>
                  )}
                </div>
              </div>

              {supplement.taken && (
                <span className="text-accent text-sm">✓</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};
