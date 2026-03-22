/**
 * Unit tests for Claude API client configuration
 */

import { validateEnvironment, getClaudeClient, CLAUDE_MODEL } from '../claudeClient';

describe('claudeClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('CLAUDE_MODEL', () => {
    it('should be defined as claude-sonnet-4-20250514', () => {
      expect(CLAUDE_MODEL).toBe('claude-sonnet-4-20250514');
    });
  });

  describe('validateEnvironment', () => {
    it('should not throw when ANTHROPIC_API_KEY is set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';
      
      expect(() => validateEnvironment()).not.toThrow();
    });

    it('should throw when ANTHROPIC_API_KEY is not set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      
      expect(() => validateEnvironment()).toThrow(
        'ANTHROPIC_API_KEY environment variable is not set'
      );
    });

    it('should throw when ANTHROPIC_API_KEY is empty string', () => {
      process.env.ANTHROPIC_API_KEY = '';
      
      expect(() => validateEnvironment()).toThrow(
        'ANTHROPIC_API_KEY environment variable is not set'
      );
    });
  });

  describe('getClaudeClient', () => {
    it('should return an Anthropic client instance when API key is set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';
      
      const client = getClaudeClient();
      
      expect(client).toBeDefined();
      expect(client.messages).toBeDefined();
    });

    it('should throw when API key is not set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      
      expect(() => getClaudeClient()).toThrow(
        'ANTHROPIC_API_KEY environment variable is not set'
      );
    });

    it('should create a new client instance on each call', () => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';
      
      const client1 = getClaudeClient();
      const client2 = getClaudeClient();
      
      // Each call should create a new instance
      expect(client1).not.toBe(client2);
    });
  });
});
