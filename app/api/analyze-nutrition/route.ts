/**
 * POST /api/analyze-nutrition
 * 
 * Analyzes nutrition label images using Claude API vision capabilities.
 * Returns structured data including food name, serving size, and macronutrients.
 * 
 * Requirements:
 * - 6.3: Send nutrition label image to serverless route
 * - 7.1: Send image to Claude API with vision analysis
 * - 7.2: Request food name, serving size, and macros
 * - 7.3: Return structured nutrition data with null for missing fields
 * - 7.4: Use claude-sonnet-4 model
 * - 7.5: Return error response on API failure
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { NutritionImageSchema } from '@/lib/validation';
import { analyzeImageWithClaude, NUTRITION_ANALYSIS_PROMPT, buildNutritionPromptWithContext } from '@/lib/visionAnalysis';

/**
 * Nutrition analysis response structure
 */
interface NutritionAnalysisResponse {
  foodName: string | null;
  servingSize: string | null;
  macros: {
    calories: number | null;
    protein: number | null;
    carbohydrates: number | null;
    fats: number | null;
    sugar: number | null;
    sodium: number | null;
  };
  confidence: 'high' | 'medium' | 'low';
}

/**
 * POST handler for nutrition label image analysis
 * 
 * @param request - Next.js request object containing image data
 * @returns JSON response with nutrition analysis or error
 */
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = NutritionImageSchema.parse(body);

    // Build prompt with additional context if provided
    let prompt = NUTRITION_ANALYSIS_PROMPT;
    if (body.additionalContext || body.servings) {
      prompt = buildNutritionPromptWithContext(
        body.additionalContext,
        body.servings
      );
    }

    // Call Claude API with vision analysis
    const responseText = await analyzeImageWithClaude(
      validated.image,
      validated.mimeType,
      prompt
    );

    // Parse Claude's JSON response (handle markdown code blocks)
    let analysisResult: NutritionAnalysisResponse;
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse analysis results. Please try again.' },
        { status: 500 }
      );
    }

    // Validate response structure (confidence is required, but other fields can be null)
    if (!analysisResult.confidence || !analysisResult.macros) {
      console.error('Invalid analysis result structure:', analysisResult);
      return NextResponse.json(
        { error: 'Invalid analysis results received. Please try again.' },
        { status: 500 }
      );
    }

    // Apply servings multiplier if provided
    const servings = body.servings && body.servings > 0 ? body.servings : 1;
    if (servings !== 1) {
      // Multiply all macro values by servings
      analysisResult.macros = {
        calories: analysisResult.macros.calories !== null 
          ? Math.round(analysisResult.macros.calories * servings) 
          : null,
        protein: analysisResult.macros.protein !== null 
          ? Math.round(analysisResult.macros.protein * servings * 10) / 10 
          : null,
        carbohydrates: analysisResult.macros.carbohydrates !== null 
          ? Math.round(analysisResult.macros.carbohydrates * servings * 10) / 10 
          : null,
        fats: analysisResult.macros.fats !== null 
          ? Math.round(analysisResult.macros.fats * servings * 10) / 10 
          : null,
        sugar: analysisResult.macros.sugar !== null 
          ? Math.round(analysisResult.macros.sugar * servings * 10) / 10 
          : null,
        sodium: analysisResult.macros.sodium !== null 
          ? Math.round(analysisResult.macros.sodium * servings) 
          : null,
      };
      
      // Update serving size to reflect multiple servings
      if (analysisResult.servingSize) {
        analysisResult.servingSize = `${analysisResult.servingSize} × ${servings}`;
      }
    }

    // Return structured response with partial data support
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
      console.error('Nutrition analysis error:', error);
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to analyze nutrition label image. Please try again.' },
      { status: 500 }
    );
  }
}
