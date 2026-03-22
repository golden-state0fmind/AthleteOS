/**
 * Unit tests for supplementAnalysis utility
 * 
 * Tests:
 * - Successful analysis with single supplement
 * - Successful analysis with interaction detection
 * - Proper prompt construction
 * - Error handling for Claude API failures
 * 
 * Requirements:
 * - 12.1: Send supplement data to Claude API
 * - 12.2: Request safety notes and effectiveness information
 * - 13.1: Send all supplements for interaction detection
 * - 13.2: Request Claude API to identify potential interactions
 */

import { analyzeSupplementWithClaude } from '../supplementAnalysis';
import { getDefaultClient } from '../claudeClient';

// Mock the Claude client
jest.mock('../claudeClient', () => ({
  getDefaultClient: jest.fn(),
  CLAUDE_MODEL: 'claude-sonnet-4-20250514',
}));

describe('analyzeSupplementWithClaude', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCreate = jest.fn();
    (getDefaultClient as jest.Mock).mockReturnValue({
      messages: {
        create: mockCreate,
      },
    });
  });

  it('should analyze a single supplement without interactions', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            safetyNotes: 'Vitamin D is generally safe at recommended doses. Consult a healthcare professional. This is not medical advice.',
            effectiveness: 'Supports bone health and immune function.',
            interactions: null,
          }),
        },
      ],
    };

    mockCreate.mockResolvedValue(mockResponse);

    const result = await analyzeSupplementWithClaude('Vitamin D', '2000 IU');

    expect(result.safetyNotes).toContain('Vitamin D');
    expect(result.safetyNotes).toContain('not medical advice');
    expect(result.effectiveness).toContain('bone health');
    expect(result.interactions).toBeNull();
    
    // Verify Claude API was called with correct parameters
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Vitamin D'),
          }),
        ]),
      })
    );
  });

  it('should detect interactions when multiple supplements provided', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            safetyNotes: 'Calcium is generally safe. This is not medical advice.',
            effectiveness: 'Supports bone health.',
            interactions: [
              {
                supplement1: 'Calcium',
                supplement2: 'Iron',
                severity: 'medium',
                description: 'Calcium may reduce iron absorption.',
              },
            ],
          }),
        },
      ],
    };

    mockCreate.mockResolvedValue(mockResponse);

    const result = await analyzeSupplementWithClaude(
      'Calcium',
      '500mg',
      [
        { name: 'Calcium', dosage: '500mg' },
        { name: 'Iron', dosage: '18mg' },
      ]
    );

    expect(result.interactions).toHaveLength(1);
    expect(result.interactions![0].supplement1).toBe('Calcium');
    expect(result.interactions![0].supplement2).toBe('Iron');
    expect(result.interactions![0].severity).toBe('medium');
    
    // Verify prompt includes all supplements
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages[0].content).toContain('Iron');
  });

  it('should include medical disclaimer in prompt', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            safetyNotes: 'Safe supplement. This is not medical advice.',
            effectiveness: 'Effective for health.',
            interactions: null,
          }),
        },
      ],
    };

    mockCreate.mockResolvedValue(mockResponse);

    await analyzeSupplementWithClaude('Magnesium', '400mg');

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages[0].content).toContain('not medical advice');
    expect(callArgs.messages[0].content).toContain('healthcare professional');
  });

  it('should request JSON format in prompt', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            safetyNotes: 'Safe.',
            effectiveness: 'Effective.',
            interactions: null,
          }),
        },
      ],
    };

    mockCreate.mockResolvedValue(mockResponse);

    await analyzeSupplementWithClaude('Zinc', '15mg');

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages[0].content).toContain('Return ONLY valid JSON');
    expect(callArgs.messages[0].content).toContain('safetyNotes');
    expect(callArgs.messages[0].content).toContain('effectiveness');
    expect(callArgs.messages[0].content).toContain('interactions');
  });

  it('should filter out the current supplement from interaction list', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            safetyNotes: 'Safe.',
            effectiveness: 'Effective.',
            interactions: null,
          }),
        },
      ],
    };

    mockCreate.mockResolvedValue(mockResponse);

    await analyzeSupplementWithClaude(
      'Vitamin C',
      '1000mg',
      [
        { name: 'Vitamin C', dosage: '1000mg' },
        { name: 'Vitamin E', dosage: '400 IU' },
      ]
    );

    const callArgs = mockCreate.mock.calls[0][0];
    const prompt = callArgs.messages[0].content;
    
    // Should mention Vitamin E but not duplicate Vitamin C in the "also taking" list
    expect(prompt).toContain('Vitamin E');
    // The prompt should have Vitamin C as the main supplement, not in the "also taking" list
    const alsoTakingSection = prompt.split('also taking these supplements:')[1];
    if (alsoTakingSection) {
      expect(alsoTakingSection).not.toContain('Vitamin C');
    }
  });

  it('should handle Claude API errors', async () => {
    mockCreate.mockRejectedValue(new Error('API Error'));

    await expect(
      analyzeSupplementWithClaude('Omega-3', '1000mg')
    ).rejects.toThrow('API Error');
  });

  it('should handle invalid JSON response', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: 'Not valid JSON',
        },
      ],
    };

    mockCreate.mockResolvedValue(mockResponse);

    await expect(
      analyzeSupplementWithClaude('Protein', '30g')
    ).rejects.toThrow();
  });

  it('should handle empty content array', async () => {
    const mockResponse = {
      content: [],
    };

    mockCreate.mockResolvedValue(mockResponse);

    await expect(
      analyzeSupplementWithClaude('Creatine', '5g')
    ).rejects.toThrow();
  });

  it('should handle non-text content blocks', async () => {
    const mockResponse = {
      content: [
        {
          type: 'image',
          // No text field
        },
      ],
    };

    mockCreate.mockResolvedValue(mockResponse);

    await expect(
      analyzeSupplementWithClaude('BCAA', '5g')
    ).rejects.toThrow();
  });

  it('should handle multiple supplements with no interactions', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            safetyNotes: 'Safe when taken as directed. This is not medical advice.',
            effectiveness: 'Effective for muscle recovery.',
            interactions: null,
          }),
        },
      ],
    };

    mockCreate.mockResolvedValue(mockResponse);

    const result = await analyzeSupplementWithClaude(
      'Protein Powder',
      '30g',
      [
        { name: 'Protein Powder', dosage: '30g' },
        { name: 'Creatine', dosage: '5g' },
        { name: 'BCAA', dosage: '5g' },
      ]
    );

    expect(result.interactions).toBeNull();
    
    // Verify prompt mentions other supplements
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages[0].content).toContain('Creatine');
    expect(callArgs.messages[0].content).toContain('BCAA');
  });

  it('should handle high severity interactions', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            safetyNotes: 'Requires careful monitoring. This is not medical advice.',
            effectiveness: 'Effective anticoagulant.',
            interactions: [
              {
                supplement1: 'Warfarin',
                supplement2: 'Vitamin K',
                severity: 'high',
                description: 'Vitamin K can significantly reduce warfarin effectiveness.',
              },
            ],
          }),
        },
      ],
    };

    mockCreate.mockResolvedValue(mockResponse);

    const result = await analyzeSupplementWithClaude(
      'Warfarin',
      '5mg',
      [
        { name: 'Warfarin', dosage: '5mg' },
        { name: 'Vitamin K', dosage: '100mcg' },
      ]
    );

    expect(result.interactions).toHaveLength(1);
    expect(result.interactions![0].severity).toBe('high');
  });
});
