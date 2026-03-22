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
        <div className="relative h-56 flex items-center justify-center gap-6">
          {/* Human body silhouette SVG */}
          <svg
            viewBox="0 0 100 280"
            className="h-full w-auto"
            style={{ maxWidth: '100px' }}
          >
            <defs>
              {/* Gradient for water fill */}
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.95" />
              </linearGradient>
              
              {/* Clip path for refined human body shape */}
              <clipPath id="bodyClip">
                {/* Head - proportional to body (1:7.5 ratio) */}
                <ellipse cx="50" cy="22" rx="13" ry="15" />
                {/* Neck */}
                <path d="M 44 36 L 44 44 L 56 44 L 56 36 Z" />
                {/* Shoulders and torso */}
                <path d="M 26 48 Q 32 44 44 44 L 56 44 Q 68 44 74 48 L 72 95 Q 70 120 66 138 L 34 138 Q 30 120 28 95 Z" />
                {/* Left arm */}
                <path d="M 26 50 Q 16 62 14 82 Q 13 96 15 110 Q 17 114 20 112 Q 22 98 23 84 Q 24 64 26 52 Z" />
                {/* Right arm */}
                <path d="M 74 50 Q 84 62 86 82 Q 87 96 85 110 Q 83 114 80 112 Q 78 98 77 84 Q 76 64 74 52 Z" />
                {/* Left leg */}
                <path d="M 38 138 Q 36 180 34 230 Q 34 245 36 260 Q 37 267 40 267 Q 43 267 44 260 Q 45 245 45 230 Q 46 180 47 138 Z" />
                {/* Right leg */}
                <path d="M 62 138 Q 64 180 66 230 Q 66 245 64 260 Q 63 267 60 267 Q 57 267 56 260 Q 55 245 55 230 Q 54 180 53 138 Z" />
              </clipPath>
            </defs>
            
            {/* Body outline (empty state) */}
            <g opacity="0.15" stroke="white" strokeWidth="2" fill="none">
              <ellipse cx="50" cy="22" rx="13" ry="15" />
              <path d="M 44 36 L 44 44 L 56 44 L 56 36 Z" />
              <path d="M 26 48 Q 32 44 44 44 L 56 44 Q 68 44 74 48 L 72 95 Q 70 120 66 138 L 34 138 Q 30 120 28 95 Z" />
              <path d="M 26 50 Q 16 62 14 82 Q 13 96 15 110 Q 17 114 20 112 Q 22 98 23 84 Q 24 64 26 52 Z" />
              <path d="M 74 50 Q 84 62 86 82 Q 87 96 85 110 Q 83 114 80 112 Q 78 98 77 84 Q 76 64 74 52 Z" />
              <path d="M 38 138 Q 36 180 34 230 Q 34 245 36 260 Q 37 267 40 267 Q 43 267 44 260 Q 45 245 45 230 Q 46 180 47 138 Z" />
              <path d="M 62 138 Q 64 180 66 230 Q 66 245 64 260 Q 63 267 60 267 Q 57 267 56 260 Q 55 245 55 230 Q 54 180 53 138 Z" />
            </g>
            
            {/* Water fill */}
            <g clipPath="url(#bodyClip)">
              <rect
                x="0"
                y={280 - (percentage * 2.8)}
                width="100"
                height={percentage * 2.8}
                fill="url(#waterGradient)"
                className="transition-all duration-700 ease-out"
              />
              {/* Wave effect at top of water */}
              {percentage > 0 && percentage < 100 && (
                <>
                  <path
                    d={`M 0 ${280 - (percentage * 2.8)} Q 12.5 ${280 - (percentage * 2.8) - 2} 25 ${280 - (percentage * 2.8)} T 50 ${280 - (percentage * 2.8)} T 75 ${280 - (percentage * 2.8)} T 100 ${280 - (percentage * 2.8)}`}
                    fill="rgba(147, 197, 253, 0.4)"
                    className="animate-pulse"
                  />
                  <path
                    d={`M 0 ${280 - (percentage * 2.8) + 1} Q 12.5 ${280 - (percentage * 2.8) + 3} 25 ${280 - (percentage * 2.8) + 1} T 50 ${280 - (percentage * 2.8) + 1} T 75 ${280 - (percentage * 2.8) + 1} T 100 ${280 - (percentage * 2.8) + 1}`}
                    fill="rgba(147, 197, 253, 0.2)"
                    className="animate-pulse"
                    style={{ animationDelay: '0.3s' }}
                  />
                </>
              )}
            </g>
            
            {/* Body outline (over water) */}
            <g opacity="0.4" stroke="white" strokeWidth="1.5" fill="none">
              <ellipse cx="50" cy="22" rx="13" ry="15" />
              <path d="M 44 36 L 44 44 L 56 44 L 56 36 Z" />
              <path d="M 26 48 Q 32 44 44 44 L 56 44 Q 68 44 74 48 L 72 95 Q 70 120 66 138 L 34 138 Q 30 120 28 95 Z" />
              <path d="M 26 50 Q 16 62 14 82 Q 13 96 15 110 Q 17 114 20 112 Q 22 98 23 84 Q 24 64 26 52 Z" />
              <path d="M 74 50 Q 84 62 86 82 Q 87 96 85 110 Q 83 114 80 112 Q 78 98 77 84 Q 76 64 74 52 Z" />
              <path d="M 38 138 Q 36 180 34 230 Q 34 245 36 260 Q 37 267 40 267 Q 43 267 44 260 Q 45 245 45 230 Q 46 180 47 138 Z" />
              <path d="M 62 138 Q 64 180 66 230 Q 66 245 64 260 Q 63 267 60 267 Q 57 267 56 260 Q 55 245 55 230 Q 54 180 53 138 Z" />
            </g>
          </svg>
          
          {/* Percentage display on the side */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-white drop-shadow-lg">
              {percentage}%
            </span>
            <span className="text-xs text-white/60 mt-1">hydrated</span>
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
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
