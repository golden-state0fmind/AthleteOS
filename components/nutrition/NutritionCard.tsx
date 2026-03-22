import React from 'react';
import { Card } from '../ui/Card';
import type { NutritionEntry } from '@/lib/types/db';

export interface NutritionCardProps {
  entry: NutritionEntry;
  onStatusToggle?: (id: string, newStatus: 'planned' | 'consumed') => void;
  onClick?: () => void;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  entry,
  onStatusToggle,
  onClick,
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatusToggle) {
      const newStatus = entry.status === 'planned' ? 'consumed' : 'planned';
      onStatusToggle(entry.id, newStatus);
    }
  };

  const statusColor = entry.status === 'consumed' 
    ? 'bg-accent/20 text-accent' 
    : 'bg-white/10 text-white/60';

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
            {entry.foodName}
          </h3>
          {entry.servingSize && (
            <p className="text-sm text-white/60">{entry.servingSize}</p>
          )}
        </div>
        
        {onStatusToggle && (
          <button
            onClick={handleStatusToggle}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusColor}`}
          >
            {entry.status === 'consumed' ? '✓ Consumed' : 'Planned'}
          </button>
        )}
      </div>

      {/* Macros Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {entry.macros.calories !== null && (
          <div className="bg-white/5 rounded p-2">
            <p className="text-xs text-white/60">Calories</p>
            <p className="text-sm font-semibold text-white">{entry.macros.calories}</p>
          </div>
        )}
        {entry.macros.protein !== null && (
          <div className="bg-white/5 rounded p-2">
            <p className="text-xs text-white/60">Protein</p>
            <p className="text-sm font-semibold text-white">{entry.macros.protein}g</p>
          </div>
        )}
        {entry.macros.carbohydrates !== null && (
          <div className="bg-white/5 rounded p-2">
            <p className="text-xs text-white/60">Carbs</p>
            <p className="text-sm font-semibold text-white">{entry.macros.carbohydrates}g</p>
          </div>
        )}
        {entry.macros.fats !== null && (
          <div className="bg-white/5 rounded p-2">
            <p className="text-xs text-white/60">Fats</p>
            <p className="text-sm font-semibold text-white">{entry.macros.fats}g</p>
          </div>
        )}
        {entry.macros.sugar !== null && (
          <div className="bg-white/5 rounded p-2">
            <p className="text-xs text-white/60">Sugar</p>
            <p className="text-sm font-semibold text-white">{entry.macros.sugar}g</p>
          </div>
        )}
        {entry.macros.sodium !== null && (
          <div className="bg-white/5 rounded p-2">
            <p className="text-xs text-white/60">Sodium</p>
            <p className="text-sm font-semibold text-white">{entry.macros.sodium}mg</p>
          </div>
        )}
      </div>

      {/* Warnings */}
      {entry.warnings.length > 0 && (
        <div className="space-y-1 mb-3">
          {entry.warnings.map((warning, index) => (
            <div
              key={index}
              className={`text-xs p-2 rounded ${
                warning.type === 'high_sodium' 
                  ? 'bg-red-500/20 text-red-300' 
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}
            >
              {warning.message}
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-white/10">
        <p className="text-xs text-white/50">{formatTime(entry.timestamp)}</p>
      </div>
    </Card>
  );
};
