'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { WorkoutList } from '@/components/workouts/WorkoutList';
import { Button } from '@/components/ui/Button';
import { getWorkouts } from '@/lib/services/workoutService';
import type { WorkoutEntry } from '@/lib/types/db';

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-white/60">Loading workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Workouts" showBackButton={false} />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            variant="primary"
            onClick={() => router.push('/workouts/upload')}
          >
            📸 Upload Image
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/workouts/manual')}
          >
            ✏️ Manual Entry
          </Button>
        </div>

        {/* Workout list */}
        <WorkoutList workouts={workouts} />
      </div>

      <Navigation />
    </div>
  );
}
