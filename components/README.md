# AthleteOS Components

This directory contains all UI components for the AthleteOS application, organized by feature domain.

## Component Structure

```
components/
├── ui/                    # Base UI components (Button, Card, Input, etc.)
├── layout/                # Layout components (Navigation, Header)
├── dashboard/             # Dashboard-specific components
├── workouts/              # Workout tracking components
├── nutrition/             # Nutrition logging components
├── supplements/           # Supplement management components
└── chat/                  # AI coach chat components
```

## Dashboard Components

Located in `components/dashboard/`

### DailyMetrics
Displays today's key metrics: calories consumed, workout count, and supplement completion.

**Props:**
- `caloriesConsumed: number` - Total calories consumed today
- `caloriesTarget?: number` - Optional daily calorie target
- `workoutCount: number` - Number of workouts completed today
- `supplementsTaken: number` - Number of supplements taken today
- `supplementsScheduled: number` - Total supplements scheduled for today

**Usage:**
```tsx
import { DailyMetrics } from '@/components/dashboard';

<DailyMetrics
  caloriesConsumed={1850}
  caloriesTarget={2000}
  workoutCount={1}
  supplementsTaken={3}
  supplementsScheduled={4}
/>
```

### QuickChat
Quick-access chat input for sending messages to the AI coach from the dashboard.

**Props:**
- `onSendMessage: (message: string) => void` - Callback when message is sent
- `isLoading?: boolean` - Loading state during message processing
- `disabled?: boolean` - Disable input (e.g., when offline)

**Usage:**
```tsx
import { QuickChat } from '@/components/dashboard';

<QuickChat
  onSendMessage={(msg) => handleSendMessage(msg)}
  isLoading={isSending}
  disabled={!isOnline}
/>
```

### StreakDisplay
Visualizes current and longest workout streaks with motivational messages.

**Props:**
- `currentStreak: number` - Current consecutive workout days
- `longestStreak: number` - Longest streak ever achieved

**Usage:**
```tsx
import { StreakDisplay } from '@/components/dashboard';

<StreakDisplay currentStreak={7} longestStreak={14} />
```

## Workout Components

Located in `components/workouts/`

### WorkoutCard
Displays a single workout entry with exercise details, reps, sets, and form feedback.

**Props:**
- `workout: WorkoutEntry` - Workout data from IndexedDB
- `onClick?: () => void` - Optional click handler

**Usage:**
```tsx
import { WorkoutCard } from '@/components/workouts';

<WorkoutCard
  workout={workoutEntry}
  onClick={() => handleWorkoutClick(workoutEntry)}
/>
```

### WorkoutList
Scrollable list of workout entries with empty state handling.

**Props:**
- `workouts: WorkoutEntry[]` - Array of workout entries
- `onWorkoutClick?: (workout: WorkoutEntry) => void` - Click handler for individual workouts
- `emptyMessage?: string` - Custom message when list is empty

**Usage:**
```tsx
import { WorkoutList } from '@/components/workouts';

<WorkoutList
  workouts={workouts}
  onWorkoutClick={(w) => setSelectedWorkout(w)}
  emptyMessage="Start logging your workouts!"
/>
```

### ImageUploader
Image upload component with preview, validation, and size/format checking.

**Props:**
- `onImageSelect: (file: File, preview: string) => void` - Callback with file and preview URL
- `onClear?: () => void` - Callback when image is cleared
- `disabled?: boolean` - Disable upload
- `maxSizeMB?: number` - Max file size (default: 10MB)
- `acceptedFormats?: string[]` - Accepted MIME types

**Usage:**
```tsx
import { ImageUploader } from '@/components/workouts';

<ImageUploader
  onImageSelect={(file, preview) => handleImageUpload(file)}
  onClear={() => setImage(null)}
  disabled={isUploading}
/>
```

### ProgressStats
Displays workout statistics including streaks, frequency, and most frequent exercise.

**Props:**
- `currentStreak: number` - Current workout streak
- `longestStreak: number` - Longest streak achieved
- `weeklyFrequency: number` - Workouts this week
- `mostFrequentExercise?: string` - Most performed exercise
- `totalWorkouts: number` - Total workout count

**Usage:**
```tsx
import { ProgressStats } from '@/components/workouts';

<ProgressStats
  currentStreak={5}
  longestStreak={12}
  weeklyFrequency={3}
  mostFrequentExercise="Push-ups"
  totalWorkouts={47}
/>
```

## Nutrition Components

Located in `components/nutrition/`

### NutritionCard
Displays a single nutrition entry with macros, status toggle, and warnings.

**Props:**
- `entry: NutritionEntry` - Nutrition data from IndexedDB
- `onStatusToggle?: (id: string, newStatus: 'planned' | 'consumed') => void` - Status change handler
- `onClick?: () => void` - Click handler

**Usage:**
```tsx
import { NutritionCard } from '@/components/nutrition';

<NutritionCard
  entry={nutritionEntry}
  onStatusToggle={(id, status) => updateStatus(id, status)}
  onClick={() => viewDetails(nutritionEntry)}
/>
```

### DailyTotals
Aggregated macro totals for a specific date.

