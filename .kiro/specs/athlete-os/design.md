# Design Document: AthleteOS

## Overview

AthleteOS is a Progressive Web App (PWA) that provides AI-powered fitness coaching through a mobile-first, privacy-focused architecture. The system leverages Next.js deployed on Vercel's serverless platform, with Claude API integration for intelligent image analysis and conversational coaching. All user health data is stored locally in IndexedDB, ensuring privacy while enabling offline functionality.

### Key Design Principles

1. **Privacy-First**: All personal health data remains on the user's device; only transient analysis requests are sent to the server
2. **Offline-Capable**: Core functionality (viewing logs, manual entry) works without internet connectivity
3. **Mobile-Optimized**: Touch-friendly UI with one-handed navigation and responsive design from 320px to 1920px
4. **Performance-Focused**: Dark theme with electric accents, sub-300ms animations, and optimized asset loading
5. **Secure by Default**: HTTPS-only, server-side API key management, no image persistence

### Technology Stack

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: React Context + IndexedDB for persistence
- **API Integration**: Anthropic Claude API (claude-sonnet-4)
- **Deployment**: Vercel (serverless functions)
- **Storage**: IndexedDB (client-side only)
- **PWA**: Service Worker + Web Manifest

## Architecture

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Client (Browser)"
        UI[React UI Components]
        SW[Service Worker]
        IDB[(IndexedDB)]
        UI --> IDB
        SW --> IDB
    end
    
    subgraph "Vercel Edge Network"
        CDN[Static Assets CDN]
        SW -.cache.-> CDN
    end
    
    subgraph "Vercel Serverless"
        API1[/api/analyze-workout]
        API2[/api/analyze-nutrition]
        API3[/api/analyze-supplement]
        API4[/api/chat]
    end
    
    subgraph "External Services"
        CLAUDE[Claude API]
    end
    
    UI -->|Image Upload| API1
    UI -->|Image Upload| API2
    UI -->|Supplement Data| API3
    UI -->|Chat Message + Context| API4
    
    API1 -->|Vision Analysis| CLAUDE
    API2 -->|Vision Analysis| CLAUDE
    API3 -->|Text Analysis| CLAUDE
    API4 -->|Conversational| CLAUDE
    
    CLAUDE -->|Analysis Results| API1
    CLAUDE -->|Macro Data| API2
    CLAUDE -->|Safety Notes| API3
    CLAUDE -->|Response| API4
    
    API1 -->|JSON Response| UI
    API2 -->|JSON Response| UI
    API3 -->|JSON Response| UI
    API4 -->|JSON Response| UI
```

### Deployment Architecture

**Vercel Serverless Functions**:
- Each API route is deployed as an independent serverless function
- Functions execute in Node.js runtime with 10-second timeout
- Environment variables (ANTHROPIC_API_KEY) injected at runtime
- Automatic HTTPS enforcement via Vercel edge network

**Client Deployment**:
- Static assets (HTML, CSS, JS) served via Vercel CDN
- Service Worker registered on first visit for PWA capabilities
- App shell cached for offline access

### Data Flow Patterns

**Online Mode - Image Analysis**:
1. User uploads image via UI
2. Image converted to base64 in browser
3. POST request to serverless API route
4. Serverless function forwards to Claude API with vision
5. Claude returns structured analysis
6. Serverless function returns JSON to client
7. Client stores results in IndexedDB
8. Image data discarded (never persisted)

**Online Mode - Chat**:
1. User sends message via chat UI
2. Client retrieves recent logs from IndexedDB
3. POST request with message + context to /api/chat
4. Serverless function constructs prompt with context
5. Claude returns conversational response
6. Response displayed in UI (context not persisted server-side)

**Offline Mode**:
1. Service Worker intercepts requests
2. Static assets served from cache
3. IndexedDB queries succeed locally
4. API-dependent features disabled with UI feedback
5. Manual entry and checklist updates queue locally

## Components and Interfaces

### Frontend Component Structure

```
app/
├── layout.tsx                 # Root layout with PWA meta tags
├── page.tsx                   # Dashboard home screen
├── onboarding/
│   └── page.tsx              # User profile onboarding flow
├── workouts/
│   ├── page.tsx              # Workout log list view
│   ├── upload/
│   │   └── page.tsx          # Workout image upload
│   └── manual/
│       └── page.tsx          # Manual workout entry form
├── nutrition/
│   ├── page.tsx              # Nutrition log grouped by date
│   └── upload/
│       └── page.tsx          # Nutrition label upload
├── supplements/
│   ├── page.tsx              # Supplement log and checklist
│   └── add/
│       └── page.tsx          # Add supplement form
├── chat/
│   └── page.tsx              # AI coach chat interface
└── settings/
    └── page.tsx              # Profile editing and data export

components/
├── ui/
│   ├── Button.tsx            # Touch-friendly button component
│   ├── Card.tsx              # Content card with dark theme
│   ├── Input.tsx             # Form input with validation
│   ├── Modal.tsx             # Modal dialog component
│   └── ProgressBar.tsx       # Macro progress visualization
├── layout/
│   ├── Navigation.tsx        # Bottom tab navigation
│   └── Header.tsx            # Screen header with back button
├── dashboard/
│   ├── DailyMetrics.tsx      # Today's calorie/workout/supplement counts
│   ├── QuickChat.tsx         # Quick-access chat input
│   └── StreakDisplay.tsx     # Workout streak visualization
├── workouts/
│   ├── WorkoutCard.tsx       # Individual workout entry display
│   ├── WorkoutList.tsx       # Scrollable workout history
│   ├── ImageUploader.tsx     # Image upload with preview
│   └── ProgressStats.tsx     # Streak and frequency stats
├── nutrition/
│   ├── NutritionCard.tsx     # Individual nutrition entry
│   ├── DailyTotals.tsx       # Aggregated macro totals
│   ├── MacroProgress.tsx     # Progress bars for macro targets
│   └── GoalWarning.tsx       # Conflict warning display
├── supplements/
│   ├── SupplementCard.tsx    # Supplement entry with safety notes
│   ├── DailyChecklist.tsx    # Today's supplement checklist
│   └── InteractionWarning.tsx # Interaction alert modal
└── chat/
    ├── MessageList.tsx       # Chat conversation history
    ├── MessageBubble.tsx     # Individual message display
    └── ChatInput.tsx         # Message input with send button
