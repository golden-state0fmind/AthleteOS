/**
 * POST /api/estimate-nutrition
 * 
 * Estimates nutrition information from text description using Claude API.
 * Returns structured data with per-item breakdown and totals.
 */

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface NutritionItem {
  description: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  sugar: number;
  sodium: number;
}

interface EstimateResponse {
  items: NutritionItem[];
  totals: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
    sugar: number;
    sodium: number;
  };
}

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const prompt = `Analyze this food description and provide detailed nutrition estimates: "${description}"

IMPORTANT: Return ONLY a valid JSON object with no additional text, explanations, or markdown formatting.

Use this exact structure:
{
  "items": [
    {
      "description": "specific food item with quantity",
      "calories": number,
      "protein": number (grams),
      "carbohydrates": number (grams),
      "fats": number (grams),
      "sugar": number (grams),
      "sodium": number (mg)
    }
  ],
  "totals": {
    "calories": number,
    "protein": number,
    "carbohydrates": number,
    "fats": number,
    "sugar": number,
    "sodium": number
  }
}

Break down each food item separately. Use standard serving sizes and USDA nutrition data. Return only the JSON, nothing else.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    // Extract JSON from markdown code blocks if present
    let jsonText = responseText.trim();
    
    // Remove markdown code blocks (```json ... ```)
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1];
    } else {
      // Try to find JSON object in the response
      const jsonMatch = jsonText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
    }

    let result: EstimateResponse;
    try {
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse nutrition estimates' },
        { status: 500 }
      );
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Nutrition estimation error:', error);
    
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to estimate nutrition. Please try again.' },
      { status: 500 }
    );
  }
}
