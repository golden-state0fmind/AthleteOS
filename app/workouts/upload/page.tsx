'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ImageUploader } from '@/components/workouts/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { addWorkout } from '@/lib/services/workoutService';

export default function WorkoutUploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedFile(file);
    setPreview(previewUrl);
    setError(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !preview) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      const base64Data = preview.split(',')[1];

      // Call analysis API
      const response = await fetch('/api/analyze-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: selectedFile.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze workout');
      }

      const result = await response.json();

      // Save workout to IndexedDB
      await addWorkout({
        timestamp: new Date().toISOString(),
        source: 'image',
        exerciseType: result.exerciseType,
        estimatedReps: result.estimatedReps,
        sets: null,
        duration: null,
        formFeedback: result.formFeedback,
        notes: null,
      });

      // Navigate back to workouts page
      router.push('/workouts');
    } catch (err: any) {
      console.error('Error analyzing workout:', err);
      setError(err.message || 'Failed to analyze workout. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Upload Workout" />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <Card padding="md" className="mb-4">
          <p className="text-white/80 text-sm">
            Upload a photo of your workout to get AI-powered form feedback and exercise tracking.
          </p>
        </Card>

        <ImageUploader
          onImageSelect={handleImageSelect}
          onClear={handleClear}
          disabled={isAnalyzing}
        />

        {error && (
          <Card padding="md" className="mt-4 bg-red-500/20 border border-red-500/30">
            <p className="text-red-300 text-sm">{error}</p>
          </Card>
        )}

        {preview && (
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              fullWidth
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Workout'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
