'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { DailyChecklist } from '@/components/supplements/DailyChecklist';
import { SupplementCard } from '@/components/supplements/SupplementCard';
import { Button } from '@/components/ui/Button';
import { getActiveSupplements, getTodayChecklist, markSupplementTaken, unmarkSupplementTaken } from '@/lib/services/supplementService';
import type { SupplementEntry } from '@/lib/types/db';

export default function SupplementsPage() {
  const router = useRouter();
  const [supplements, setSupplements] = useState<SupplementEntry[]>([]);
  const [checklist, setChecklist] = useState<Array<SupplementEntry & { taken: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get today's date in local timezone (not UTC)
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = getTodayDate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load active supplements
      const activeSupps = await getActiveSupplements();
      setSupplements(activeSupps);

      // Load today's checklist
      const todayChecklist = await getTodayChecklist(today);
      setChecklist(todayChecklist);
    } catch (error) {
      console.error('Error loading supplements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTaken = async (supplementId: string, taken: boolean) => {
    try {
      if (taken) {
        await markSupplementTaken(supplementId, today);
      } else {
        await unmarkSupplementTaken(supplementId, today);
      }
      // Reload checklist to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error updating supplement status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-white/60">Loading supplements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Supplements" showBackButton={false} />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Action button */}
        <div className="mb-6">
          <Button
            variant="primary"
            onClick={() => router.push('/supplements/add')}
            fullWidth
          >
            ➕ Add Supplement
          </Button>
        </div>

        {/* Daily checklist */}
        <div className="mb-6">
          <DailyChecklist
            supplements={checklist}
            onToggleTaken={handleToggleTaken}
            date={today}
          />
        </div>

        {/* All supplements */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">All Supplements</h2>
        </div>

        <div className="space-y-3">
          {supplements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg mb-2">💊</p>
              <p className="text-white/60">No supplements added yet</p>
            </div>
          ) : (
            supplements.map((supplement) => (
              <SupplementCard key={supplement.id} supplement={supplement} />
            ))
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
}
