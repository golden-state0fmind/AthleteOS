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
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [weight, setWeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | ''>('');

  // Refs for auto-focus
  const dobDayInputRef = React.useRef<HTMLInputElement>(null);
  const dobYearInputRef = React.useRef<HTMLInputElement>(null);
  const inchesInputRef = React.useRef<HTMLInputElement>(null);
  const weightInputRef = React.useRef<HTMLInputElement>(null);

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
        const month = parseInt(dobMonth);
        const day = parseInt(dobDay);
        const year = parseInt(dobYear);
        const currentYear = new Date().getFullYear();
        
        if (!dobMonth || isNaN(month) || month < 1 || month > 12) {
          newErrors.dobMonth = 'Invalid month';
        }
        if (!dobDay || isNaN(day) || day < 1 || day > 31) {
          newErrors.dobDay = 'Invalid day';
        }
        if (!dobYear || isNaN(year) || year < currentYear - 120 || year > currentYear - 13) {
          newErrors.dobYear = 'Must be 13-120 years old';
        }
        
        // Validate actual date
        if (dobMonth && dobDay && dobYear && Object.keys(newErrors).length === 0) {
          const date = new Date(year, month - 1, day);
          if (date.getMonth() !== month - 1 || date.getDate() !== day) {
            newErrors.dobDay = 'Invalid date';
          }
        }
        break;
      case 3:
        const weightNum = parseFloat(weight);
        if (!weight || isNaN(weightNum) || weightNum < 50 || weightNum > 700) {
          newErrors.weight = 'Please enter a valid weight (50-700 lbs)';
        }
        break;
      case 4:
        const feetNum = parseInt(heightFeet);
        const inchesNum = parseInt(heightInches);
        if (!heightFeet || isNaN(feetNum) || feetNum < 3 || feetNum > 8) {
          newErrors.heightFeet = 'Please enter valid feet (3-8)';
        }
        if (heightInches && (isNaN(inchesNum) || inchesNum < 0 || inchesNum > 11)) {
          newErrors.heightInches = 'Please enter valid inches (0-11)';
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
      // Calculate age from DOB
      const birthDate = new Date(parseInt(dobYear), parseInt(dobMonth) - 1, parseInt(dobDay));
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Convert feet and inches to cm for storage
      const totalInches = (parseInt(heightFeet) * 12) + (parseInt(heightInches) || 0);
      const heightInCm = totalInches * 2.54;
      
      // Convert lbs to kg for storage
      const weightInKg = parseFloat(weight) * 0.453592;

      console.log('Creating profile with data:', {
        name: name.trim(),
        age,
        weight: weightInKg,
        height: heightInCm,
        fitnessGoal,
      });

      const profile = await createUserProfile({
        name: name.trim(),
        age: age,
        weight: weightInKg,
        height: heightInCm,
        fitnessGoal: fitnessGoal as FitnessGoal,
      });

      console.log('Profile created successfully:', profile);

      // Small delay to ensure IndexedDB write completes
      await new Promise(resolve => setTimeout(resolve, 100));

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

          {/* Step 2: Date of Birth */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">What's your date of birth?</h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="MM"
                    value={dobMonth}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 2) {
                        setDobMonth(value);
                        // Auto-advance after 2 digits
                        if (value.length === 2 && dobDayInputRef.current) {
                          dobDayInputRef.current.focus();
                        }
                      }
                    }}
                    error={errors.dobMonth}
                    helperText="Month"
                    autoFocus
                  />
                </div>
                <div className="flex-1">
                  <Input
                    ref={dobDayInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="DD"
                    value={dobDay}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 2) {
                        setDobDay(value);
                        // Auto-advance after 2 digits
                        if (value.length === 2 && dobYearInputRef.current) {
                          dobYearInputRef.current.focus();
                        }
                      }
                    }}
                    error={errors.dobDay}
                    helperText="Day"
                  />
                </div>
                <div className="flex-[1.5]">
                  <Input
                    ref={dobYearInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="YYYY"
                    value={dobYear}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 4) {
                        setDobYear(value);
                      }
                    }}
                    error={errors.dobYear}
                    helperText="Year"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Weight */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">What's your weight?</h2>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter your weight (lbs)"
                value={weight}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setWeight(value);
                }}
                error={errors.weight}
                helperText="Weight in pounds"
                autoFocus
              />
            </div>
          )}

          {/* Step 4: Height */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">What's your height?</h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Feet"
                    value={heightFeet}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 1) {
                        setHeightFeet(value);
                        // Auto-advance to inches after entering 1 digit
                        if (value.length === 1 && inchesInputRef.current) {
                          inchesInputRef.current.focus();
                        }
                      }
                    }}
                    error={errors.heightFeet}
                    helperText="ft"
                    autoFocus
                  />
                </div>
                <div className="flex-1">
                  <Input
                    ref={inchesInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Inches"
                    value={heightInches}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 2) {
                        setHeightInches(value);
                      }
                    }}
                    error={errors.heightInches}
                    helperText="in"
                  />
                </div>
              </div>
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
