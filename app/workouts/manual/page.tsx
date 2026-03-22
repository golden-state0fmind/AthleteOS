'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { addWorkout } from '@/lib/services/workoutService';

export default function ManualWorkoutPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [exerciseType, setExerciseType] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [notes, setNotes] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!exerciseType.trim()) {
      newErrors.exerciseType = 'Exercise type is required';
    }

    if (reps && (isNaN(parseInt(reps)) || parseInt(reps) < 1)) {
      newErrors.reps = 'Reps must be a positive number';
    }

    if (sets && (isNaN(parseInt(sets)) || parseInt(sets) < 1)) {
      newErrors.sets = 'Sets must be a positive number';
    }

    if (duration && (isNaN(parseInt(duration)) || parseInt(duration) < 1)) {
      newErrors.duration = 'Duration must be a positive number';
    }

    if (caloriesBurned && (isNaN(parseInt(caloriesBurned)) || parseInt(caloriesBurned) < 0)) {
      newErrors.caloriesBurned = 'Calories must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await addWorkout({
        timestamp: new Date().toISOString(),
        source: 'manual',
        exerciseType: exerciseType.trim(),
        estimatedReps: reps ? parseInt(reps) : null,
        sets: sets ? parseInt(sets) : null,
        duration: duration ? parseInt(duration) : null,
        caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : null,
        formFeedback: null,
        notes: notes.trim() || null,
      });

      // Navigate back to workouts page
      router.push('/workouts');
    } catch (error) {
      console.error('Error saving workout:', error);
      setErrors({ submit: 'Failed to save workout. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Manual Entry" />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Exercise Type *"
              type="text"
              placeholder="e.g., Push-ups, Squats, Running"
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              error={errors.exerciseType}
            />

            <Input
              label="Reps"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Number of repetitions"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              error={errors.reps}
            />

            <Input
              label="Sets"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Number of sets"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              error={errors.sets}
            />

            <Input
              label="Duration (minutes)"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Workout duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              error={errors.duration}
            />

            <Input
              label="Calories Burned"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Estimated calories burned"
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value)}
              error={errors.caloriesBurned}
            />

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 resize-none focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200"
              />
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500">{errors.submit}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Saving...' : 'Save Workout'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
