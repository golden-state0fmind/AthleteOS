# Code Conventions

Follow these coding standards for all AthleteOS code:

## Component Standards
- All components are functional React components
- Use TypeScript for all files
- No class components

## File Naming
- Files: `kebab-case` (e.g., `user-profile.tsx`)
- Components: `PascalCase` (e.g., `UserProfile`)
- Utilities: `camelCase` (e.g., `formatDate`)

## API Routes
- All API routes live in `/app/api/`
- Follow REST conventions
- Use POST for all Claude interactions
- Return consistent error shape: `{ error: string }` with appropriate HTTP status codes
- Return consistent success shape with typed response data

## Data Access Patterns
- IndexedDB interactions are abstracted through `/lib/db.ts`
- Never call IndexedDB directly from components
- Claude API interactions are abstracted through `/lib/claude.ts`
- Never call Claude API directly from components

## Error Handling
- All API routes must handle errors gracefully
- Return `{ error: string }` on failure
- Use appropriate HTTP status codes:
  - 400 for bad requests
  - 401 for unauthorized
  - 500 for server errors
- Log errors server-side for debugging

## Type Safety
- All environment variables must be typed in `/types/env.d.ts`
- Use strict TypeScript configuration
- Avoid `any` types
- Define interfaces for all data structures
