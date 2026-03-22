/**
 * Image Validation and Conversion Utilities
 * 
 * This module provides utilities for validating and converting images
 * for use with Claude API vision analysis.
 * 
 * Requirements:
 * - 2.2: Accept JPEG, PNG, WebP formats
 * - 2.4: Support images up to 10MB
 * - 6.2: Accept JPEG, PNG, WebP formats
 * - 6.4: Support images up to 10MB
 */

/**
 * Supported image MIME types for upload
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type SupportedImageType = typeof SUPPORTED_IMAGE_TYPES[number];

/**
 * Maximum allowed image size in bytes (10MB)
 */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Result of image validation
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: SupportedImageType;
  sizeBytes?: number;
}

/**
 * Validates an uploaded image file
 * 
 * Checks:
 * - File format is JPEG, PNG, or WebP
 * - File size does not exceed 10MB
 * 
 * @param file - The File object to validate
 * @returns Validation result with error message if invalid
 * 
 * @example
 * ```typescript
 * const result = validateImageUpload(file);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateImageUpload(file: File): ImageValidationResult {
  // Check if file exists
  if (!file) {
    return {
      valid: false,
      error: 'No file provided',
    };
  }

  // Check file type
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as SupportedImageType)) {
    return {
      valid: false,
      error: `Unsupported image format: ${file.type}. Supported formats: JPEG, PNG, WebP`,
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Image size (${sizeMB}MB) exceeds maximum allowed size of 10MB`,
    };
  }

  return {
    valid: true,
    mimeType: file.type as SupportedImageType,
    sizeBytes: file.size,
  };
}

/**
 * Converts an image File to base64 string
 * 
 * This is used to prepare images for transmission to the Claude API.
 * The base64 string does NOT include the data URL prefix (e.g., "data:image/jpeg;base64,")
 * 
 * @param file - The image File to convert
 * @returns Promise resolving to base64-encoded string (without data URL prefix)
 * @throws {Error} If file reading fails
 * 
 * @example
 * ```typescript
 * const base64 = await imageToBase64(file);
 * // Use with Claude API
 * const response = await analyzeImage(base64, file.type);
 * ```
 */
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${reader.error?.message || 'Unknown error'}`));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates and converts an image file in one operation
 * 
 * Convenience function that combines validation and conversion.
 * 
 * @param file - The image File to validate and convert
 * @returns Promise resolving to object with validation result and base64 data
 * 
 * @example
 * ```typescript
 * const result = await validateAndConvertImage(file);
 * if (result.valid) {
 *   await sendToAPI(result.base64, result.mimeType);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function validateAndConvertImage(
  file: File
): Promise<ImageValidationResult & { base64?: string }> {
  const validation = validateImageUpload(file);

  if (!validation.valid) {
    return validation;
  }

  try {
    const base64 = await imageToBase64(file);
    return {
      ...validation,
      base64,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to convert image to base64',
    };
  }
}
