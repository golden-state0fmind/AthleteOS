/**
 * Unit tests for POST /api/analyze-workout
 * 
 * Tests:
 * - Successful analysis with valid image
 * - Error handling for invalid format
 * - Error handling for missing data
 * - Error handling for Claude API errors
 * 
 * Requirements:
 * - 2.5: Display error message on upload failure
 * - 3.5: Return error response on API failure
 */

import { POST } from '../route';
import { analyzeImageWithClaude } from '@/lib/visionAnalysis';

// Mock the vision analysis utility
jest.mock('@/lib/visionAnalysis', () => ({
  analyzeImageWithClaude: jest.fn(),
  WORKOUT_ANALYSIS_PROMPT: 'Mock prompt',
}));

describe('POST /api/analyze-workout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return structured workout analysis for valid request', async () => {
    // Mock Claude API response
    const mockAnalysis = {
      exerciseType: 'Push-ups',
      estimatedReps: 15,
      formFeedback: 'Good form, keep elbows close to body',
      confidence: 'high' as const,
    };

    (analyzeImageWithClaude as jest.Mock).mockResolvedValue(JSON.stringify(mockAnalysis));

    // Create mock request
    const request = new Request('http://localhost:3000/api/analyze-workout', {
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
      'Mock prompt'
    );
  });

  it('should return 400 for invalid request data', async () => {
    // Create request with missing image
    const request = new Request('http://localhost:3000/api/analyze-workout', {
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
    const request = new Request('http://localhost:3000/api/analyze-workout', {
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

    const request = new Request('http://localhost:3000/api/analyze-workout', {
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

  it('should return 500 when Claude returns incomplete data', async () => {
    const incompleteData = {
      exerciseType: 'Push-ups',
      // Missing formFeedback and confidence
    };

    (analyzeImageWithClaude as jest.Mock).mockResolvedValue(JSON.stringify(incompleteData));

    const request = new Request('http://localhost:3000/api/analyze-workout', {
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

    const request = new Request('http://localhost:3000/api/analyze-workout', {
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

    const request = new Request('http://localhost:3000/api/analyze-workout', {
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

  it('should handle null estimatedReps correctly', async () => {
    const mockAnalysis = {
      exerciseType: 'Plank',
      estimatedReps: null, // Not countable for static holds
      formFeedback: 'Maintain straight line from head to heels',
      confidence: 'high' as const,
    };

    (analyzeImageWithClaude as jest.Mock).mockResolvedValue(JSON.stringify(mockAnalysis));

    const request = new Request('http://localhost:3000/api/analyze-workout', {
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
    expect(data.estimatedReps).toBeNull();
    expect(data.exerciseType).toBe('Plank');
  });
});