```

### API Route Specifications

#### POST /api/analyze-workout

**Purpose**: Analyze workout images using Claude vision capabilities

**Request**:
```typescript
{
  image: string;        // base64-encoded image data
  mimeType: string;     // "image/jpeg" | "image/png" | "image/webp"
}
```

**Response** (200):
```typescript
{
  exerciseType: string;      // e.g., "Push-ups", "Squats"
  estimatedReps: number | null;
  formFeedback: string;      // AI-generated form analysis
  confidence: "high" | "medium" | "low";
}
```

**Error Responses**:
- 400: Invalid image format or size exceeds 10MB
- 429: Claude API rate limit exceeded
- 500: Claude API error or server error
- 503: Claude API unavailable

**Implementation Notes**:
- Image processed in memory only
- Uses claude-sonnet-4 model
- Prompt engineered to return structured exercise data
- Image data discarded after analysis

#### POST /api/analyze-nutrition

**Purpose**: Extract nutrition data from food label images

**Request**:
```typescript
{
  image: string;        // base64-encoded image data
  mimeType: string;     // "image/jpeg" | "image/png" | "image/webp"
}
```

**Response** (200):
```typescript
{
  foodName: string | null;
  servingSize: string | null;
  macros: {
    calories: number | null;
    protein: number | null;      // grams
    carbohydrates: number | null; // grams
    fats: number | null;          // grams
    sugar: number | null;         // grams
    sodium: number | null;        // milligrams
  };
  confidence: "high" | "medium" | "low";
}
```

**Error Responses**:
- 400: Invalid image format or size exceeds 10MB
- 429: Claude API rate limit exceeded
- 500: Claude API error or server error
- 503: Claude API unavailable

**Implementation Notes**:
- Partial data returned if some fields unreadable
- Null values for missing/unreadable fields
- Image discarded after extraction

#### POST /api/analyze-supplement

**Purpose**: Provide safety and effectiveness analysis for supplements

**Request**:
```typescript
{
  supplementName: string;
  dosage: string;
  allSupplements?: Array<{  // For interaction detection
    name: string;
    dosage: string;
  }>;
}
```

**Response** (200):
```typescript
{
  safetyNotes: string;           // Brief safety information
  effectiveness: string;          // Effectiveness summary
  interactions: Array<{
    supplement1: string;
    supplement2: string;
    severity: "high" | "medium" | "low";
    description: string;
  }> | null;
}
```

**Error Responses**:
- 400: Missing required fields
- 429: Claude API rate limit exceeded
- 500: Claude API error or server error
- 503: Claude API unavailable

**Implementation Notes**:
- Uses text-only Claude API (no vision)
- Interaction detection when allSupplements provided
- Medical disclaimer included in safety notes

#### POST /api/chat

**Purpose**: Conversational AI coaching with user context

**Request**:
```typescript
{
  message: string;
  context: {
    userProfile: {
      name: string;
      age: number;
      weight: number;      // kg
      height: number;      // cm
      fitnessGoal: "lose weight" | "build muscle" | "maintain" | "performance";
    };
    recentWorkouts: Array<{
      timestamp: string;
      exerciseType: string;
      reps: number | null;
      sets: number | null;
    }>;  // Last 7 days
    todayNutrition: {
      entries: Array<{
        foodName: string;
        macros: MacroData;
      }>;
      dailyTotals: MacroData;
    };
    activeSupplements: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
  };
}
```

**Response** (200):
```typescript
{
  response: string;  // AI-generated conversational response
}
```

**Error Responses**:
- 400: Missing message or invalid context
- 429: Claude API rate limit exceeded
- 500: Claude API error or server error
- 503: Claude API unavailable

**Implementation Notes**:
- Context appended to system prompt
- Conversational history not persisted server-side
- Responses reference specific user data when relevant
- Uses claude-sonnet-4 model

## Data Models

### IndexedDB Schema

**Database Name**: `athleteos-db`  
**Version**: 1

#### Object Store: `userProfile`

```typescript
interface UserProfile {
  id: "singleton";  // Single record
  name: string;
  age: number;
  weight: number;      // kg
  height: number;      // cm
  fitnessGoal: "lose weight" | "build muscle" | "maintain" | "performance";
  macroTargets?: {
    calories: number;
    protein: number;      // grams
    carbohydrates: number; // grams
    fats: number;         // grams
  };
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

**Indexes**: None (single record)

#### Object Store: `workouts`

```typescript
interface WorkoutEntry {
  id: string;           // UUID
  timestamp: string;    // ISO 8601 timestamp
  source: "image" | "manual";
  exerciseType: string;
  estimatedReps: number | null;
  sets: number | null;
  duration: number | null;  // minutes
  formFeedback: string | null;
  notes: string | null;
  createdAt: string;    // ISO 8601 timestamp
}
```

**Indexes**:
- `timestamp` (non-unique, for chronological queries)
- `exerciseType` (non-unique, for filtering by exercise)

#### Object Store: `nutrition`

```typescript
interface NutritionEntry {
  id: string;           // UUID
  timestamp: string;    // ISO 8601 timestamp
  date: string;         // YYYY-MM-DD for grouping
  status: "planned" | "consumed";
  foodName: string;
  servingSize: string | null;
  macros: {
    calories: number | null;
    protein: number | null;
    carbohydrates: number | null;
    fats: number | null;
    sugar: number | null;
    sodium: number | null;
  };
  warnings: Array<{
    type: "goal_conflict" | "high_sodium";
    message: string;
  }>;
  createdAt: string;    // ISO 8601 timestamp
}
```

**Indexes**:
- `date` (non-unique, for daily grouping)
- `timestamp` (non-unique, for chronological queries)
- `status` (non-unique, for filtering planned vs consumed)

#### Object Store: `supplements`

```typescript
interface SupplementEntry {
  id: string;           // UUID
  name: string;
  dosage: string;
  frequency: "daily" | "twice_daily" | "weekly" | "as_needed";
  timing: string;       // e.g., "morning", "with meals"
  safetyNotes: string;
  effectiveness: string;
  active: boolean;      // For soft deletion
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

**Indexes**:
- `active` (non-unique, for filtering active supplements)
- `name` (non-unique, for searching)

#### Object Store: `supplementChecklist`

```typescript
interface SupplementChecklistEntry {
  id: string;           // UUID
  supplementId: string; // Foreign key to supplements
  date: string;         // YYYY-MM-DD
  taken: boolean;
  takenAt: string | null; // ISO 8601 timestamp
}
```

**Indexes**:
- `date` (non-unique, for daily checklist)
- `supplementId` (non-unique, for supplement history)
- Compound index: `[date, supplementId]` (unique, for daily uniqueness)

#### Object Store: `chatHistory`

```typescript
interface ChatMessage {
  id: string;           // UUID
  role: "user" | "assistant";
  content: string;
  timestamp: string;    // ISO 8601 timestamp
}
```

**Indexes**:
- `timestamp` (non-unique, for chronological display)

### Data Access Layer

**Service Pattern**: Each data domain has a dedicated service module

```typescript
// services/userProfileService.ts
export async function getUserProfile(): Promise<UserProfile | null>;
export async function createUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile>;
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile>;

// services/workoutService.ts
export async function addWorkout(workout: Omit<WorkoutEntry, 'id' | 'createdAt'>): Promise<WorkoutEntry>;
export async function getWorkouts(limit?: number): Promise<WorkoutEntry[]>;
export async function getWorkoutsByDateRange(startDate: string, endDate: string): Promise<WorkoutEntry[]>;
export async function calculateWorkoutStreak(): Promise<{ current: number; longest: number }>;

// services/nutritionService.ts
export async function addNutritionEntry(entry: Omit<NutritionEntry, 'id' | 'createdAt'>): Promise<NutritionEntry>;
export async function getNutritionByDate(date: string): Promise<NutritionEntry[]>;
export async function getDailyTotals(date: string): Promise<MacroData>;
export async function updateEntryStatus(id: string, status: "planned" | "consumed"): Promise<void>;

// services/supplementService.ts
export async function addSupplement(supplement: Omit<SupplementEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplementEntry>;
export async function getActiveSupplements(): Promise<SupplementEntry[]>;
export async function deactivateSupplement(id: string): Promise<void>;
export async function getTodayChecklist(date: string): Promise<Array<SupplementEntry & { taken: boolean }>>;
export async function markSupplementTaken(supplementId: string, date: string): Promise<void>;

// services/chatService.ts
export async function addChatMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage>;
export async function getChatHistory(limit?: number): Promise<ChatMessage[]>;
export async function clearChatHistory(): Promise<void>;
```

### Data Export Format

```typescript
interface ExportData {
  version: "1.0";
  exportedAt: string;  // ISO 8601 timestamp
  userProfile: UserProfile;
  workouts: WorkoutEntry[];
  nutrition: NutritionEntry[];
  supplements: SupplementEntry[];
  supplementChecklist: SupplementChecklistEntry[];
  chatHistory: ChatMessage[];
}
```


## PWA Configuration

### Web Manifest

**File**: `public/manifest.json`

```json
{
  "name": "AthleteOS",
  "short_name": "AthleteOS",
  "description": "AI-Powered Personal Fitness Assistant",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#10b981",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Service Worker Strategy

**File**: `public/sw.js`

**Caching Strategy**:

1. **App Shell** (Cache First):
   - HTML pages
   - CSS bundles
   - JavaScript bundles
   - Fonts
   - Static images (logo, icons)

2. **API Routes** (Network Only):
   - All `/api/*` routes require network
   - Fail gracefully with offline detection

3. **Dynamic Content** (Network First, Cache Fallback):
   - User-uploaded images (transient, not cached)

**Service Worker Lifecycle**:

```javascript
// Install: Cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('athleteos-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/manifest.json',
        // Static assets added by Next.js build
      ]);
    })
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('athleteos-') && name !== 'athleteos-v1')
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch: Route-based strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API routes: Network only
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline - AI features unavailable' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // App shell: Cache first
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});
```

**Registration**: `app/layout.tsx`

```typescript
useEffect(() => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
}, []);
```

### Offline Detection

**Hook**: `hooks/useOnlineStatus.ts`

```typescript
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

**UI Feedback**:
- Persistent banner when offline
- Disabled state for AI-dependent features
- Toast notification when connectivity restored

## Integration Patterns with Claude API

### API Client Configuration

**File**: `lib/claudeClient.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

export const claudeClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

export const DEFAULT_MAX_TOKENS = 1024;
```

### Vision Analysis Pattern

**Used by**: `/api/analyze-workout`, `/api/analyze-nutrition`

```typescript
// Shared utility: lib/visionAnalysis.ts
export async function analyzeImageWithClaude(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const message = await claudeClient.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: DEFAULT_MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}
```

**Workout Analysis Prompt**:
```
Analyze this workout image and provide:
1. Exercise type (e.g., "Push-ups", "Squats", "Deadlift")
2. Estimated repetitions visible (or null if not countable)
3. Form feedback (brief assessment of technique)

Return ONLY valid JSON in this exact format:
{
  "exerciseType": "string",
  "estimatedReps": number or null,
  "formFeedback": "string",
  "confidence": "high" | "medium" | "low"
}
```

**Nutrition Analysis Prompt**:
```
Extract nutrition information from this food label image. Provide:
1. Food name
2. Serving size
3. Macronutrients: calories, protein (g), carbohydrates (g), fats (g), sugar (g), sodium (mg)

Return ONLY valid JSON in this exact format:
{
  "foodName": "string or null",
  "servingSize": "string or null",
  "macros": {
    "calories": number or null,
    "protein": number or null,
    "carbohydrates": number or null,
    "fats": number or null,
    "sugar": number or null,
    "sodium": number or null
  },
  "confidence": "high" | "medium" | "low"
}

Use null for any values that cannot be read from the label.
```

### Text Analysis Pattern

**Used by**: `/api/analyze-supplement`

```typescript
// lib/supplementAnalysis.ts
export async function analyzeSupplementWithClaude(
  supplementName: string,
  dosage: string,
  allSupplements?: Array<{ name: string; dosage: string }>
): Promise<{ safetyNotes: string; effectiveness: string; interactions: any[] | null }> {
  let prompt = `Provide brief safety and effectiveness information for this supplement:
Supplement: ${supplementName}
Dosage: ${dosage}

IMPORTANT: Include a disclaimer that this is not medical advice.`;

  if (allSupplements && allSupplements.length > 1) {
    prompt += `\n\nThe user is also taking these supplements:\n`;
    allSupplements
      .filter((s) => s.name !== supplementName)
      .forEach((s) => {
        prompt += `- ${s.name} (${s.dosage})\n`;
      });
    prompt += `\nIdentify any potential interactions between these supplements.`;
  }

  prompt += `\n\nReturn ONLY valid JSON in this exact format:
{
  "safetyNotes": "string",
  "effectiveness": "string",
  "interactions": [
    {
      "supplement1": "string",
      "supplement2": "string",
      "severity": "high" | "medium" | "low",
      "description": "string"
    }
  ] or null
}`;

  const message = await claudeClient.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: DEFAULT_MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
  return JSON.parse(responseText);
}
```

### Conversational Pattern with Context

**Used by**: `/api/chat`

```typescript
// lib/chatWithContext.ts
export async function chatWithClaude(
  userMessage: string,
  context: ChatContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);

  const message = await claudeClient.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

function buildSystemPrompt(context: ChatContext): string {
  const { userProfile, recentWorkouts, todayNutrition, activeSupplements } = context;

  let prompt = `You are an AI fitness coach for AthleteOS. Provide personalized, actionable advice based on the user's data.

USER PROFILE:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Weight: ${userProfile.weight} kg
- Height: ${userProfile.height} cm
- Fitness Goal: ${userProfile.fitnessGoal}
`;

  if (userProfile.macroTargets) {
    prompt += `- Daily Macro Targets: ${userProfile.macroTargets.calories} cal, ${userProfile.macroTargets.protein}g protein, ${userProfile.macroTargets.carbohydrates}g carbs, ${userProfile.macroTargets.fats}g fats\n`;
  }

  if (recentWorkouts.length > 0) {
    prompt += `\nRECENT WORKOUTS (Last 7 days):\n`;
    recentWorkouts.forEach((w) => {
      prompt += `- ${new Date(w.timestamp).toLocaleDateString()}: ${w.exerciseType}`;
      if (w.reps) prompt += ` (${w.reps} reps`;
      if (w.sets) prompt += `, ${w.sets} sets`;
      prompt += `)\n`;
    });
  }

  if (todayNutrition.entries.length > 0) {
    prompt += `\nTODAY'S NUTRITION:\n`;
    todayNutrition.entries.forEach((e) => {
      prompt += `- ${e.foodName}: ${e.macros.calories || '?'} cal, ${e.macros.protein || '?'}g protein\n`;
    });
    prompt += `Daily Totals: ${todayNutrition.dailyTotals.calories || 0} cal, ${todayNutrition.dailyTotals.protein || 0}g protein, ${todayNutrition.dailyTotals.carbohydrates || 0}g carbs, ${todayNutrition.dailyTotals.fats || 0}g fats\n`;
  }

  if (activeSupplements.length > 0) {
    prompt += `\nACTIVE SUPPLEMENTS:\n`;
    activeSupplements.forEach((s) => {
      prompt += `- ${s.name} (${s.dosage}, ${s.frequency})\n`;
    });
  }

  prompt += `\nProvide concise, motivating responses. Reference specific data when relevant. Always include a disclaimer that you're not a medical professional for health-related questions.`;

  return prompt;
}
```

### Error Handling and Retry Logic

```typescript
// lib/apiErrorHandler.ts
export class ClaudeAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'ClaudeAPIError';
  }
}

export async function handleClaudeAPICall<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    // Rate limit
    if (error.status === 429) {
      const retryAfter = error.headers?.['retry-after'] || 60;
      throw new ClaudeAPIError(
        'Rate limit exceeded. Please try again later.',
        429,
        retryAfter
      );
    }

