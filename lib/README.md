# AthleteOS Database Module

This directory contains the IndexedDB initialization and data access layer for AthleteOS.

## Overview

The database module provides a privacy-first, client-side storage solution using IndexedDB. All user health data is stored locally in the browser, ensuring complete data privacy and enabling offline functionality.

## Database Schema

**Database Name:** `athleteos-db`  
**Version:** 1

### Object Stores

#### 1. userProfile
Stores a single user profile record.

- **Key Path:** `id` (always "singleton")
- **Indexes:** None
- **Fields:** name, age, weight, height, fitnessGoal, macroTargets, createdAt, updatedAt

#### 2. workouts
Stores workout entries from both image analysis and manual entry.

- **Key Path:** `id` (UUID)
- **Indexes:**
  - `timestamp` (non-unique) - for chronological queries
  - `exerciseType` (non-unique) - for filtering by exercise
- **Fields:** timestamp, source, exerciseType, estimatedReps, sets, duration, formFeedback, notes, createdAt

#### 3. nutrition
Stores nutrition entries with macro data.

- **Key Path:** `id` (UUID)
- **Indexes:**
  - `date` (non-unique) - for daily grouping (YYYY-MM-DD)
  - `timestamp` (non-unique) - for chronological queries
  - `status` (non-unique) - for filtering planned vs consumed
- **Fields:** timestamp, date, status, foodName, servingSize, macros, warnings, createdAt

#### 4. supplements
Stores supplement information with safety notes.

- **Key Path:** `id` (UUID)
- **Indexes:**
  - `active` (non-unique) - for filtering active supplements
  - `name` (non-unique) - for searching
- **Fields:** name, dosage, frequency, timing, safetyNotes, effectiveness, active, createdAt, updatedAt

#### 5. supplementChecklist
Stores daily supplement checklist entries.

- **Key Path:** `id` (UUID)
- **Indexes:**
  - `date` (non-unique) - for daily checklist
  - `supplementId` (non-unique) - for supplement history
  - `date_supplementId` (unique, compound) - ensures daily uniqueness per supplement
- **Fields:** supplementId, date, taken, takenAt

#### 6. chatHistory
Stores chat conversation history.

- **Key Path:** `id` (UUID)
- **Indexes:**
  - `timestamp` (non-unique) - for chronological display
- **Fields:** role, content, timestamp

## Usage

### Initialize Database

```typescript
import { initDB, closeDB } from './lib/db';

// Initialize on app startup
const db = await initDB();
console.log('Database ready:', db.name);
closeDB(db);
```

### Get Database Instance

```typescript
import { getDB, closeDB } from './lib/db';

// Get database instance
const db = await getDB();

// Use database...

// Always close when done
closeDB(db);
```

### Add Data

```typescript
import { getDB, closeDB } from './lib/db';
import type { WorkoutEntry } from './lib/types/db';

const db = await getDB();
const transaction = db.transaction('workouts', 'readwrite');
const store = transaction.objectStore('workouts');

const workout: WorkoutEntry = {
  id: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
  source: 'manual',
  exerciseType: 'Push-ups',
  estimatedReps: 20,
  sets: 3,
  duration: null,
  formFeedback: null,
  notes: 'Felt strong today',
  createdAt: new Date().toISOString(),
};

store.add(workout);

transaction.oncomplete = () => {
  console.log('Workout added successfully');
  closeDB(db);
};
```

### Query Data

```typescript
import { getDB, closeDB } from './lib/db';

const db = await getDB();
const transaction = db.transaction('workouts', 'readonly');
const store = transaction.objectStore('workouts');
const index = store.index('timestamp');

// Get all workouts ordered by timestamp (descending)
const request = index.openCursor(null, 'prev');
const workouts = [];

request.onsuccess = (event) => {
  const cursor = event.target.result;
  if (cursor) {
    workouts.push(cursor.value);
    cursor.continue();
  } else {
    console.log('Found workouts:', workouts);
    closeDB(db);
  }
};
```

### Delete Database

```typescript
import { deleteDB } from './lib/db';

// Delete entire database (use with caution!)
await deleteDB();
console.log('Database deleted');
```

## Type Safety

All database types are defined in `lib/types/db.ts`. Import these types for type-safe database operations:

```typescript
import type {
  UserProfile,
  WorkoutEntry,
  NutritionEntry,
  SupplementEntry,
  SupplementChecklistEntry,
  ChatMessage,
  MacroData,
  ExportData,
} from './lib/types/db';
```

## Examples

See `lib/examples/db-usage.ts` for complete working examples of common database operations.

## Testing

### Unit Tests
Run unit tests with mocked IndexedDB:
```bash
npm test lib/__tests__/db.test.ts
```

### Integration Tests
Integration tests require a browser environment. See `lib/__tests__/db.integration.test.ts` for manual testing instructions.

## Requirements Satisfied

This module satisfies the following requirements from the AthleteOS specification:

- **Requirement 4.1**: Workout Log Persistence
- **Requirement 8.1**: Nutrition Log Persistence
- **Requirement 11.4**: Supplement Logging
- **Requirement 14.3**: Daily Supplement Checklist
- **Requirement 24.1**: Local Data Privacy

## Future Enhancements

When upgrading to version 2, add migration logic in the `onupgradeneeded` handler:

```typescript
request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
  const db = (event.target as IDBOpenDBRequest).result;
  
  if (event.oldVersion < 1) {
    createSchemaV1(db);
  }
  
  if (event.oldVersion < 2) {
    // Add migration logic for version 2
    createSchemaV2(db);
  }
};
```
