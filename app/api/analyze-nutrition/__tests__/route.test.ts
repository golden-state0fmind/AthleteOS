/**
 * Unit tests for POST /api/analyze-nutrition
 * 
 * Tests:
 * - Successful analysis with valid image
 * - Error handling for invalid format
 * - Error handling for missing data
 * - Error handling for Claude API errors
 * - Partial data handling with null values
 * 
 * Requirements:
 * - 6.4: Display error message on upload failure
 * - 7.5: Return error response on API failure
 */

import { POST } from '../route';
import { analyzeImageWithClaude } from '@/lib/visionAnalysis';

// Mock the vision analysis utility
jest.mock('@/lib/visionAnalysis', () => ({
  analyzeImageWithClaude: jest.fn(),
  NUTRITION_ANALYSIS_PROMPT: 'Mock nutrition prompt',
}));

describe('POST /api/analyze-nutrition', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return structured nutrition analysis for valid request', async () => {
    // Mock Claude API response
    const mockAnalysis = {
      foodName: 'Greek Yogurt',
      servingSize: '1 cup (227g)',
      macros: {
        calories: 130,
        protein: 20,
        carbohydrates: 9,
        fats: 0,
        sugar: 7,
        sodium: 75,
      },
      confidence: 'high' as const,
    };

    (analyzeImageWithClaude as jest.Mock).mockResolvedValue(JSON.stringify(mockAnalysis));

    // Create mock request
    const request = new Request('http://localhost:3000/api/analyze-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'base64encodedimagedata',
        mimeType: 'image/jpeg',
      }),
    });

    // Call API route
    const response = await POST(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual(mockAnalysis);
    expect(analyzeImageWithClaude).toHaveBeenCalledWith(
      'base64encodedimagedata',
      'image/jpeg',
      'Mock nutrition prompt'
    );
  });

  it('should handle partial data with null values', async () => {
    // Mock response with some missing fields
    const mockAnalysis = {
      foodName: 'Protein Bar',
      servingSize: null, // Not readable
      macros: {
        calories: 200,
        protein: 15,
        carbohydrates: null, // Not readable
        fats: 8,
        sugar: null, // Not readable
        sodium: null, // Not readable
      },
      confidence: 'medium' as const,
    };

    (analyzeImageWithClaude as jest.Mock).mockResolvedValue(JSON.stringify(mockAnalysis));

    const request = new Request('http://localhost:3000/api/analyze-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'base64data',
        mimeType: 'image/png',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.foodName).toBe('Protein Bar');
    expect(data.servingSize).toBeNull();
    expect(data.macros.carbohydrates).toBeNull();
    expect(data.macros.calories).toBe(200);
  });

  it('should return 400 for invalid request data', async () => {
    // Create request with missing image
    const request = new Request('http://localhost:3000/api/analyze-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mimeType: 'image/jpeg',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toBeDefined();
  });

  it('should return 400 for unsupported image format', async () => {
    const request = new Request('http://localhost:3000/api/analyze-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'base64data',
        mimeType: 'image/gif',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });

  it('should return 500 when Claude returns invalid JSON', async () => {
    (analyzeImageWithClaude as jest.Mock).mockResolvedValue('Not valid JSON');

    const request = new Request('http://localhost:3000/api/analyze-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'base64data',
        mimeType: 'image/jpeg',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to parse analysis results');
  });

  it('should return 500 when Claude returns incomplete data structure', async () => {
    const incompleteData = {
      foodName: 'Chicken Breast',
      // Missing macros and confidence
    };

    (analyzeImageWithClaude as jest.Mock).mockResolvedValue(JSON.stringify(incompleteData));

    const request = new Request('http://localhost:3000/api/analyze-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'base64data',
        mimeType: 'image/jpeg',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Invalid analysis results');
  });

  it('should return 429 for rate limit errors', async () => {
    (analyzeImageWithClaude as jest.Mock).mockRejectedValue(
      new Error('Rate limit exceeded (429)')
    );

    const request = new Request('http://localhost:3000/api/analyze-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'base64data',
        mimeType: 'image/jpeg',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Rate limit exceeded');
  });

  it('should return 503 for Claude API unavailability', async () => {
    (analyzeImageWithClaude as jest.Mock).mockRejectedValue(
      new Error('Service unavailable (503)')
    );

    const request = new Request('http://localhost:3000/api/analyze-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'base64data',
        mimeType: 'image/jpeg',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain('temporarily unavailable');
  });

  it('should handle all null macros correctly', async () => {
    const mockAnalysis = {
      foodName: null,
      servingSize: null,
      macros: {
        calories: null,
        protein: null,
        carbohydrates: null,
        fats: null,
        sugar: null,
        sodium: null,
      },
      confidence: 'low' as const,
    };

    (analyzeImageWithClaude as jest.Mock).mockResolvedValue(JSON.stringify(mockAnalysis));

    const request = new Request('http://localhost:3000/api/analyze-nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: 'base64data',
        mimeType: 'image/webp',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.foodName).toBeNull();
    expect(data.macros.calories).toBeNull();
    expect(data.confidence).toBe('low');
  });
});