    // Server error
    if (error.status >= 500) {
      throw new ClaudeAPIError('Claude API is temporarily unavailable.', 503);
    }

    // Client error
    if (error.status >= 400) {
      throw new ClaudeAPIError('Invalid request to Claude API.', 400);
    }

    // Unknown error
    throw new ClaudeAPIError('An unexpected error occurred.', 500);
  }
}
```

## Security Architecture

### API Key Management

**Environment Variables** (Vercel):
```
ANTHROPIC_API_KEY=sk-ant-...
```

**Access Pattern**:
- API key stored in Vercel project settings
- Injected at runtime into serverless functions
- Never exposed in client-side code
- Never logged or returned in responses

**Validation**:
```typescript
// lib/validateEnv.ts
export function validateEnvironment() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }
}

// Called in each API route
validateEnvironment();
```

### HTTPS Enforcement

**Vercel Configuration**:
- Automatic HTTPS via Vercel edge network
- HTTP requests automatically redirected to HTTPS
- Service Worker registration requires HTTPS (enforced by browser)

**Content Security Policy** (`next.config.js`):
```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob:;
      connect-src 'self' https://api.anthropic.com;
      font-src 'self';
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Image Processing Security

**Size Validation**:
```typescript
// lib/imageValidation.ts
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateImageUpload(base64Data: string, mimeType: string): void {
  // Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(mimeType)) {
    throw new Error('Invalid image format. Only JPEG, PNG, and WebP are supported.');
  }

  // Validate size
  const sizeInBytes = (base64Data.length * 3) / 4;
  if (sizeInBytes > MAX_IMAGE_SIZE) {
    throw new Error('Image size exceeds 10MB limit.');
  }
}
```

