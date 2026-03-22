'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { addSupplement, getActiveSupplements } from '@/lib/services/supplementService';

type Frequency = 'daily' | 'twice_daily' | 'weekly' | 'as_needed';

export default function AddSupplementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [timing, setTiming] = useState('');
  
  // Analysis result
  const [safetyNotes, setSafetyNotes] = useState('');
  const [effectiveness, setEffectiveness] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const frequencyOptions: { value: Frequency; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'twice_daily', label: 'Twice Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'as_needed', label: 'As Needed' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Supplement name is required';
    }

    if (!dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }

    if (!hasAnalyzed) {
      newErrors.analyze = 'Please analyze the supplement before saving';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!name.trim() || !dosage.trim()) {
      setErrors({
        name: !name.trim() ? 'Supplement name is required' : '',
        dosage: !dosage.trim() ? 'Dosage is required' : '',
      });
      return;
    }

    setIsAnalyzing(true);
    setErrors({});

    try {
      // Get all active supplements for interaction detection
      const activeSupplements = await getActiveSupplements();

      // Call analysis API
      const response = await fetch('/api/analyze-supplement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplementName: name.trim(),
          dosage: dosage.trim(),
          allSupplements: activeSupplements.map(s => ({
            name: s.name,
            dosage: s.dosage,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze supplement');
      }

      const result = await response.json();
      setSafetyNotes(result.safetyNotes);
      setEffectiveness(result.effectiveness);
      setHasAnalyzed(true);

      // Show interaction warnings if any
      if (result.interactions && result.interactions.length > 0) {
        const highSeverity = result.interactions.filter((i: any) => i.severity === 'high');
        if (highSeverity.length > 0) {
          alert(`⚠️ High severity interactions detected:\n\n${highSeverity.map((i: any) => i.description).join('\n\n')}`);
        }
      }
    } catch (err: any) {
      console.error('Error analyzing supplement:', err);
      setErrors({ analyze: err.message || 'Failed to analyze supplement. Please try again.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await addSupplement({
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        timing: timing.trim(),
        safetyNotes,
        effectiveness,
        active: true,
      });

      // Navigate back to supplements page
      router.push('/supplements');
    } catch (error) {
      console.error('Error saving supplement:', error);
      setErrors({ submit: 'Failed to save supplement. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Add Supplement" />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Supplement Name *"
              type="text"
              placeholder="e.g., Creatine, Protein Powder"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <Input
              label="Dosage *"
              type="text"
              placeholder="e.g., 5g, 2 capsules"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              error={errors.dosage}
            />

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Frequency *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {frequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFrequency(option.value)}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      frequency === option.value
                        ? 'bg-accent text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Timing"
              type="text"
              placeholder="e.g., morning, with meals"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
            />

            {/* Analyze button */}
            {!hasAnalyzed && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                fullWidth
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Supplement'}
              </Button>
            )}

            {errors.analyze && (
              <p className="text-sm text-red-500">{errors.analyze}</p>
            )}

            {/* Analysis results */}
            {hasAnalyzed && (
              <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">Safety Notes</p>
                  <p className="text-sm text-white/60">{safetyNotes}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80 mb-1">Effectiveness</p>
                  <p className="text-sm text-white/60">{effectiveness}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  Re-analyze
                </Button>
              </div>
            )}

            {errors.submit && (
              <p className="text-sm text-red-500">{errors.submit}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !hasAnalyzed}
              fullWidth
            >
              {isSubmitting ? 'Saving...' : 'Save Supplement'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
