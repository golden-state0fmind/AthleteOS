/**
 * POST /api/analyze-supplement
 * 
 * Analyzes supplements using Claude API text capabilities.
 * Returns structured data including safety notes, effectiveness, and interaction warnings.
 * 
 * Requirements:
 * - 11.3: Receive supplement data from client
 * - 12.1: Send supplement data to Claude API
 * - 12.2: Request safety notes and effectiveness information
 * - 12.3: Return structured data with safety notes and effectiveness
 * - 12.4: Use claude-sonnet-4 model
 * - 13.1: Send all supplements for interaction detection
 * - 13.2: Request Claude API to identify potential interactions
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { SupplementRequestSchema } from '@/lib/validation';
import { analyzeSupplementWithClaude } from '@/lib/supplementAnalysis';
import type { SupplementAnalysisResult } from '@/lib/supplementAnalysis';

/**
 * POST handler for supplement analysis
 * 
 * @param request - Next.js request object containing supplement data
 * @returns JSON response with supplement analysis or error
 */
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = SupplementRequestSchema.parse(body);

    // Call Claude API for supplement analysis
    const analysisResult: SupplementAnalysisResult = await analyzeSupplementWithClaude(
      validated.supplementName,
      validated.dosage,
      validated.allSupplements
    );

    // Validate response structure
    if (!analysisResult.safetyNotes || !analysisResult.effectiveness) {
      console.error('Invalid analysis result structure:', analysisResult);
      return NextResponse.json(
        { error: 'Invalid analysis results received. Please try again.' },
        { status: 500 }
      );
    }

    // Return structured response
    return NextResponse.json(analysisResult, { status: 200 });

  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Handle JSON parsing errors from Claude response
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      console.error('Failed to parse Claude response as JSON:', error);
      return NextResponse.json(
        { error: 'Failed to parse analysis results. Please try again.' },
        { status: 500 }
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
      console.error('Supplement analysis error:', error);
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to analyze supplement. Please try again.' },
      { status: 500 }
    );
  }
}