**Memory Management**:
- Images processed in serverless function memory
- No disk writes
- Automatic cleanup when function execution completes
- No image data persisted in logs

### Data Privacy

**Client-Side Storage**:
- All health data in IndexedDB (origin-scoped)
- No cookies for user data
- No localStorage for sensitive data
- IndexedDB encrypted by browser (OS-level)

**Server-Side Privacy**:
- Chat context not persisted after response
- No user tracking or analytics on health data
- No third-party scripts with access to health data
- API routes stateless (no session storage)

**Data Export Security**:
```typescript
// services/exportService.ts
export async function exportUserData(): Promise<Blob> {
  const data: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    userProfile: await getUserProfile(),
    workouts: await getWorkouts(),
    nutrition: await getAllNutrition(),
    supplements: await getAllSupplements(),
    supplementChecklist: await getAllChecklistEntries(),
    chatHistory: await getChatHistory(),
  };

  // Client-side encryption option (future enhancement)
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}
```

### Input Sanitization

**API Route Validation**:
```typescript
// lib/validation.ts
import { z } from 'zod';

export const WorkoutImageSchema = z.object({
  image: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.object({
    userProfile: z.object({
      name: z.string(),
      age: z.number().min(13).max(120),
      weight: z.number().min(20).max(300),
      height: z.number().min(100).max(250),
      fitnessGoal: z.enum(['lose weight', 'build muscle', 'maintain', 'performance']),
    }),
    recentWorkouts: z.array(z.any()),
    todayNutrition: z.any(),
    activeSupplements: z.array(z.any()),
  }),
});

// Usage in API route
export async function POST(request: Request) {
  const body = await request.json();
  const validated = ChatRequestSchema.parse(body); // Throws if invalid
  // ... proceed with validated data
}
```

## Offline-First Data Flow

### Data Synchronization Strategy

**No Server Sync**: AthleteOS is fully client-side for data storage. There is no server-side database or sync mechanism. All data lives in IndexedDB.

### Offline Capabilities

