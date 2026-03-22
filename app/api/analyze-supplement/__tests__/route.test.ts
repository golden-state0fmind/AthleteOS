/**
 * Unit tests for POST /api/analyze-supplement
 * 
 * Tests:
 * - Successful analysis with valid supplement data
 * - Error handling for invalid format
 * - Error handling for missing data
 * - Error handling for Claude API errors
 * - Interaction detection with multiple supplements
 * - Single supplement without interactions
 * 
 * Requirements:
 * - 11.3: Receive supplement data from client
 * - 12.1: Send supplement data to Claude API
 * - 12.3: Return structured data with safety notes and effectiveness
 * - 13.1: Send all supplements for interaction detection
 * - 13.2: Request Claude API to identify potential interactions
 */

import { POST } from '../route';
import { analyzeSupplementWithClaude } from '@/lib/supplementAnalysis';

// Mock the supplement analysis utility
jest.mock('@/lib/supplementAnalysis', () => ({
  analyzeSupplementWithClaude: jest.fn(),
}));

describe('POST /api/analyze-supplement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return structured supplement analysis for valid request', async () => {
    // Mock Claude API response
    const mockAnalysis = {
      safetyNotes: 'Vitamin D is generally safe at recommended doses. Consult a healthcare professional before use. This is not medical advice.',
      effectiveness: 'Vitamin D supports bone health and immune function. Effective for preventing deficiency.',
      interactions: null,
    };

    (analyzeSupplementWithClaude as jest.Mock).mockResolvedValue(mockAnalysis);

    // Create mock request
    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplementName: 'Vitamin D',
        dosage: '2000 IU',
      }),
    });

    // Call API route
    const response = await POST(request);
    const data = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual(mockAnalysis);
    expect(analyzeSupplementWithClaude).toHaveBeenCalledWith(
      'Vitamin D',
      '2000 IU',
      undefined
    );
  });

  it('should detect interactions when multiple supplements provided', async () => {
    // Mock response with interactions
    const mockAnalysis = {
      safetyNotes: 'Calcium is generally safe. High doses may cause constipation. Consult a healthcare professional. This is not medical advice.',
      effectiveness: 'Calcium supports bone health and muscle function.',
      interactions: [
        {
          supplement1: 'Calcium',
          supplement2: 'Iron',
          severity: 'medium' as const,
          description: 'Calcium may reduce iron absorption. Take at different times of day.',
        },
      ],
    };

    (analyzeSupplementWithClaude as jest.Mock).mockResolvedValue(mockAnalysis);

    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplementName: 'Calcium',
        dosage: '500mg',
        allSupplements: [
          { name: 'Calcium', dosage: '500mg' },
          { name: 'Iron', dosage: '18mg' },
        ],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.interactions).toHaveLength(1);
    expect(data.interactions[0].severity).toBe('medium');
    expect(analyzeSupplementWithClaude).toHaveBeenCalledWith(
      'Calcium',
      '500mg',
      [
        { name: 'Calcium', dosage: '500mg' },
        { name: 'Iron', dosage: '18mg' },
      ]
    );
  });

  it('should return 400 for missing supplement name', async () => {
    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dosage: '500mg',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toBeDefined();
  });

  it('should return 400 for missing dosage', async () => {
    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplementName: 'Vitamin C',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });

  it('should return 400 for empty supplement name', async () => {
    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplementName: '',
        dosage: '500mg',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });

  it('should return 500 when Claude returns invalid JSON', async () => {
    (analyzeSupplementWithClaude as jest.Mock).mockRejectedValue(
      new SyntaxError('Unexpected token in JSON')
    );

    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplementName: 'Magnesium',
        dosage: '400mg',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to parse analysis results');
  });

  it('should return 500 when Claude returns incomplete data structure', async () => {
    const incompleteData = {
      safetyNotes: 'Some safety notes',
      // Missing effectiveness field
    };

    (analyzeSupplementWithClaude as jest.Mock).mockResolvedValue(incompleteData);

    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplementName: 'Zinc',
        dosage: '15mg',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Invalid analysis results');
  });

  it('should return 429 for rate limit errors', async () => {
    (analyzeSupplementWithClaude as jest.Mock).mockRejectedValue(
      new Error('Rate limit exceeded (429)')
    );

    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplementName: 'Omega-3',
        dosage: '1000mg',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Rate limit exceeded');
  });

  it('should return 503 for Claude API unavailability', async () => {
    (analyzeSupplementWithClaude as jest.Mock).mockRejectedValue(
      new Error('Service unavailable (503)')
    );

    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplementName: 'Protein Powder',
        dosage: '30g',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain('temporarily unavailable');
  });

  it('should handle high severity interactions', async () => {
    const mockAnalysis = {
      safetyNotes: 'Warfarin requires careful monitoring. Consult a healthcare professional. This is not medical advice.',
      effectiveness: 'Warfarin is an anticoagulant used to prevent blood clots.',
      interactions: [
        {
          supplement1: 'Warfarin',
          supplement2: 'Vitamin K',
          severity: 'high' as const,
          description: 'Vitamin K can significantly reduce warfarin effectiveness. Avoid this combination or consult your doctor.',
        },
      ],
    };

    (analyzeSupplementWithClaude as jest.Mock).mockResolvedValue(mockAnalysis);

    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplementName: 'Warfarin',
        dosage: '5mg',
        allSupplements: [
          { name: 'Warfarin', dosage: '5mg' },
          { name: 'Vitamin K', dosage: '100mcg' },
        ],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.interactions).toHaveLength(1);
    expect(data.interactions[0].severity).toBe('high');
  });

  it('should handle multiple interactions', async () => {
    const mockAnalysis = {
      safetyNotes: 'St. John\'s Wort may interact with many medications. Consult a healthcare professional. This is not medical advice.',
      effectiveness: 'St. John\'s Wort may help with mild depression.',
      interactions: [
        {
          supplement1: 'St. John\'s Wort',
          supplement2: 'Antidepressant',
          severity: 'high' as const,
          description: 'May cause serotonin syndrome. Do not combine.',
        },
        {
          supplement1: 'St. John\'s Wort',
          supplement2: 'Birth Control',
          severity: 'high' as const,
          description: 'May reduce birth control effectiveness.',
        },
      ],
    };

    (analyzeSupplementWithClaude as jest.Mock).mockResolvedValue(mockAnalysis);

    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplementName: 'St. John\'s Wort',
        dosage: '300mg',
        allSupplements: [
          { name: 'St. John\'s Wort', dosage: '300mg' },
          { name: 'Antidepressant', dosage: '50mg' },
          { name: 'Birth Control', dosage: '1 pill' },
        ],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.interactions).toHaveLength(2);
  });

  it('should handle generic server errors', async () => {
    (analyzeSupplementWithClaude as jest.Mock).mockRejectedValue(
      new Error('Unexpected error')
    );

    const request = new Request('http://localhost:3000/api/analyze-supplement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplementName: 'Creatine',
        dosage: '5g',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Failed to analyze supplement');
  });
});
