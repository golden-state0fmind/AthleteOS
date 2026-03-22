'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { NutritionCard } from '@/components/nutrition/NutritionCard';
import { DailyTotals } from '@/components/nutrition/DailyTotals';
import { MacroProgress } from '@/components/nutrition/MacroProgress';
import { QuickAddModal } from '@/components/nutrition/QuickAddModal';
import { Button } from '@/components/ui/Button';
import { getNutritionByDate, getDailyTotals, updateEntryStatus, addNutritionEntry } from '@/lib/services/nutritionService';
import { getUserProfile } from '@/lib/services/userProfileService';
import type { NutritionEntry, MacroData } from '@/lib/types/db';

export default function NutritionPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [dailyTotals, setDailyTotals] = useState<MacroData>({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fats: 0,
    sugar: 0,
    sodium: 0,
  });
  const [macroTargets, setMacroTargets] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      // Load user profile for macro targets
      const profile = await getUserProfile();
      if (profile?.macroTargets) {
        setMacroTargets(profile.macroTargets);
      }

      // Load nutrition entries for selected date
      const nutritionData = await getNutritionByDate(selectedDate);
      setEntries(nutritionData);

      // Calculate daily totals
      const totals = await getDailyTotals(selectedDate);
      setDailyTotals(totals);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (id: string, newStatus: 'planned' | 'consumed') => {
    try {
      await updateEntryStatus(id, newStatus);
      await loadData(); // Reload data to reflect changes
    } catch (error) {
      console.error('Error updating entry status:', error);
    }
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleQuickAddSave = async (data: any) => {
    try {
      // Save each item as a separate entry
      for (const item of data.items) {
        await addNutritionEntry({
          date: selectedDate,
          foodName: item.description,
          servingSize: '1 serving',
          macros: {
            calories: item.calories,
            protein: item.protein,
            carbohydrates: item.carbohydrates,
            fats: item.fats,
            sugar: item.sugar,
            sodium: item.sodium,
          },
          status: 'consumed',
        });
      }
      
      // Reload data to show new entries
      await loadData();
    } catch (error) {
      console.error('Error saving quick add entries:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-white/60">Loading nutrition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Nutrition" showBackButton={false} />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Date selector */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDateChange('prev')}
          >
            ← Prev
          </Button>
          <h2 className="text-lg font-semibold text-white">{formatDate(selectedDate)}</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDateChange('next')}
            disabled={selectedDate >= new Date().toISOString().split('T')[0]}
          >
            Next →
          </Button>
        </div>

        {/* Action buttons */}
        <div className="mb-6 flex gap-3">
          <Button
            variant="primary"
            onClick={() => setIsQuickAddOpen(true)}
            fullWidth
          >
            ✨ Quick Add
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/nutrition/upload')}
            fullWidth
          >
            📸 Upload Label
          </Button>
        </div>

        {/* Daily totals */}
        <div className="mb-6">
          <DailyTotals totals={dailyTotals} />
        </div>

        {/* Macro progress (if targets are set) */}
        {macroTargets && (
          <div className="mb-6">
            <MacroProgress current={dailyTotals} targets={macroTargets} />
          </div>
        )}

        {/* Nutrition entries */}
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg mb-2">🍽️</p>
              <p className="text-white/60">No nutrition logged for this day</p>
            </div>
          ) : (
            entries.map((entry) => (
              <NutritionCard
                key={entry.id}
                entry={entry}
                onStatusToggle={handleStatusToggle}
              />
            ))
          )}
        </div>
      </div>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSave={handleQuickAddSave}
      />

      <Navigation />
    </div>
  );
}
