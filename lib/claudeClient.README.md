# Claude API Client Configuration

This module provides a configured Anthropic SDK client for server-side use in AthleteOS.

## Overview

The Claude client configuration ensures secure API key management and provides a consistent interface for all Claude API interactions across the application.

## Requirements Satisfied

- **Requirement 1.1**: API key stored exclusively in environment variables
- **Requirement 1.2**: Model constant defined as `claude-sonnet-4-20250514`
- **Requirement 1.3**: Environment validation function implemented

## Usage

### Basic Usage in API Routes

```typescript
import { getClaudeClient, CLAUDE_MODEL, validateEnvironment } from '@/lib/claudeClient';

export async function POST(request: Request) {
  try {
    // Validate environment first
    validateEnvironment();
    
    // Get configured client
    const client = getClaudeClient();
    
    // Make API call
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'Your prompt here',
        },
      ],
    });
    
    return Response.json({ response: response.content });
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Vision Analysis

```typescript
import { getClaudeClient, CLAUDE_MODEL } from '@/lib/claudeClient';

const client = getClaudeClient();

const response = await client.messages.create({
  model: CLAUDE_MODEL,
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          type: 'text',
          text: 'Analyze this image',
        },
      ],
    },
  ],
});
```

## Environment Setup

### Local Development

Create a `.env.local` file in the project root:

```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### Vercel Deployment

Add the environment variable in your Vercel project settings:

1. Go to Project Settings → Environment Variables
2. Add `ANTHROPIC_API_KEY` with your API key
3. Select the appropriate environments (Production, Preview, Development)

## API Reference

### `CLAUDE_MODEL`

```typescript
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
```

The Claude model identifier used for all API requests.

### `validateEnvironment()`

```typescript
export function validateEnvironment(): void
```

Validates that the `ANTHROPIC_API_KEY` environment variable is set.

**Throws**: `Error` if the API key is not configured

### `getClaudeClient()`

```typescript
export function getClaudeClient(): Anthropic
```

Creates and returns a new Anthropic client instance configured with the API key from environment variables.

**Returns**: Configured Anthropic client instance

**Throws**: `Error` if the API key is not configured

### `getDefaultClient()`

```typescript
export function getDefaultClient(): Anthropic
```

Returns a singleton Anthropic client instance. The client is created on first call and reused for subsequent calls.

**Returns**: Singleton Anthropic client instance

**Throws**: `Error` if the API key is not configured

## Security Notes

- The API key is **never** exposed to client-side code
- All Claude API calls must be made through server-side API routes
- The client should only be used in server contexts (API routes, server components)
- Images are processed in memory and never persisted to disk

## Testing

Unit tests are available in `lib/__tests__/claudeClient.test.ts`:

```bash
npm test -- lib/__tests__/claudeClient.test.ts
```

## Examples

See `lib/examples/claude-client-usage.ts` for complete usage examples.
