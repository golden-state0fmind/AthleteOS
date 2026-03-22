# POST /api/chat

Conversational AI coaching endpoint with user context.

## Purpose

Provides personalized fitness coaching through Claude AI by including user profile, recent workouts, today's nutrition, and active supplements in the conversation context.

## Requirements

- **15.2**: Validate request with ChatRequestSchema
- **15.3**: Build system prompt with chat context
- **15.4**: Call Claude API with conversational model
- **15.5**: Return response text
- **15.7**: Implement error handling
- **16.1**: Include user profile in context
- **16.2**: Include recent workouts (last 7 days)
- **16.3**: Include today's nutrition and active supplements

## Request

### Endpoint
```
POST /api/chat
```

### Headers
```
Content-Type: application/json
```

### Body
```typescript
{
  message: string;              // User's chat message (1-2000 characters)
  context: {
    userProfile: {
      name: string;
      age: number;              // 13-120
      weight: number;           // kg, 20-300
      height: number;           // cm, 100-250
      fitnessGoal: "lose weight" | "build muscle" | "maintain" | "performance";
    };
    recentWorkouts: Array<{
      timestamp: string;        // ISO 8601
      exerciseType: string;
      reps: number | null;
      sets: number | null;
    }>;
    todayNutrition: {
      entries: Array<{
        foodName: string;
        macros: {
          calories: number | null;
          protein: number | null;
          carbohydrates: number | null;
          fats: number | null;
          sugar: number | null;
          sodium: number | null;
        };
      }>;
      dailyTotals: {
        calories: number | null;
        protein: number | null;
        carbohydrates: number | null;
        fats: number | null;
        sugar: number | null;
        sodium: number | null;
      };
    };
    activeSupplements: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
  };
}
```

## Response

### Success (200)
```typescript
{
  response: string;  // AI-generated conversational response
}
```

### Error Responses

#### 400 - Invalid Request
```typescript
{
  error: "Invalid request data";
  details: Array<ZodError>;  // Validation errors
}
```

#### 429 - Rate Limit
```typescript
{
  error: "Rate limit exceeded. Please try again later.";
}
```

#### 500 - Server Error
```typescript
{
  error: "Failed to process chat request. Please try again.";
}
```

#### 503 - Service Unavailable
```typescript
{
  error: "Claude API is temporarily unavailable. Please try again later.";
}
```

## Implementation Details

### Context Building

The system prompt is built using `buildSystemPrompt()` from `lib/chatContext.ts`, which formats user data into a structured prompt for Claude:

1. **User Profile**: Name, age, weight, height, fitness goal
2. **Recent Workouts**: Last 7 days of workout entries
3. **Today's Nutrition**: All entries and daily totals
4. **Active Supplements**: All currently active supplements

### Claude API Configuration

- **Model**: `claude-sonnet-4-20250514`
- **Max Tokens**: 2048
- **System Prompt**: Constructed from user context
- **Messages**: Single user message per request

### Privacy

- Context is NOT persisted on the server
- All data is passed in the request and discarded after response
- No session storage or logging of health data

## Example Usage

See `lib/examples/chat-api-usage.ts` for complete examples.

### Basic Example

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'How am I doing with my fitness goals?',
    context: {
      userProfile: { /* ... */ },
      recentWorkouts: [ /* ... */ ],
      todayNutrition: { /* ... */ },
      activeSupplements: [ /* ... */ ],
    },
  }),
});

const data = await response.json();
console.log(data.response);
```

## Testing

Unit tests are located in `__tests__/route.test.ts` and cover:
- Valid request handling
- Validation errors
- Claude API errors
- Rate limiting
- Empty context handling

Run tests:
```bash
npm test -- app/api/chat/__tests__/route.test.ts
```
