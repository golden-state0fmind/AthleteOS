'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DailyMetrics } from '@/components/dashboard/DailyMetrics';
import { CalorieBudgetCard } from '@/components/dashboard/CalorieBudgetCard';
import { QuickChat } from '@/components/dashboard/QuickChat';
import { StreakDisplay } from '@/components/dashboard/StreakDisplay';
import { Navigation } from '@/components/layout/Navigation';
import { Card } from '@/components/ui/Card';
import { getUserProfile } from '@/lib/services/userProfileService';
import { getWorkouts, calculateWorkoutStreak, getDailyCaloriesBurned } from '@/lib/services/workoutService';
import { getNutritionByDate, getDailyTotals } from '@/lib/services/nutritionService';
import { getTodayChecklist } from '@/lib/services/supplementService';
import { getDailyWaterTotal } from '@/lib/services/waterIntakeService';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  
  // Dashboard data
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [caloriesTarget, setCaloriesTarget] = useState<number | undefined>(undefined);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [fitnessGoal, setFitnessGoal] = useState<'lose weight' | 'build muscle' | 'maintain' | 'performance'>('maintain');
  const [workoutCount, setWorkoutCount] = useState(0);
  const [supplementsTaken, setSupplementsTaken] = useState(0);
  const [supplementsScheduled, setSupplementsScheduled] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterTarget, setWaterTarget] = useState(128); // 1 gallon
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    checkProfileAndLoadData();
    
    // Online status detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkProfileAndLoadData = async () => {
    try {
      const profile = await getUserProfile();
      
      if (!profile) {
        // Redirect to onboarding if no profile exists
        router.push('/onboarding');
        return;
      }
      
      setHasProfile(true);
      
      // Load dashboard data
      await loadDashboardData(profile);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (profile: any) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Load nutrition data
    const dailyTotals = await getDailyTotals(today);
    setCaloriesConsumed(dailyTotals.calories || 0);
    setCaloriesTarget(profile.macroTargets?.calories);
    
    // Load fitness goal
    setFitnessGoal(profile.fitnessGoal || 'maintain');
    
    // Load calories burned from workouts
    const caloriesBurnedToday = await getDailyCaloriesBurned(today);
    setCaloriesBurned(caloriesBurnedToday);
    
    // Load water intake
    const waterTotal = await getDailyWaterTotal(today);
    setWaterIntake(waterTotal);
    setWaterTarget(profile.dailyWaterTarget || 128); // 1 gallon default
    
    // Load today's workouts
    const todayStart = new Date(today).toISOString();
    const todayEnd = new Date(today + 'T23:59:59').toISOString();
    const todayWorkouts = await getWorkouts();
    const todayWorkoutCount = todayWorkouts.filter(
      w => w.timestamp >= todayStart && w.timestamp <= todayEnd
    ).length;
    setWorkoutCount(todayWorkoutCount);
    
    // Load workout streak
    const streak = await calculateWorkoutStreak();
    setCurrentStreak(streak.current);
    setLongestStreak(streak.longest);
    
    // Load supplement checklist
    const checklist = await getTodayChecklist(today);
    setSupplementsScheduled(checklist.length);
    setSupplementsTaken(checklist.filter(s => s.taken).length);
  };

  const handleQuickChatSend = (message: string) => {
    // Navigate to chat page with the message
    router.push(`/chat?message=${encodeURIComponent(message)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return null; // Will redirect to onboarding
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/60">Your fitness journey at a glance</p>
        </header>

        <div className="space-y-4">
          {/* Setup prompt when no calorie target is set */}
          {!caloriesTarget && (
            <Card padding="md" className="bg-accent/10 border border-accent/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">Set Your Daily Targets</h3>
                  <p className="text-sm text-white/80 mb-3">
                    Track your calorie budget and see how workouts affect your daily balance. Set your targets in Settings to get started.
                  </p>
                  <button
                    onClick={() => router.push('/settings')}
                    className="text-sm text-accent font-medium hover:underline"
                  >
                    Go to Settings →
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Calorie Budget - Prominent placement at top */}
          {caloriesTarget && (
            <CalorieBudgetCard
              caloriesConsumed={caloriesConsumed}
              caloriesBurned={caloriesBurned}
              caloriesTarget={caloriesTarget}
              fitnessGoal={fitnessGoal}
            />
          )}

          {/* Daily Metrics */}
          <DailyMetrics
            caloriesConsumed={caloriesConsumed}
            caloriesTarget={caloriesTarget}
            workoutCount={workoutCount}
            supplementsTaken={supplementsTaken}
            supplementsScheduled={supplementsScheduled}
            waterIntake={waterIntake}
            waterTarget={waterTarget}
          />

          {/* Streak Display */}
          <StreakDisplay
            currentStreak={currentStreak}
            longestStreak={longestStreak}
          />

          {/* Quick Chat */}
          <QuickChat
            onSendMessage={handleQuickChatSend}
            disabled={!isOnline}
          />
        </div>
      </div>

      <Navigation />
    </div>
  );
}