**Available Offline**:
1. View all logged data (workouts, nutrition, supplements)
2. Manual workout entry
3. Supplement checklist updates
4. Profile editing
5. Data export
6. Dashboard metrics calculation

**Unavailable Offline**:
1. Image analysis (workout, nutrition)
2. Supplement safety analysis
3. AI chat
4. Interaction detection

### Offline UI Patterns

**Feature Gating**:
```typescript
// components/OfflineGate.tsx
export function OfflineGate({ children, fallback }: Props) {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return fallback || (
      <div className="text-gray-400 text-center p-4">
        <WifiOffIcon className="w-12 h-12 mx-auto mb-2" />
        <p>This feature requires an internet connection</p>
      </div>
    );
  }

  return <>{children}</>;
}

// Usage
<OfflineGate>
  <ImageUploadButton />
</OfflineGate>
```

**Offline Banner**:
```typescript
// components/OfflineBanner.tsx
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-yellow-900/50 text-yellow-200 px-4 py-2 text-sm text-center">
      You're offline. AI features are unavailable.
    </div>
  );
}
```

### IndexedDB Transaction Patterns

**Read Pattern**:
```typescript
async function getWorkouts(): Promise<WorkoutEntry[]> {
  const db = await openDB();
  const tx = db.transaction('workouts', 'readonly');
  const store = tx.objectStore('workouts');
  const index = store.index('timestamp');
  
  const workouts = await index.getAll();
  await tx.done;
  
  return workouts.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
```

**Write Pattern**:
```typescript
async function addWorkout(workout: Omit<WorkoutEntry, 'id' | 'createdAt'>): Promise<WorkoutEntry> {
  const db = await openDB();
  const tx = db.transaction('workouts', 'readwrite');
  const store = tx.objectStore('workouts');
  
  const entry: WorkoutEntry = {
    ...workout,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  await store.add(entry);
  await tx.done;
  
  return entry;
}
```

