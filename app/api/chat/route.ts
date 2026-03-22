/**
 * POST /api/chat
 * 
 * Conversational AI coaching with user context.
 * Builds system prompt with user data and sends to Claude API.
 * 
 * Requirements:
 * - 15.2: Validate request with ChatRequestSchema
 * - 15.3: Build system prompt with chat context
 * - 15.4: Call Claude API with conversational model
 * - 15.5: Return response text
 * - 15.7: Implement error handling
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ChatRequestSchema } from '@/lib/validation';
import { buildSystemPrompt } from '@/lib/chatContext';
import { getClaudeClient, CLAUDE_MODEL } from '@/lib/claudeClient';

/**
 * POST handler for chat requests
 * 
 * @param request - Next.js request object containing message and context
 * @returns JSON response with AI response or error
 */
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = ChatRequestSchema.parse(body);

    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(validated.context);

    // Get Claude client
    const claudeClient = getClaudeClient();

    // Call Claude API with conversational model
    const message = await claudeClient.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: validated.message,
        },
      ],
    });

    // Extract response text
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    if (!responseText) {
      console.error('Empty response from Claude API');
      return NextResponse.json(
        { error: 'Received empty response from AI. Please try again.' },
        { status: 500 }
      );
    }

    // Return response
    return NextResponse.json({ response: responseText }, { status: 200 });

  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Handle Claude API errors
    if (error instanceof Error) {
      // Check for rate limiting
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      // Check for server errors
      if (error.message.includes('503') || error.message.includes('unavailable')) {
        return NextResponse.json(
          { error: 'Claude API is temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }

      // Log unexpected errors
      console.error('Chat API error:', error);
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to process chat request. Please try again.' },
      { status: 500 }
    );
  }
}
