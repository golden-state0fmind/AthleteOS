'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { WaterIntakeEntry } from '@/lib/types/db';

interface WaterIntakeCardProps {
  totalIntake: number; // fluid ounces
  target: number; // fluid ounces
  entries: WaterIntakeEntry[];
  onAddWater: (amount: number) => void;
  onDeleteEntry: (id: string) => void;
}

export function WaterIntakeCard({
  totalIntake,
  target,
  entries,
  onAddWater,
  onDeleteEntry,
}: WaterIntakeCardProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const percentage = Math.min(Math.round((totalIntake / target) * 100), 100);
  const remainingAmount = Math.max(target - totalIntake, 0);

  const handleQuickAdd = (amount: number) => {
    onAddWater(amount);
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (amount > 0 && amount <= 200) {
      onAddWater(amount);
      setCustomAmount('');
      setShowCustom(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatAmount = (oz: number) => {
    return `${oz}oz`;
  };

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">💧 Water Intake</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{formatAmount(totalIntake)}</p>
          <p className="text-sm text-white/60">of {formatAmount(target)}</p>
        </div>
      </div>

      {/* Visual Progress */}
      <div className="mb-4">
        <div className="relative h-32 bg-white/5 rounded-lg overflow-hidden">
          {/* Water fill animation */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/80 to-blue-400/60 transition-all duration-500 ease-out"
            style={{ height: `${percentage}%` }}
          >
            {/* Wave effect */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-blue-300/30 animate-pulse" />
          </div>
          
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white drop-shadow-lg">
              {percentage}%
            </span>
          </div>
        </div>
        
        {remainingAmount > 0 && (
          <p className="text-center text-sm text-white/60 mt-2">
            {formatAmount(remainingAmount)} remaining
          </p>
        )}
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleQuickAdd(8)}
        >
          +8oz
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleQuickAdd(16)}
        >
          +16oz
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleQuickAdd(32)}
        >
          +32oz
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowCustom(!showCustom)}
        >
          Custom
        </Button>
      </div>

      {/* Custom Amount Input */}
      {showCustom && (
        <div className="flex gap-2 mb-4">
          <Input
            type="number"
            placeholder="Amount (oz)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min="1"
            max="200"
          />
          <Button variant="primary" onClick={handleCustomAdd}>
            Add
          </Button>
        </div>
      )}

      {/* Entry History */}
      {entries.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-sm text-white/60 mb-2">Today's Log</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between text-sm bg-white/5 rounded px-3 py-2"
              >
                <span className="text-white/80">{formatTime(entry.timestamp)}</span>
                <span className="text-white font-medium">{formatAmount(entry.amount)}</span>
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