**Aggregation Pattern** (Daily Totals):
```typescript
async function getDailyTotals(date: string): Promise<MacroData> {
  const db = await openDB();
  const tx = db.transaction('nutrition', 'readonly');
  const store = tx.objectStore('nutrition');
  const index = store.index('date');
  
  const entries = await index.getAll(date);
  await tx.done;
  
  return entries.reduce(
    (totals, entry) => ({
      calories: (totals.calories || 0) + (entry.macros.calories || 0),
      protein: (totals.protein || 0) + (entry.macros.protein || 0),
      carbohydrates: (totals.carbohydrates || 0) + (entry.macros.carbohydrates || 0),
      fats: (totals.fats || 0) + (entry.macros.fats || 0),
      sugar: (totals.sugar || 0) + (entry.macros.sugar || 0),
      sodium: (totals.sodium || 0) + (entry.macros.sodium || 0),
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fats: 0, sugar: 0, sodium: 0 }
  );
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Key Never Exposed

*For any* API response or client-side code bundle, the response should never contain the Anthropic API key or any substring matching the pattern `sk-ant-`.

**Validates: Requirements 1.3**

### Property 2: Image Format Validation

*For any* valid image in JPEG, PNG, or WebP format, the upload validation should accept the image, and for any image in an unsupported format, the validation should reject it.

**Validates: Requirements 2.2, 6.2**

### Property 3: Error Message Display

*For any* error response from an API route, the UI should display a user-friendly error message to the user.

**Validates: Requirements 2.5, 27.5**

### Property 4: Workout Analysis Response Structure

*For any* successful workout analysis response from `/api/analyze-workout`, the response should contain all required fields: `exerciseType` (string), `estimatedReps` (number or null), `formFeedback` (string), and `confidence` (enum).

**Validates: Requirements 3.3**

### Property 5: API Error Handling

*For any* error encountered in a serverless route, the route should return an appropriate HTTP status code (400 for client errors, 500 for server errors, 503 for service unavailability, 429 for rate limits) and a JSON response with a descriptive error message.

**Validates: Requirements 3.5, 27.2, 27.3, 27.4**

### Property 6: Workout Data Persistence Round Trip

*For any* workout entry data, storing it in IndexedDB and then retrieving it should return data equivalent to the original entry.

**Validates: Requirements 4.1**

### Property 7: Workout Data Integrity

*For any* workout entry stored in IndexedDB, the entry should contain all required fields: `id`, `timestamp`, `source`, `exerciseType`, and `createdAt`.

**Validates: Requirements 4.2**

### Property 8: Workout History Sorting

*For any* set of workout entries retrieved from IndexedDB, the entries should be sorted by timestamp in descending order (most recent first).

**Validates: Requirements 4.3**

### Property 9: Workout Streak Calculation

*For any* set of workout entries, the calculated current streak should equal the number of consecutive days (from today backward) that contain at least one workout entry.

**Validates: Requirements 4.4, 28.2**

### Property 10: Longest Workout Streak Calculation

*For any* workout history, the calculated longest streak should equal the maximum number of consecutive days with workouts across the entire history.

**Validates: Requirements 28.3**

### Property 11: IndexedDB Persistence

*For any* data stored in IndexedDB (workouts, nutrition, supplements, profile), the data should remain accessible after simulating a browser session restart (closing and reopening the database connection).

**Validates: Requirements 4.5, 8.5**

### Property 12: Manual Workout Entry Persistence

*For any* manually entered workout data, storing it should result in a retrievable entry in the workout log with `source` field set to "manual".

**Validates: Requirements 5.3**

### Property 13: Mixed Source Workout Display

*For any* combination of image-analyzed and manually-entered workouts, all entries should appear in the same workout log list regardless of source.

**Validates: Requirements 5.4**

### Property 14: Nutrition Analysis Response Structure

*For any* successful nutrition analysis response from `/api/analyze-nutrition`, the response should contain `foodName`, `servingSize`, `macros` object with all six fields (calories, protein, carbohydrates, fats, sugar, sodium), and `confidence`.

**Validates: Requirements 7.3**

### Property 15: Partial Nutrition Data Handling

*For any* nutrition analysis where some fields cannot be extracted, the response should use `null` for missing fields rather than omitting them or using placeholder values.

**Validates: Requirements 7.5**

### Property 16: Nutrition Data Persistence Round Trip

*For any* nutrition entry data, storing it in IndexedDB and then retrieving it should return data equivalent to the original entry.

**Validates: Requirements 8.1**

### Property 17: Nutrition Data Integrity

*For any* nutrition entry stored in IndexedDB, the entry should contain all required fields: `id`, `timestamp`, `date`, `status`, `foodName`, `macros`, and `createdAt`.

**Validates: Requirements 8.2**

### Property 18: Nutrition Grouping by Date

*For any* set of nutrition entries, retrieving entries grouped by date should return only entries matching the specified date string (YYYY-MM-DD format).

**Validates: Requirements 8.3**

### Property 19: Daily Macro Totals Calculation

*For any* set of nutrition entries on a given date, the calculated daily totals should equal the sum of each macro field (calories, protein, carbohydrates, fats, sugar, sodium) across all entries for that date.

**Validates: Requirements 8.4, 19.2**

### Property 20: Nutrition Entry Status Update

*For any* nutrition entry, updating its status from "planned" to "consumed" (or vice versa) should persist the change and be reflected in subsequent retrievals.

**Validates: Requirements 9.1**

### Property 21: Default Nutrition Status

*For any* newly created nutrition entry, the status field should default to "planned" if not explicitly specified.

**Validates: Requirements 9.2**

### Property 22: Planned and Consumed in Daily Totals

*For any* date with both "planned" and "consumed" nutrition entries, the daily totals calculation should include entries of both statuses.

**Validates: Requirements 9.4**

### Property 23: High Calorie Warning for Weight Loss

*For any* nutrition entry where the fitness goal is "lose weight" and the food item contains more than 500 calories per serving, a warning message should be generated.

**Validates: Requirements 10.2**

### Property 24: Low Protein Message for Muscle Building

*For any* nutrition entry where the fitness goal is "build muscle" and the food item contains less than 10g protein per serving, an informational message should be generated.

**Validates: Requirements 10.3**

### Property 25: High Sodium Warning

*For any* nutrition entry where the food item contains more than 1000mg sodium per serving, a warning message should be generated regardless of fitness goal.

**Validates: Requirements 10.4**

### Property 26: Supplement Data Persistence Round Trip

*For any* supplement entry data, storing it in IndexedDB and then retrieving it should return data equivalent to the original entry.

**Validates: Requirements 11.4**

### Property 27: Supplement Analysis Response Structure

*For any* successful supplement analysis response from `/api/analyze-supplement`, the response should contain `safetyNotes` (string), `effectiveness` (string), and `interactions` (array or null).

**Validates: Requirements 12.3**

### Property 28: Safety Notes Display

*For any* supplement entry with safety notes, the notes should be displayed alongside the supplement in the supplement log UI.

**Validates: Requirements 12.5**

### Property 29: Interaction Warning Display

*For any* supplement analysis response that includes interactions with severity level, a warning message should be displayed to the user with the interaction details.

**Validates: Requirements 13.3**

### Property 30: Daily Supplement Checklist Filtering

*For any* given date, the daily supplement checklist should include only supplements that are active and scheduled for that day based on their frequency.

**Validates: Requirements 14.1**

### Property 31: Supplement Taken Status Update

*For any* supplement in the daily checklist, marking it as taken should update the checklist state and persist the change with a timestamp.

**Validates: Requirements 14.2, 14.3**

### Property 32: Checklist Completion Percentage

*For any* daily supplement checklist state, the completion percentage should equal (supplements taken / supplements scheduled) × 100.

**Validates: Requirements 14.5**

### Property 33: Chat Context Construction

*For any* chat request, the constructed context should include: user profile data, workout entries from the last 7 days, nutrition entries from the current day with daily totals, and all active supplements.

**Validates: Requirements 15.3, 16.1, 16.2, 16.3**

### Property 34: Chat History Display

*For any* chat conversation, all messages (both user and assistant) should be displayed in chronological order in the chat interface.

**Validates: Requirements 15.6**

### Property 35: User Profile Persistence Round Trip

*For any* user profile data, storing it in IndexedDB during onboarding and then retrieving it should return data equivalent to the original profile.

**Validates: Requirements 17.4**

### Property 36: Onboarding Skip After Profile Creation

*For any* application state where a user profile exists in IndexedDB, the onboarding flow should not be displayed.

**Validates: Requirements 17.5**

### Property 37: Profile Update Persistence

*For any* user profile update, saving the changes should persist them to IndexedDB and subsequent retrievals should reflect the updated values.

**Validates: Requirements 18.3**

### Property 38: Updated Profile in Context

*For any* profile update followed by a chat request or goal conflict check, the system should use the updated profile data rather than cached or stale data.

**Validates: Requirements 18.4**

### Property 39: Dashboard Workout Count

*For any* given date, the dashboard workout count should equal the number of workout entries with timestamps on that date.

**Validates: Requirements 19.3**

### Property 40: Dashboard Supplement Count

*For any* given date, the dashboard should display the count of supplements marked as taken versus the count of supplements scheduled for that date.

**Validates: Requirements 19.4**

### Property 41: Dashboard Metric Reactivity

*For any* new data entry (workout, nutrition, or supplement), the dashboard metrics should update to reflect the new data without requiring a page refresh.

**Validates: Requirements 19.6**

### Property 42: Offline Data Access

*For any* data stored in IndexedDB (workouts, nutrition, supplements), the data should be accessible and displayable when the application is offline (network unavailable).

**Validates: Requirements 21.2**

### Property 43: Offline Manual Entry

*For any* manual workout entry or supplement checklist update, the operation should succeed and persist to IndexedDB when the application is offline.

**Validates: Requirements 21.3**

### Property 44: Offline Feature Gating

*For any* feature that requires Claude API access (image analysis, chat, supplement analysis), the feature should be disabled or show an appropriate message when the application is offline.

**Validates: Requirements 21.4**

### Property 45: No Image Persistence

*For any* image uploaded for analysis, after the analysis is complete, no image data should exist in IndexedDB or any other client-side storage.

**Validates: Requirements 23.4**

### Property 46: Text-Only Analysis Storage

*For any* image analysis result stored in IndexedDB, the stored data should contain only text fields (exercise type, form feedback, macro data, etc.) and no binary image data.

**Validates: Requirements 23.5**

### Property 47: Health Data Transmission Restriction

*For any* network request from the client, health data should only be transmitted in requests to `/api/chat` as part of the chat context, and not in any other requests.

**Validates: Requirements 24.2**

### Property 48: Data Export Completeness

*For any* data export operation, the generated JSON file should contain all user profile data, all workout entries, all nutrition entries, all supplement entries, all checklist entries, and all chat history.

**Validates: Requirements 24.4, 30.2**

### Property 49: Responsive Functionality

*For any* screen width between 320px and 1920px, all core functionality (viewing logs, manual entry, navigation) should remain accessible and functional.

**Validates: Requirements 25.2**

### Property 50: Touch Target Sizing

*For any* interactive UI element (buttons, links, form inputs), the tap target size should be at least 44x44 pixels to ensure touch-friendly interaction.

**Validates: Requirements 25.3**

### Property 51: Animation Duration Limit

*For any* UI animation or state transition, the animation duration should be less than 300 milliseconds.

**Validates: Requirements 26.4**

### Property 52: 30-Day Workout History Filtering

*For any* given date, the workout history view should display only workout entries with timestamps within the past 30 days from that date.

**Validates: Requirements 28.1**

### Property 53: Weekly Workout Frequency

*For any* given week, the weekly workout frequency should equal the count of unique days within that week that contain at least one workout entry.

**Validates: Requirements 28.4**

### Property 54: Most Frequent Exercise Identification

*For any* workout history, the most frequently performed exercise type should be the exercise type that appears in the most workout entries.

**Validates: Requirements 28.5**

### Property 55: Macro Target Display Conditional

*For any* user profile state, if macro targets are set (not null/undefined), the dashboard and nutrition views should display the target values; if not set, targets should not be displayed.

**Validates: Requirements 29.1**

### Property 56: Macro Progress Percentage

*For any* macro category with a set target, the progress percentage should equal (current intake / target) × 100.

**Validates: Requirements 29.3**

### Property 57: Macro Progress Indicator Display

*For any* macro category with a set target, a visual progress indicator (progress bar or similar) should be displayed in the UI.

**Validates: Requirements 29.4**

### Property 58: Macro Overage Warning

*For any* macro category where the daily intake exceeds the target by more than 20% (intake > target × 1.2), a warning indicator should be displayed.

**Validates: Requirements 29.5**

### Property 59: Export File Metadata

*For any* exported JSON file, the file should include a `version` field (schema version) and an `exportedAt` field (ISO 8601 timestamp).

**Validates: Requirements 30.4**

### Property 60: Import-Export Round Trip

*For any* complete dataset, exporting the data to JSON and then importing it back should restore all data to an equivalent state (all profiles, logs, and history preserved).

**Validates: Requirements 30.5**


## Error Handling

### Client-Side Error Handling

**Image Upload Errors**:
```typescript
// components/ImageUploader.tsx
async function handleImageUpload(file: File) {
  try {
    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      showError('Image size must be under 10MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showError('Only JPEG, PNG, and WebP images are supported');
      return;
    }

    // Convert to base64
    const base64 = await fileToBase64(file);

    // Call API
    const response = await fetch('/api/analyze-workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mimeType: file.type }),
    });

    if (!response.ok) {
      const error = await response.json();
      handleAPIError(error, response.status);
      return;
    }

    const result = await response.json();
    // Process result...
  } catch (error) {
    showError('Failed to upload image. Please try again.');
    console.error('Upload error:', error);
  }
}
```

**API Error Response Handling**:
```typescript
// lib/errorHandling.ts
export function handleAPIError(error: any, statusCode: number) {
  switch (statusCode) {
    case 400:
      showError(error.message || 'Invalid request. Please check your input.');
      break;
    case 429:
      const retryAfter = error.retryAfter || 60;
      showError(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
      break;
    case 500:
      showError('Server error. Please try again later.');
      break;
    case 503:
      showError('AI service temporarily unavailable. Please try again later.');
      break;
    default:
      showError('An unexpected error occurred. Please try again.');
  }
}
```

**IndexedDB Error Handling**:
```typescript
// lib/db.ts
export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('athleteos-db', 1);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      showError('Failed to access local storage. Please check browser settings.');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores with error handling
      try {
        if (!db.objectStoreNames.contains('userProfile')) {
          db.createObjectStore('userProfile', { keyPath: 'id' });
        }
        // ... create other stores
      } catch (error) {
        console.error('Failed to create object stores:', error);
        reject(error);
      }
    };
  });
}
```

**Offline Error Handling**:
```typescript
// hooks/useAPICall.ts
export function useAPICall<T>(endpoint: string) {
  const isOnline = useOnlineStatus();

  async function call(data: any): Promise<T> {
    if (!isOnline) {
      throw new Error('This feature requires an internet connection');
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new APIError(error.message, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }

  return { call, isOnline };
}
```

### Server-Side Error Handling

**API Route Error Wrapper**:
```typescript
// lib/apiHandler.ts
export function withErrorHandling(
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    try {
      validateEnvironment();
      return await handler(req);
    } catch (error: any) {
      console.error('API Error:', error);

      if (error instanceof ClaudeAPIError) {
        return Response.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }

      if (error instanceof z.ZodError) {
        return Response.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }

      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Usage in API route
export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();
  const validated = WorkoutImageSchema.parse(body);
  // ... handle request
});
```

**Claude API Error Handling**:
```typescript
// lib/claudeErrorHandler.ts
export async function callClaudeWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;

      // Don't retry client errors
      if (error.status >= 400 && error.status < 500) {
        throw new ClaudeAPIError(
          'Invalid request to Claude API',
          400
        );
      }

      // Don't retry rate limits
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'] || 60;
        throw new ClaudeAPIError(
          'Rate limit exceeded',
          429,
          retryAfter
        );
      }

      // Retry server errors with exponential backoff
      if (error.status >= 500 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Max retries exceeded
      throw new ClaudeAPIError(
        'Claude API temporarily unavailable',
        503
      );
    }
  }

  throw lastError!;
}
```

### Error Logging

**Client-Side Logging**:
```typescript
// lib/logger.ts
export function logError(context: string, error: any, metadata?: any) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    stack: error.stack,
    metadata,
  };

  console.error('Error:', errorLog);

  // Store in IndexedDB for debugging (optional)
  if (process.env.NODE_ENV === 'development') {
    storeErrorLog(errorLog);
  }
}
```

**Server-Side Logging**:
```typescript
// API routes use console.error which is captured by Vercel logs
console.error('API Error:', {
  endpoint: '/api/analyze-workout',
  error: error.message,
  timestamp: new Date().toISOString(),
});
```

## Testing Strategy

### Dual Testing Approach

AthleteOS employs a comprehensive testing strategy combining unit tests and property-based tests:

- **Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points
- **Property-Based Tests**: Verify universal properties across randomized inputs for comprehensive coverage

Both approaches are complementary and necessary for ensuring correctness.

### Property-Based Testing Configuration

**Library**: `fast-check` (JavaScript/TypeScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test references its design document property via comment tag
- Tag format: `// Feature: athlete-os, Property {number}: {property_text}`

