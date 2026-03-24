# Security Rules

These security rules must NEVER be violated:

## API Key Management
- The Anthropic API key is stored exclusively in Vercel environment variables as `ANTHROPIC_API_KEY`
- `process.env.ANTHROPIC_API_KEY` may ONLY be referenced in files inside `/app/api/` directory
- No API keys, secrets, or sensitive values are ever hardcoded
- No API keys are ever referenced in client components

## API Call Architecture
- All Claude API calls MUST go through internal serverless API routes
- Never call Claude API directly from the browser
- Client components call `/app/api/*` routes, which then call Claude

## Data Privacy
- Images uploaded by users are processed in memory only
- Images are never persisted server-side
- All user health data is stored in IndexedDB on the user's device only
- No user data is sent to any server except for AI analysis requests
- No user data is stored on Vercel or any backend

## Environment Variables
- All environment variables must be typed in `/types/env.d.ts`
- Use `process.env` only in server-side code
- Never expose environment variables to client bundle
