/**
 * Unit tests for POST /api/chat
 * 
 * Tests:
 * - Successful chat response with valid context
 * - Error handling for invalid request data
 * - Error handling for missing message
 * - Error handling for Claude API errors
 * - System prompt construction with user context
 * 
 * Requirements:
 * - 15.2: Validate request with ChatRequestSchema
 * - 15.5: Return response text
 * - 15.7: Implement error handling
 */

import { POST } from '../route';
import { getClaudeClient } from '@/lib/claudeClient';
import { buildSystemPrompt } from '@/lib/chatContext';

// Mock the Claude client
jest.mock('@/lib/claudeClient', () => ({
  getClaudeClient: jest.fn(),
  CLAUDE_MODEL: 'claude-sonnet-4-20250514',
}));

// Mock the chat context builder
jest.mock('@/lib/chatContext', () => ({
  buildSystemPrompt: jest.fn(),
}));

describe('POST /api/chat', () => {
  let mockClaudeClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Claude client
    mockClaudeClient = {
      messages: {
        create: jest.fn(),
      },
    };

    (getClaudeClient as jest.Mock).mockReturnValue(mockClaudeClient);
    (buildSystemPrompt as jest.Mock).mockReturnValue('Mock system prompt with user context');
  });

  it('should return AI response for valid chat request', async () => {
    // Mock Claude API response
    mockClaudeClient.messages.create.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'Great job on your recent workouts! Keep up the consistency.',
        },
      ],
    });

    // Create mock request with valid context
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'How am I doing with my fitness goals?',
        context: {
          userProfile: {
            name: 'John Doe',
            age: 30,
            weight: 75,
            height: 180,
            fitnessGoal: 'build muscle',
          },
          recentWorkouts: [
            {
              timestamp: '2025-01-15T10:00:00Z',
              exerciseType: 'Push-ups',
              reps: 20,
              sets: 3,
            },
          ],
          todayNutrition: {
            entries: [
              {
                foodName: 'Chicken Breast',
                macros: {
                  calories: 165,
                  protein: 31,
                  carbohydrates: 0,
                  fats: 3.6,
                  sugar: 0,
                  sodium: 74,
                },
              },
            ],
            dailyTotals: {
              calories: 165,
              protein: 31,
              carbohydrates: 0,
              fats: 3.6,
              sugar: 0,
              sodium: 74,
            },
          },
          activeSupplements: [
            {
              name: 'Whey Protein',
              dosage: '30g',
              frequency: 'daily',
            },
          ],
        },
      }),
    });

    // Call API route
    const response = await POST(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data.response).toBe('Great job on your recent workouts! Keep up the consistency.');
    expect(buildSystemPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        userProfile: expect.objectContaining({
          name: 'John Doe',
          fitnessGoal: 'build muscle',
        }),
      })
    );
    expect(mockClaudeClient.messages.create).toHaveBeenCalledWith({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: 'Mock system prompt with user context',
      messages: [
        {
          role: 'user',
          content: 'How am I doing with my fitness goals?',
        },
      ],
    });
  });

  it('should return 400 for missing message', async () => {
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: {
          userProfile: {
            name: 'John',
            age: 30,
            weight: 75,
            height: 180,
            fitnessGoal: 'maintain',
          },
          recentWorkouts: [],
          todayNutrition: { entries: [], dailyTotals: {} },
          activeSupplements: [],
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toBeDefined();
  });

  it('should return 400 for invalid context structure', async () => {
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
        context: {
          userProfile: {
            name: 'John',
            age: 5, // Invalid age (too young)
            weight: 75,
            height: 180,
            fitnessGoal: 'maintain',
          },
          recentWorkouts: [],
          todayNutrition: {},
          activeSupplements: [],
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });

  it('should return 400 for message exceeding max length', async () => {
    const longMessage = 'a'.repeat(2001); // Exceeds 2000 character limit

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: longMessage,
        context: {
          userProfile: {
            name: 'John',
            age: 30,
            weight: 75,
            height: 180,
            fitnessGoal: 'maintain',
          },
          recentWorkouts: [],
          todayNutrition: { entries: [], dailyTotals: {} },
          activeSupplements: [],
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });

  it('should return 500 when Claude returns empty response', async () => {
    mockClaudeClient.messages.create.mockResolvedValue({
      content: [
        {
          type: 'image', // Wrong type
        },
      ],
    });

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
        context: {
          userProfile: {
            name: 'John',
            age: 30,
            weight: 75,
            height: 180,
            fitnessGoal: 'maintain',
          },
          recentWorkouts: [],
          todayNutrition: { entries: [], dailyTotals: {} },
          activeSupplements: [],
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('empty response');
  });

  it('should return 429 for rate limit errors', async () => {
    mockClaudeClient.messages.create.mockRejectedValue(
      new Error('Rate limit exceeded (429)')
    );

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
        context: {
          userProfile: {
            name: 'John',
            age: 30,
            weight: 75,
            height: 180,
            fitnessGoal: 'maintain',
          },
          recentWorkouts: [],
          todayNutrition: { entries: [], dailyTotals: {} },
          activeSupplements: [],
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Rate limit exceeded');
  });

  it('should return 503 for Claude API unavailability', async () => {
    mockClaudeClient.messages.create.mockRejectedValue(
      new Error('Service unavailable (503)')
    );

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello',
        context: {
          userProfile: {
            name: 'John',
            age: 30,
            weight: 75,
            height: 180,
            fitnessGoal: 'maintain',
          },
          recentWorkouts: [],
          todayNutrition: { entries: [], dailyTotals: {} },
          activeSupplements: [],
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain('temporarily unavailable');
  });

  it('should handle empty context arrays gracefully', async () => {
    mockClaudeClient.messages.create.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'Let me help you get started with your fitness journey!',
        },
      ],
    });

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I want to start working out',
        context: {
          userProfile: {
            name: 'Jane',
            age: 25,
            weight: 60,
            height: 165,
            fitnessGoal: 'lose weight',
          },
          recentWorkouts: [],
          todayNutrition: {
            entries: [],
            dailyTotals: {
              calories: null,
              protein: null,
              carbohydrates: null,
              fats: null,
              sugar: null,
              sodium: null,
            },
          },
          activeSupplements: [],
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toBeDefined();
    expect(buildSystemPrompt).toHaveBeenCalled();
  });
});
