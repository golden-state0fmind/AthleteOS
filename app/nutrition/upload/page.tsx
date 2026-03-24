'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { ImageUploader } from '@/components/workouts/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { addNutritionEntry, checkGoalConflicts } from '@/lib/services/nutritionService';
import { getUserProfile } from '@/lib/services/userProfileService';
import type { MacroData } from '@/lib/types/db';

export default function NutritionUploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [servings, setServings] = useState<string>('1');
  
  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [status, setStatus] = useState<'planned' | 'consumed'>('consumed');

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedFile(file);
    setPreview(previewUrl);
    setError(null);
    setAnalysisResult(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setAnalysisResult(null);
    setAdditionalContext('');
    setServings('1');
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !preview) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      const base64Data = preview.split(',')[1];

      // Call analysis API
      const response = await fetch('/api/analyze-nutrition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: selectedFile.type,
          additionalContext: additionalContext.trim() || undefined,
          servings: servings ? parseFloat(servings) : 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze nutrition label');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Error analyzing nutrition:', err);
      setError(err.message || 'Failed to analyze nutrition label. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysisResult) return;

    try {
      // Get user profile for goal conflict checking
      const profile = await getUserProfile();
      
      // Check for goal conflicts
      const warnings = await checkGoalConflicts(analysisResult.macros, profile);

      // Save nutrition entry
      const now = new Date();
      await addNutritionEntry({
        timestamp: now.toISOString(),
        date: now.toISOString().split('T')[0],
        status,
        foodName: analysisResult.foodName || 'Unknown Food',
        servingSize: analysisResult.servingSize,
        macros: analysisResult.macros,
        warnings,
      });

      // Navigate back to nutrition page
      router.push('/nutrition');
    } catch (err: any) {
      console.error('Error saving nutrition entry:', err);
      setError(err.message || 'Failed to save nutrition entry. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Upload Nutrition Label" />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <Card padding="md" className="mb-4">
          <p className="text-white/80 text-sm">
            Upload a photo of a nutrition label to automatically extract macro information.
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

        {preview && !analysisResult && (
          <div className="mt-4 space-y-4">
            <Card padding="md">
              <div className="space-y-4">
                <div>
                  <label htmlFor="servings" className="block text-sm font-medium text-white/80 mb-2">
                    Number of Servings
                  </label>
                  <Input
                    id="servings"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="1"
                  />
                  <p className="text-xs text-white/60 mt-1">
                    How many servings are you consuming? (e.g., 1.5 for one and a half servings)
                  </p>
                </div>

                <div>
                  <label htmlFor="context" className="block text-sm font-medium text-white/80 mb-2">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    id="context"
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="e.g., 'This is a family-size package' or 'Only eating half the container'"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-white/60 mt-1">
                    Provide any additional details to help with accurate analysis
                  </p>
                </div>
              </div>
            </Card>

            <Button
              variant="primary"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              fullWidth
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Label'}
            </Button>
          </div>
        )}

        {/* Analysis result */}
        {analysisResult && (
          <div className="mt-4 space-y-4">
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-white mb-4">Analysis Result</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/60">Food Name</p>
                  <p className="text-white font-medium">{analysisResult.foodName || 'Unknown'}</p>
                </div>

                {analysisResult.servingSize && (
                  <div>
                    <p className="text-sm text-white/60">Serving Size</p>
                    <p className="text-white font-medium">{analysisResult.servingSize}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                  {analysisResult.macros.calories !== null && (
                    <div>
                      <p className="text-sm text-white/60">Calories</p>
                      <p className="text-white font-medium">{analysisResult.macros.calories}</p>
                    </div>
                  )}
                  {analysisResult.macros.protein !== null && (
                    <div>
                      <p className="text-sm text-white/60">Protein</p>
                      <p className="text-white font-medium">{analysisResult.macros.protein}g</p>
                    </div>
                  )}
                  {analysisResult.macros.carbohydrates !== null && (
                    <div>
                      <p className="text-sm text-white/60">Carbs</p>
                      <p className="text-white font-medium">{analysisResult.macros.carbohydrates}g</p>
                    </div>
                  )}
                  {analysisResult.macros.fats !== null && (
                    <div>
                      <p className="text-sm text-white/60">Fats</p>
                      <p className="text-white font-medium">{analysisResult.macros.fats}g</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status toggle */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-white/60 mb-2">Status</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatus('consumed')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      status === 'consumed'
                        ? 'bg-accent text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    Consumed
                  </button>
                  <button
                    onClick={() => setStatus('planned')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      status === 'planned'
                        ? 'bg-accent text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    Planned
                  </button>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleClear}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                fullWidth
              >
                Save Entry
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