**Example Property Test**:
```typescript
// __tests__/properties/workout.property.test.ts
import fc from 'fast-check';
import { addWorkout, getWorkouts } from '@/services/workoutService';

describe('Workout Properties', () => {
  // Feature: athlete-os, Property 6: Workout Data Persistence Round Trip
  it('should preserve workout data through store and retrieve cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          timestamp: fc.date().map(d => d.toISOString()),
          source: fc.constantFrom('image', 'manual'),
          exerciseType: fc.string({ minLength: 1, maxLength: 50 }),
          estimatedReps: fc.option(fc.integer({ min: 1, max: 1000 })),
          sets: fc.option(fc.integer({ min: 1, max: 100 })),
          duration: fc.option(fc.integer({ min: 1, max: 600 })),
          formFeedback: fc.option(fc.string({ maxLength: 500 })),
          notes: fc.option(fc.string({ maxLength: 1000 })),
        }),
        async (workoutData) => {
          // Store workout
          const stored = await addWorkout(workoutData);
          
          // Retrieve workout
          const workouts = await getWorkouts();
          const retrieved = workouts.find(w => w.id === stored.id);
          
          // Assert equivalence
          expect(retrieved).toBeDefined();
          expect(retrieved!.exerciseType).toBe(workoutData.exerciseType);
          expect(retrieved!.estimatedReps).toBe(workoutData.estimatedReps);
          expect(retrieved!.source).toBe(workoutData.source);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: athlete-os, Property 9: Workout Streak Calculation
  it('should calculate current streak as consecutive days from today', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            timestamp: fc.date({ min: new Date('2024-01-01'), max: new Date() })
              .map(d => d.toISOString()),
            exerciseType: fc.string({ minLength: 1 }),
            source: fc.constantFrom('image', 'manual'),
          }),
          { minLength: 0, maxLength: 100 }
        ),
        async (workouts) => {
          // Clear database
          await clearWorkouts();
          
          // Store workouts
          for (const workout of workouts) {
            await addWorkout(workout);
          }
          
          // Calculate expected streak
          const dates = workouts.map(w => 
            new Date(w.timestamp).toISOString().split('T')[0]
          );
          const uniqueDates = [...new Set(dates)].sort().reverse();
          
          let expectedStreak = 0;
          const today = new Date().toISOString().split('T')[0];
          
          for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            const expectedDateStr = expectedDate.toISOString().split('T')[0];
            
            if (uniqueDates.includes(expectedDateStr)) {
              expectedStreak++;
            } else {
              break;
            }
          }
          
          // Calculate actual streak
          const { current } = await calculateWorkoutStreak();
          
          // Assert
          expect(current).toBe(expectedStreak);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

**Focus Areas**:
1. Specific examples demonstrating correct behavior
2. Edge cases (empty data, boundary values, null handling)
3. Error conditions (invalid input, API failures, offline state)
4. Integration points (API routes, IndexedDB operations, UI interactions)

**Example Unit Tests**:
```typescript
// __tests__/unit/nutrition.test.ts
describe('Nutrition Service', () => {
  it('should default new entries to "planned" status', async () => {
    const entry = await addNutritionEntry({
      timestamp: new Date().toISOString(),
      date: '2024-01-15',
      foodName: 'Chicken Breast',
      servingSize: '100g',
      macros: { calories: 165, protein: 31, carbohydrates: 0, fats: 3.6, sugar: 0, sodium: 74 },
      warnings: [],
    });
    
    expect(entry.status).toBe('planned');
  });

  it('should handle empty nutrition data gracefully', async () => {
    const totals = await getDailyTotals('2024-01-15');
    
    expect(totals).toEqual({
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fats: 0,
      sugar: 0,
      sodium: 0,
    });
  });

  it('should generate warning for high-calorie food with weight loss goal', () => {
    const warnings = checkGoalConflicts(
      { calories: 600, protein: 10, carbohydrates: 50, fats: 30, sugar: 20, sodium: 500 },
      'lose weight'
    );
    
    expect(warnings).toContainEqual(
      expect.objectContaining({ type: 'goal_conflict' })
    );
  });
});
```

### Integration Testing

**API Route Testing**:
```typescript
// __tests__/integration/api/analyze-workout.test.ts
describe('POST /api/analyze-workout', () => {
  it('should return structured workout analysis for valid image', async () => {
    const mockImage = await loadTestImage('pushup.jpg');
    const base64 = await imageToBase64(mockImage);
    
    const response = await fetch('/api/analyze-workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64,
        mimeType: 'image/jpeg',
      }),
    });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('exerciseType');
    expect(data).toHaveProperty('estimatedReps');
    expect(data).toHaveProperty('formFeedback');
    expect(data).toHaveProperty('confidence');
  });

  it('should return 400 for invalid image format', async () => {
    const response = await fetch('/api/analyze-workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'invalid-base64',
        mimeType: 'image/gif',
      }),
    });
    
    expect(response.status).toBe(400);
  });
});
```

### End-to-End Testing

**PWA Installation Flow**:
```typescript
// __tests__/e2e/pwa.test.ts
describe('PWA Installation', () => {
  it('should register service worker on first visit', async () => {
    const page = await browser.newPage();
    await page.goto('https://athleteos.vercel.app');
    
    const swRegistration = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration();
    });
    
    expect(swRegistration).toBeDefined();
  });

  it('should cache app shell for offline access', async () => {
    const page = await browser.newPage();
    await page.goto('https://athleteos.vercel.app');
    
    // Wait for service worker to activate
    await page.waitForTimeout(2000);
    
    // Go offline
    await page.setOfflineMode(true);
    
    // Navigate to cached page
    await page.goto('https://athleteos.vercel.app/workouts');
    
    // Should still load
    const title = await page.title();
    expect(title).toContain('AthleteOS');
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80%+ code coverage for services and utilities
- **Property Tests**: 100% coverage of all correctness properties (60 properties)
- **Integration Tests**: All API routes and critical user flows
- **E2E Tests**: Core user journeys (onboarding, logging workout, viewing dashboard)

### Continuous Integration

**GitHub Actions Workflow**:
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:property
      - run: npm run test:integration
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v3
```

### Manual Testing Checklist

**Pre-Release Verification**:
- [ ] PWA installs successfully on iOS Safari
- [ ] PWA installs successfully on Android Chrome
- [ ] Offline mode works (view logs, manual entry)
- [ ] Image upload works for all supported formats
- [ ] Claude API integration returns valid responses
- [ ] Data export/import preserves all data
- [ ] Responsive design works on 320px and 1920px screens
- [ ] Touch targets are 44x44px minimum
- [ ] Animations are under 300ms
- [ ] Dark theme displays correctly
- [ ] Error messages are user-friendly
- [ ] API key never exposed in network tab

