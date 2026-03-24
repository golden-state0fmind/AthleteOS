# Architecture

AthleteOS architecture decisions and data flow:

## Application Type
- Mobile-first Progressive Web App (PWA)
- Installable on home screen
- Offline-capable for all core features

## Data Flow
```
Client Component → /app/api/* Route → Claude API → Response → Client
```

1. User interacts with client component
2. Component calls internal API route (`/app/api/*`)
3. API route calls Claude API server-side
4. Response flows back to client component
5. Component updates UI and optionally persists to IndexedDB

## Storage Architecture
- No backend database
- IndexedDB is the sole persistence layer
- All data stored locally on user's device

### IndexedDB Stores
- `profile` - User profile and preferences
- `workouts` - Workout logs and history
- `nutrition` - Nutrition logs and meal tracking
- `supplements` - Supplement logs and schedules

### Storage Persistence
- Request persistent storage via `navigator.storage.persist()` on first launch
- Prevents browser from evicting data under storage pressure

## Data Export
- JSON export feature allows users to back up all IndexedDB data
- Users can download complete data snapshot
- Enables data portability and backup

## Offline Strategy
- Service worker caches app shell and static assets
- IndexedDB provides offline data access
- Queue API requests when offline, sync when online
- Show offline indicator in UI when network unavailable

## Component Organization
- `/app/*` - Next.js App Router pages and API routes
- `/components/*` - Reusable React components
- `/lib/*` - Utility functions and abstractions
- `/types/*` - TypeScript type definitions
