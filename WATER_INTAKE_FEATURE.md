# Water Intake Tracking Feature

## Overview
Added comprehensive water intake tracking functionality to AthleteOS, allowing users to log and monitor their daily water consumption with visual progress indicators. Uses US customary units (fluid ounces and gallons).

## Implementation Details

### Database Schema (v2)
- **New Object Store**: `waterIntake`
  - `id`: UUID
  - `timestamp`: ISO 8601 timestamp
  - `date`: YYYY-MM-DD for grouping
  - `amount`: fluid ounces
  - `createdAt`: ISO 8601 timestamp
  - Indexes: `date`, `timestamp`

- **Updated UserProfile**:
  - Added `dailyWaterTarget?: number` (default: 128oz = 1 gallon)

### Services
- **waterIntakeService.ts**: Complete CRUD operations
  - `addWaterIntake()`: Log water consumption
  - `getWaterIntakeByDate()`: Retrieve entries for a specific date
  - `getDailyWaterTotal()`: Calculate total intake for a day (in oz)
  - `deleteWaterIntake()`: Remove an entry
  - `getAllWaterIntake()`: Export all entries

### UI Components

#### WaterIntakeCard (Nutrition Page)
- Visual water glass that fills based on percentage
- Quick add buttons: +8oz, +16oz, +32oz, Custom
- Entry history with timestamps
- Delete individual entries
- Shows remaining amount to reach target

#### DailyMetrics (Dashboard)
- Added water intake metric with droplet icon
- Displays current intake vs target
- Shows percentage completion
- Format: "64oz / 128oz (50%)"

### Pages Updated

#### Nutrition Page (`/nutrition`)
- Integrated WaterIntakeCard below daily totals
- Loads water data for selected date
- Handles adding and deleting water entries
- Syncs with date selector

#### Dashboard (`/`)
- Shows water intake summary in DailyMetrics
- Loads today's water total
- Respects user's daily target setting

#### Settings Page (`/settings`)
- Added "Daily Water Target" input field
- Default: 128oz (1 gallon)
- Range: 16-300oz
- Recommended: 64-128oz per day
- Saves to user profile

### Data Export/Import
- Updated `exportService.ts` to include water intake data
- Water entries included in JSON exports
- Restored during data imports

## User Experience

### Quick Logging
Users can quickly log water intake with preset amounts (8oz, 16oz, 32oz) or custom values, making it easy to track throughout the day.

### Visual Feedback
The animated water glass provides immediate visual feedback on progress toward daily goals.

### History Tracking
Users can see all water entries for the day with timestamps and delete mistakes.

### Configurable Targets
Users can set their own daily water targets based on personal needs and preferences. Default is 1 gallon (128oz).

## Units
- All water amounts stored and displayed in fluid ounces (oz)
- Default target: 128oz (1 gallon)
- Quick add increments: 8oz, 16oz, 32oz
- Recommended range: 64-128oz per day

## Technical Notes

- Database version upgraded from 1 to 2
- Backward compatible with existing data
- All TypeScript types properly defined
- No breaking changes to existing functionality
- Follows existing code patterns and conventions
