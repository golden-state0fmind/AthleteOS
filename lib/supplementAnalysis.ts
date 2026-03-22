/**
 * Supplement Analysis Utilities
 * 
 * This module provides utilities for analyzing supplements using Claude API's text capabilities.
 * 
 * Requirements:
 * - 12.1: Send supplement data to Claude API for analysis
 * - 12.2: Request safety notes and effectiveness information
 * - 13.1: Send all supplements for interaction detection
 * - 13.2: Request Claude API to identify potential interactions
 */

import { getDefaultClient, CLAUDE_MODEL } from './claudeClient';

/**
 * Default maximum tokens for supplement analysis responses
 */
export const SUPPLEMENT_MAX_TOKENS = 1024;

/**
 * Supplement analysis response structure
 */
export interface SupplementAnalysisResult {
  safetyNotes: string;
  effectiveness: string;
  interactions: Array<{
    supplement1: string;
    supplement2: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
  }> | null;
}

/**
 * Analyzes a supplement using Claude API for safety and effectiveness information
 * 
 * This utility is used by the /api/analyze-supplement endpoint to provide
 * AI-generated safety notes, effectiveness summaries, and interaction warnings.
 * 
 * @param supplementName - Name of the supplement to analyze
 * @param dosage - Dosage information (e.g., "500mg", "2 capsules")
 * @param allSupplements - Optional array of all current supplements for interaction detection
 * @returns Promise resolving to structured analysis result
 * @throws {Error} If Claude API call fails
 * 
 * @example
 * ```typescript
 * const result = await analyzeSupplementWithClaude(
 *   "Vitamin D",
 *   "2000 IU",
 *   [{ name: "Calcium", dosage: "500mg" }]
 * );
 * console.log(result.safetyNotes);
 * console.log(result.interactions);
 * ```
 */
export async function analyzeSupplementWithClaude(
  supplementName: string,
  dosage: string,
  allSupplements?: Array<{ name: string; dosage: string }>
): Promise<SupplementAnalysisResult> {
  const claudeClient = getDefaultClient();

  // Build the analysis prompt
  let prompt = `Provide brief safety and effectiveness information for this supplement:

Supplement: ${supplementName}
Dosage: ${dosage}

IMPORTANT: Include a disclaimer that this is not medical advice and users should consult healthcare professionals.`;

  // Add interaction detection if multiple supplements provided
  if (allSupplements && allSupplements.length > 1) {
    prompt += `\n\nThe user is also taking these supplements:\n`;
    allSupplements
      .filter((s) => s.name !== supplementName)
      .forEach((s) => {
        prompt += `- ${s.name} (${s.dosage})\n`;
      });
    prompt += `\nIdentify any potential interactions between these supplements. Consider both the new supplement and existing supplements.`;
  }

  // Specify the expected JSON response format
  prompt += `\n\nReturn ONLY valid JSON in this exact format:
{
  "safetyNotes": "string (brief safety information with medical disclaimer)",
  "effectiveness": "string (brief effectiveness summary)",
  "interactions": [
    {
      "supplement1": "string",
      "supplement2": "string",
      "severity": "high" | "medium" | "low",
      "description": "string"
    }
  ] or null
}

If no interactions are found, set "interactions" to null.`;

  // Call Claude API
  const message = await claudeClient.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: SUPPLEMENT_MAX_TOKENS,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text content from response
  const textContent = message.content.find((block) => block.type === 'text');
  const responseText = textContent && textContent.type === 'text' ? textContent.text : '{}';

  // Parse and return the structured result
  const result: SupplementAnalysisResult = JSON.parse(responseText);
  return result;
}
