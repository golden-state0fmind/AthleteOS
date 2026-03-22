'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createUserProfile } from '@/lib/services/userProfileService';

type FitnessGoal = 'lose weight' | 'build muscle' | 'maintain' | 'performance';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | ''>('');

  const totalSteps = 5;

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!name.trim()) {
          newErrors.name = 'Name is required';
        }
        break;
      case 2:
        const ageNum = parseInt(age);
        if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
          newErrors.age = 'Please enter a valid age (13-120)';
        }
        break;
      case 3:
        const weightNum = parseFloat(weight);
        if (!weight || isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
          newErrors.weight = 'Please enter a valid weight (20-300 kg)';
        }
        break;
      case 4:
        const heightNum = parseFloat(height);
        if (!height || isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
          newErrors.height = 'Please enter a valid height (100-250 cm)';
        }
        break;
      case 5:
        if (!fitnessGoal) {
          newErrors.fitnessGoal = 'Please select a fitness goal';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await createUserProfile({
        name: name.trim(),
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        fitnessGoal: fitnessGoal as FitnessGoal,
      });

      // Redirect to dashboard after successful profile creation
      router.push('/');
    } catch (error) {
      console.error('Error creating profile:', error);
      setErrors({ submit: 'Failed to create profile. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const fitnessGoalOptions: { value: FitnessGoal; label: string; description: string }[] = [
    { value: 'lose weight', label: 'Lose Weight', description: 'Focus on calorie deficit and fat loss' },
    { value: 'build muscle', label: 'Build Muscle', description: 'Focus on strength training and protein intake' },
    { value: 'maintain', label: 'Maintain', description: 'Maintain current fitness level' },
    { value: 'performance', label: 'Performance', description: 'Optimize athletic performance' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to AthleteOS</h1>
          <p className="text-white/60">Let's set up your profile</p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/60">Step {step} of {totalSteps}</span>
            <span className="text-sm text-accent">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card padding="lg">
          {/* Step 1: Name */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">What's your name?</h2>
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Age */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">How old are you?</h2>
              <Input
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                error={errors.age}
                autoFocus
              />
            </div>
          )}

          {/* Step 3: Weight */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">What's your weight?</h2>
              <Input
                type="number"
                placeholder="Enter your weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                error={errors.weight}
                helperText="Weight in kilograms"
                autoFocus
              />
            </div>
          )}

          {/* Step 4: Height */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">What's your height?</h2>
              <Input
                type="number"
                placeholder="Enter your height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                error={errors.height}
                helperText="Height in centimeters"
                autoFocus
              />
            </div>
          )}

          {/* Step 5: Fitness Goal */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">What's your fitness goal?</h2>
              <div className="space-y-3">
                {fitnessGoalOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFitnessGoal(option.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      fitnessGoal === option.value
                        ? 'border-accent bg-accent/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <p className="font-semibold text-white mb-1">{option.label}</p>
                    <p className="text-sm text-white/60">{option.description}</p>
                  </button>
                ))}
              </div>
              {errors.fitnessGoal && (
                <p className="text-sm text-red-500 mt-2">{errors.fitnessGoal}</p>
              )}
            </div>
          )}

          {errors.submit && (
            <p className="text-sm text-red-500 mt-4">{errors.submit}</p>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={isSubmitting}
              fullWidth={step === 1}
            >
              {isSubmitting ? 'Creating Profile...' : step === totalSteps ? 'Complete' : 'Next'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
