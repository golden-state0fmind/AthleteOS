/**
 * Vision Analysis Utilities
 * 
 * This module provides utilities for analyzing images using Claude API's vision capabilities.
 * 
 * Requirements:
 * - 3.1: Send workout images to Claude API with vision analysis
 * - 7.1: Send nutrition label images to Claude API with vision analysis
 */

import { getDefaultClient, CLAUDE_MODEL } from './claudeClient';

/**
 * Default maximum tokens for vision analysis responses
 */
export const DEFAULT_MAX_TOKENS = 1024;

/**
 * Analyzes an image using Claude API with vision capabilities
 * 
 * This is a shared utility used by both workout and nutrition analysis endpoints.
 * The image is processed in memory and never persisted.
 * 
 * @param imageBase64 - Base64-encoded image data (without data URL prefix)
 * @param mimeType - Image MIME type (image/jpeg, image/png, or image/webp)
 * @param prompt - Analysis prompt instructing Claude what to extract
 * @returns Promise resolving to Claude's text response
 * @throws {Error} If Claude API call fails
 * 
 * @example
 * ```typescript
 * const prompt = "Analyze this workout image...";
 * const response = await analyzeImageWithClaude(base64Data, "image/jpeg", prompt);
 * const parsed = JSON.parse(response);
 * ```
 */
export async function analyzeImageWithClaude(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const claudeClient = getDefaultClient();

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
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/webp',
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

  // Extract text content from response
  const textContent = message.content.find((block) => block.type === 'text');
  return textContent && textContent.type === 'text' ? textContent.text : '';
}

/**
 * Prompt template for workout image analysis
 * 
 * Instructs Claude to identify exercise type, count reps, and provide form feedback.
 */
export const WORKOUT_ANALYSIS_PROMPT = `Analyze this workout image and provide:
1. Exercise type (e.g., "Push-ups", "Squats", "Deadlift")
2. Estimated repetitions visible (or null if not countable)
3. Form feedback (brief assessment of technique)

Return ONLY valid JSON in this exact format:
{
  "exerciseType": "string",
  "estimatedReps": number or null,
  "formFeedback": "string",
  "confidence": "high" | "medium" | "low"
}`;

/**
 * Prompt template for nutrition label analysis
 * 
 * Instructs Claude to extract macronutrient data from food labels.
 */
export const NUTRITION_ANALYSIS_PROMPT = `Extract nutrition information from this food label image. Provide:
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

Use null for any values that cannot be read from the label.`;
