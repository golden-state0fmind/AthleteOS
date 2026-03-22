/**
 * Request Validation Schemas
 * 
 * This module provides Zod schemas for validating API request payloads.
 * 
 * Requirements:
 * - 27.1: Input validation for all API routes
 */

import { z } from 'zod';

/**
 * Schema for workout image analysis requests
 * 
 * Validates:
 * - image: base64-encoded image data (non-empty string)
 * - mimeType: one of the supported image formats
 */
export const WorkoutImageSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    errorMap: () => ({ message: 'Invalid image format. Supported formats: JPEG, PNG, WebP' }),
  }),
});

export type WorkoutImageRequest = z.infer<typeof WorkoutImageSchema>;

/**
 * Schema for nutrition label image analysis requests
 */
export const NutritionImageSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    errorMap: () => ({ message: 'Invalid image format. Supported formats: JPEG, PNG, WebP' }),
  }),
});

export type NutritionImageRequest = z.infer<typeof NutritionImageSchema>;

/**
 * Schema for supplement analysis requests
 */
export const SupplementRequestSchema = z.object({
  supplementName: z.string().min(1, 'Supplement name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  allSupplements: z.array(
    z.object({
      name: z.string(),
      dosage: z.string(),
    })
  ).optional(),
});

export type SupplementRequest = z.infer<typeof SupplementRequestSchema>;

/**
 * Schema for chat requests with user context
 */
export const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long (max 2000 characters)'),
  context: z.object({
    userProfile: z.object({
      name: z.string(),
      age: z.number().min(13).max(120),
      weight: z.number().min(20).max(300),
      height: z.number().min(100).max(250),
      fitnessGoal: z.enum(['lose weight', 'build muscle', 'maintain', 'performance']),
    }),
    recentWorkouts: z.array(z.any()),
    todayNutrition: z.any().optional(),
    activeSupplements: z.array(z.any()),
  }),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
