/**
 * Example usage of the Claude API client configuration
 * 
 * This file demonstrates how to use the Claude client in API routes
 * and server-side code.
 */

import { getClaudeClient, CLAUDE_MODEL, validateEnvironment } from '../claudeClient';

/**
 * Example: Basic text completion
 */
async function exampleTextCompletion() {
  // Validate environment before making API calls
  validateEnvironment();
  
  const client = getClaudeClient();
  
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: 'What are the benefits of regular exercise?',
      },
    ],
  });
  
  console.log(response.content);
}

/**
 * Example: Vision analysis (for workout/nutrition images)
 */
async function exampleVisionAnalysis(imageBase64: string, mimeType: string) {
  validateEnvironment();
  
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
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: 'Analyze this workout image and identify the exercise type.',
          },
        ],
      },
    ],
  });
  
  console.log(response.content);
}

/**
 * Example: API route usage pattern
 */
export async function exampleApiRoute(request: Request) {
  try {
    // Validate environment at the start of the API route
    validateEnvironment();
    
    const client = getClaudeClient();
    
    // Parse request body
    const body = await request.json();
    
    // Make API call
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: body.message,
        },
      ],
    });
    
    // Return response
    return new Response(
      JSON.stringify({
        response: response.content[0].type === 'text' ? response.content[0].text : '',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API route error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
