'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getUserProfile, updateUserProfile } from '@/lib/services/userProfileService';
import { exportUserData, importUserData } from '@/lib/services/exportService';
import type { UserProfile } from '@/lib/types/db';

type FitnessGoal = 'lose weight' | 'build muscle' | 'maintain' | 'performance';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Profile data
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('maintain');

  // Macro targets
  const [hasTargets, setHasTargets] = useState(false);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbohydrates, setCarbohydrates] = useState('');
  const [fats, setFats] = useState('');

  // Water target
  const [waterTarget, setWaterTarget] = useState('128'); // 1 gallon

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getUserProfile();
      
      if (profile) {
        setName(profile.name);
        setAge(profile.age.toString());
        setWeight(profile.weight.toString());
        setHeight(profile.height.toString());
        setFitnessGoal(profile.fitnessGoal);
        setWaterTarget((profile.dailyWaterTarget || 128).toString()); // 1 gallon default

        if (profile.macroTargets) {
          setHasTargets(true);
          setCalories(profile.macroTargets.calories.toString());
          setProtein(profile.macroTargets.protein.toString());
          setCarbohydrates(profile.macroTargets.carbohydrates.toString());
          setFats(profile.macroTargets.fats.toString());
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      newErrors.age = 'Please enter a valid age (13-120)';
    }

    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
      newErrors.weight = 'Please enter a valid weight (20-300 kg)';
    }

    const heightNum = parseFloat(height);
    if (!height || isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      newErrors.height = 'Please enter a valid height (100-250 cm)';
    }

    if (hasTargets) {
      const caloriesNum = parseInt(calories);
      if (!calories || isNaN(caloriesNum) || caloriesNum < 500 || caloriesNum > 10000) {
        newErrors.calories = 'Please enter valid calories (500-10000)';
      }

      const proteinNum = parseInt(protein);
      if (!protein || isNaN(proteinNum) || proteinNum < 0 || proteinNum > 500) {
        newErrors.protein = 'Please enter valid protein (0-500g)';
      }

      const carbsNum = parseInt(carbohydrates);
      if (!carbohydrates || isNaN(carbsNum) || carbsNum < 0 || carbsNum > 1000) {
        newErrors.carbohydrates = 'Please enter valid carbs (0-1000g)';
      }

      const fatsNum = parseInt(fats);
      if (!fats || isNaN(fatsNum) || fatsNum < 0 || fatsNum > 500) {
        newErrors.fats = 'Please enter valid fats (0-500g)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setSuccessMessage('');

    try {
      const updates: Partial<UserProfile> = {
        name: name.trim(),
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        fitnessGoal,
        dailyWaterTarget: parseInt(waterTarget) || 128, // 1 gallon default
      };

      if (hasTargets) {
        updates.macroTargets = {
          calories: parseInt(calories),
          protein: parseInt(protein),
          carbohydrates: parseInt(carbohydrates),
          fats: parseInt(fats),
        };
      } else {
        updates.macroTargets = undefined;
      }

      await updateUserProfile(updates);
      setSuccessMessage('Profile updated successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      
      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `athleteos-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage('Data exported successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      await importUserData(data);
      
      setSuccessMessage('Data imported successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        loadProfile(); // Reload profile data
      }, 2000);
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Failed to import data. Please check the file format.');
    }

    // Reset file input
    e.target.value = '';
  };

  const fitnessGoalOptions: { value: FitnessGoal; label: string }[] = [
    { value: 'lose weight', label: 'Lose Weight' },
    { value: 'build muscle', label: 'Build Muscle' },
    { value: 'maintain', label: 'Maintain' },
    { value: 'performance', label: 'Performance' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-white/60">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Settings" showBackButton={false} />

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {successMessage && (
          <Card padding="md" className="mb-4 bg-accent/20 border border-accent/30">
            <p className="text-accent text-sm">✓ {successMessage}</p>
          </Card>
        )}

        {/* Profile Settings */}
        <Card padding="lg" className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Settings</h2>
          
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <Input
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              error={errors.age}
            />

            <Input
              label="Weight (kg)"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              error={errors.weight}
            />

            <Input
              label="Height (cm)"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              error={errors.height}
            />

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Fitness Goal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fitnessGoalOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFitnessGoal(option.value)}
                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                      fitnessGoal === option.value
                        ? 'bg-accent text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {errors.submit && (
              <p className="text-sm text-red-500">{errors.submit}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              fullWidth
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </Card>

        {/* Macro Targets */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Daily Targets</h2>
              <p className="text-sm text-white/60">
                Set your daily nutrition and hydration goals to track progress on your dashboard
              </p>
            </div>
          </div>
          
          {/* Water Target */}
          <div className="mb-6">
            <Input
              label="Daily Water Target (oz)"
              type="number"
              value={waterTarget}
              onChange={(e) => setWaterTarget(e.target.value)}
              helperText="Recommended: 64-128oz per day (1 gallon = 128oz)"
              min="16"
              max="300"
            />
          </div>

          {/* Macro Targets */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasTargets}
                onChange={(e) => setHasTargets(e.target.checked)}
                className="w-5 h-5 rounded border-white/30 bg-white/10 text-accent focus:ring-accent"
              />
              <span className="text-white/80">Set daily macro targets</span>
            </label>
            <p className="text-xs text-white/50 mt-1 ml-7">
              Enable this to track your calorie budget and macro goals on the dashboard
            </p>
          </div>

          {hasTargets && (
            <div className="space-y-4">
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-white/80">
                  💡 <span className="font-medium">Tip:</span> Your calorie budget will be calculated based on these targets and displayed on your dashboard, showing how food intake and workout calories affect your daily balance.
                </p>
              </div>

              <Input
                label="Calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                error={errors.calories}
                helperText="Daily calorie target based on your fitness goal"
              />

              <Input
                label="Protein (g)"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                error={errors.protein}
              />

              <Input
                label="Carbohydrates (g)"
                type="number"
                value={carbohydrates}
                onChange={(e) => setCarbohydrates(e.target.value)}
                error={errors.carbohydrates}
              />

              <Input
                label="Fats (g)"
                type="number"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                error={errors.fats}
              />
            </div>
          )}
        </Card>

        {/* Data Management */}
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-white mb-4">Data Management</h2>
          
          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={handleExportData}
              fullWidth
            >
              📥 Export Data
            </Button>

            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file" className="block cursor-pointer">
                <div className="font-medium rounded-lg transition-colors duration-200 min-h-[44px] min-w-[44px] px-6 py-3 text-base bg-white/10 text-white hover:bg-white/20 active:bg-white/15 text-center">
                  📤 Import Data
                </div>
              </label>
            </div>

            <p className="text-xs text-white/60 mt-2">
              Export your data to back up all workouts, nutrition, supplements, and chat history. 
              Import to restore from a previous backup.
            </p>
          </div>
        </Card>
      </div>

      <Navigation />
    </div>
  );
}
