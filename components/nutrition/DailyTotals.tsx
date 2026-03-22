import React from 'react';
import { Card } from '../ui/Card';
import type { MacroData } from '@/lib/types/db';

export interface DailyTotalsProps {
  totals: MacroData;
  date?: string;
}

export const DailyTotals: React.FC<DailyTotalsProps> = ({ totals, date }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Today';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card padding="md" className="bg-gradient-to-br from-accent/10 to-accent/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Daily Totals</h2>
        <p className="text-sm text-white/60">{formatDate(date)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Calories */}
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Calories</p>
          <p className="text-2xl font-bold text-accent">
            {totals.calories?.toFixed(0) || 0}
          </p>
        </div>

        {/* Protein */}
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Protein</p>
          <p className="text-2xl font-bold text-white">
            {totals.protein?.toFixed(1) || 0}
            <span className="text-sm text-white/60 ml-1">g</span>
          </p>
        </div>

        {/* Carbohydrates */}
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Carbs</p>
          <p className="text-2xl font-bold text-white">
            {totals.carbohydrates?.toFixed(1) || 0}
            <span className="text-sm text-white/60 ml-1">g</span>
          </p>
        </div>

        {/* Fats */}
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-white/60 mb-1">Fats</p>
          <p className="text-2xl font-bold text-white">
            {totals.fats?.toFixed(1) || 0}
            <span className="text-sm text-white/60 ml-1">g</span>
          </p>
        </div>

        {/* Sugar */}
        {totals.sugar !== null && totals.sugar > 0 && (
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Sugar</p>
            <p className="text-xl font-bold text-white">
              {totals.sugar.toFixed(1)}
              <span className="text-sm text-white/60 ml-1">g</span>
            </p>
          </div>
        )}

        {/* Sodium */}
        {totals.sodium !== null && totals.sodium > 0 && (
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Sodium</p>
            <p className="text-xl font-bold text-white">
              {totals.sodium.toFixed(0)}
              <span className="text-sm text-white/60 ml-1">mg</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
