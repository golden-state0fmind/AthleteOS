/**
 * POST /api/analyze-workout
 * 
 * Analyzes workout images using Claude API vision capabilities.
 * Returns structured data including exercise type, estimated reps, and form feedback.
 * 
 * Requirements:
 * - 2.3: Send workout image to serverless route
 * - 3.1: Send image to Claude API with vision analysis
 * - 3.2: Request exercise type, reps, and form feedback
 * - 3.3: Return structured analysis data
 * - 3.4: Use claude-sonnet-4 model
 * - 3.5: Return error response on API failure
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { WorkoutImageSchema } from '@/lib/validation';
import { analyzeImageWithClaude, WORKOUT_ANALYSIS_PROMPT } from '@/lib/visionAnalysis';

/**
 * Workout analysis response structure
 */
interface WorkoutAnalysisResponse {
  exerciseType: string;
  estimatedReps: number | null;
  formFeedback: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * POST handler for workout image analysis
 * 
 * @param request - Next.js request object containing image data
 * @returns JSON response with workout analysis or error
 */
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = WorkoutImageSchema.parse(body);

    // Call Claude API with vision analysis
    const responseText = await analyzeImageWithClaude(
      validated.image,
      validated.mimeType,
      WORKOUT_ANALYSIS_PROMPT
    );

    // Parse Claude's JSON response
    let analysisResult: WorkoutAnalysisResponse;
    try {
      analysisResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse analysis results. Please try again.' },
        { status: 500 }
      );
    }

    // Validate response structure
    if (
      !analysisResult.exerciseType ||
      !analysisResult.formFeedback ||
      !analysisResult.confidence
    ) {
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
      console.error('Workout analysis error:', error);
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to analyze workout image. Please try again.' },
      { status: 500 }
    );
  }
}
