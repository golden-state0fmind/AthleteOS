/**
 * Claude API Client Configuration
 * 
 * This module provides a configured Anthropic SDK client for server-side use.
 * The API key is sourced from environment variables and never exposed to the client.
 * 
 * Requirements:
 * - 1.1: API key stored in environment variables
 * - 1.2: Model constant defined
 * - 1.3: Environment validation
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude model identifier for all API requests
 * Using Claude Sonnet 4 (2025-05-14 release)
 */
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

/**
 * Validates that required environment variables are present
 * 
 * @throws {Error} If ANTHROPIC_API_KEY is not set
 */
export function validateEnvironment(): void {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not set. ' +
      'Please configure it in your Vercel environment settings or .env.local file.'
    );
  }
}

/**
 * Configured Anthropic client instance
 * 
 * This client is initialized with the API key from environment variables.
 * It should only be used in server-side contexts (API routes, server components).
 * 
 * @throws {Error} If ANTHROPIC_API_KEY is not set (via validateEnvironment)
 */
export function getClaudeClient(): Anthropic {
  validateEnvironment();
  
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

/**
 * Default export for convenience
 * Note: This will throw if environment is not properly configured
 */
let defaultClient: Anthropic | null = null;

export function getDefaultClient(): Anthropic {
  if (!defaultClient) {
    defaultClient = getClaudeClient();
  }
  return defaultClient;
}