**Props:**
- `totals: MacroData` - Aggregated macro data
- `date?: string` - Date string (defaults to "Today")

**Usage:**
```tsx
import { DailyTotals } from '@/components/nutrition';

<DailyTotals totals={dailyMacros} date="2024-01-15" />
```

### MacroProgress
Progress bars showing current intake vs. macro targets with overage warnings.

**Props:**
- `current: MacroData` - Current macro intake
- `targets: { calories, protein, carbohydrates, fats }` - Target values

**Usage:**
```tsx
import { MacroProgress } from '@/components/nutrition';

<MacroProgress
  current={currentMacros}
  targets={{ calories: 2000, protein: 150, carbohydrates: 200, fats: 65 }}
/>
```

### GoalWarning
Displays nutrition warnings for goal conflicts and high sodium.

**Props:**
- `warnings: Array<{ type, message }>` - Array of warning objects
- `onDismiss?: () => void` - Optional dismiss handler

**Usage:**
```tsx
import { GoalWarning } from '@/components/nutrition';

<GoalWarning
  warnings={nutritionEntry.warnings}
  onDismiss={() => setShowWarnings(false)}
/>
```

## Supplement Components

Located in `components/supplements/`

### SupplementCard
Displays supplement details including dosage, frequency, safety notes, and effectiveness.

**Props:**
- `supplement: SupplementEntry` - Supplement data from IndexedDB
- `onClick?: () => void` - Click handler
- `onDeactivate?: (id: string) => void` - Deactivation handler

**Usage:**
```tsx
import { SupplementCard } from '@/components/supplements';

<SupplementCard
  supplement={supplementEntry}
  onClick={() => viewDetails(supplementEntry)}
  onDeactivate={(id) => removeSupplement(id)}
/>
```

### DailyChecklist
Interactive checklist for tracking daily supplement intake.

**Props:**
- `supplements: Array<SupplementEntry & { taken: boolean }>` - Supplements with taken status
- `onToggleTaken: (supplementId: string, taken: boolean) => void` - Toggle handler
- `date?: string` - Date for the checklist

**Usage:**
```tsx
import { DailyChecklist } from '@/components/supplements';

<DailyChecklist
  supplements={todaySupplements}
  onToggleTaken={(id, taken) => markTaken(id, taken)}
  date="2024-01-15"
/>
```

### InteractionWarning
Modal displaying potential supplement interactions with severity levels.

**Props:**
- `interactions: Interaction[]` - Array of interaction objects
- `isOpen: boolean` - Modal open state
- `onClose: () => void` - Close handler

**Usage:**
```tsx
import { InteractionWarning } from '@/components/supplements';

<InteractionWarning
  interactions={detectedInteractions}
  isOpen={showModal}
  onClose={() => setShowModal(false)}
/>
```

## Chat Components

Located in `components/chat/`

### MessageList
Scrollable chat message history with auto-scroll and loading states.

**Props:**
- `messages: ChatMessage[]` - Array of chat messages
- `isLoading?: boolean` - Show loading indicator

**Usage:**
```tsx
import { MessageList } from '@/components/chat';

<MessageList messages={chatHistory} isLoading={isWaitingForResponse} />
```

### MessageBubble
Individual chat message bubble with role-based styling.

**Props:**
- `message: ChatMessage` - Message data with role and content

**Usage:**
```tsx
import { MessageBubble } from '@/components/chat';

<MessageBubble message={chatMessage} />
```

### ChatInput
Multi-line chat input with auto-resize and keyboard shortcuts.

**Props:**
- `onSendMessage: (message: string) => void` - Send message callback
- `disabled?: boolean` - Disable input
- `isLoading?: boolean` - Loading state
- `placeholder?: string` - Input placeholder text

**Usage:**
```tsx
import { ChatInput } from '@/components/chat';

<ChatInput
  onSendMessage={(msg) => sendToAI(msg)}
  disabled={!isOnline}
  isLoading={isSending}
  placeholder="Ask your coach..."
/>
```

## Design System

All components follow the AthleteOS design system:

- **Dark Theme**: Background colors use `bg-white/5` and `bg-white/10`
- **Accent Color**: Electric green (`accent` in Tailwind config)
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Animations**: All transitions under 300ms
- **Typography**: White text with opacity variants for hierarchy
- **Spacing**: Consistent padding and gap values

## Integration with Services

Components are designed to work seamlessly with the service layer:

```tsx
import { getWorkouts } from '@/lib/services/workoutService';
import { WorkoutList } from '@/components/workouts';

function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    getWorkouts().then(setWorkouts);
  }, []);

  return <WorkoutList workouts={workouts} />;
}
```

## Accessibility

All components include:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly markup
- Sufficient color contrast
- Touch-friendly targets

## Testing

Components can be tested using React Testing Library:

```tsx
import { render, screen } from '@testing-library/react';
import { DailyMetrics } from '@/components/dashboard';

test('displays calorie count', () => {
  render(<DailyMetrics caloriesConsumed={1500} workoutCount={1} supplementsTaken={2} supplementsScheduled={3} />);
  expect(screen.getByText('1500')).toBeInTheDocument();
});
```
