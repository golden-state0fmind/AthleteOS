# Tech Stack

AthleteOS is built with the following technology decisions:

## Framework & Deployment
- Next.js 14+ with App Router
- Deployed on Vercel
- TypeScript throughout the entire codebase

## AI Integration
- Anthropic Claude API (claude-sonnet-4-6)
- All Claude API calls are made server-side only
- API routes live in `/app/api/*`
- Never call Claude directly from client components

## Styling
- Tailwind CSS for all styling
- Dark-mode first design approach
- Mobile-first responsive design

## Data Storage
- IndexedDB for all health data persistence
- No backend database
- All data stored locally on user's device
- Storage types:
  - Workouts → `workouts` store
  - Nutrition logs → `nutrition` store
  - Supplements → `supplements` store
  - User profile → `profile` store

## PWA Configuration
- `next-pwa` plugin for service worker generation
- Offline support for all core features
- Installable on mobile home screen
- Storage persistence requested via `navigator.storage.persist()`

## Key Abstractions
- IndexedDB interactions: `/lib/db.ts`
- Claude API interactions: `/lib/claude.ts`
- Never bypass these abstractions in components
