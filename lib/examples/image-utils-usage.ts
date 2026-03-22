/**
 * Example Usage: Image Validation and Conversion Utilities
 * 
 * This file demonstrates how to use the image validation and conversion
 * utilities for workout and nutrition image uploads.
 */

import {
  validateImageUpload,
  imageToBase64,
  validateAndConvertImage,
  SUPPORTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from '../imageUtils';

/**
 * Example 1: Basic image validation
 * 
 * Validate an image file before processing
 */
export async function example1_basicValidation(file: File) {
  const result = validateImageUpload(file);

  if (!result.valid) {
    console.error('Validation failed:', result.error);
    return;
  }

  console.log('Image is valid!');
  console.log('MIME type:', result.mimeType);
  console.log('Size:', (result.sizeBytes! / 1024).toFixed(2), 'KB');
}

/**
 * Example 2: Convert image to base64
 * 
 * Convert a validated image to base64 for API transmission
 */
export async function example2_convertToBase64(file: File) {
  // First validate
  const validation = validateImageUpload(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Then convert
  const base64 = await imageToBase64(file);
  console.log('Base64 length:', base64.length);
  console.log('First 50 chars:', base64.substring(0, 50));

  return base64;
}

/**
 * Example 3: Validate and convert in one step
 * 
 * Use the convenience function for both operations
 */
export async function example3_validateAndConvert(file: File) {
  const result = await validateAndConvertImage(file);

  if (!result.valid) {
    console.error('Error:', result.error);
    return null;
  }

  console.log('Success!');
  console.log('MIME type:', result.mimeType);
  console.log('Base64 ready for API');

  return {
    base64: result.base64!,
    mimeType: result.mimeType!,
  };
}

/**
 * Example 4: Handle file input in a React component
 * 
 * Typical usage in a file upload handler
 */
export async function example4_fileInputHandler(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    console.error('No file selected');
    return;
  }

  // Validate and convert
  const result = await validateAndConvertImage(file);

  if (!result.valid) {
    // Show error to user
    alert(result.error);
    return;
  }

  // Send to API
  try {
    const response = await fetch('/api/analyze-workout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: result.base64,
        mimeType: result.mimeType,
      }),
    });

    const data = await response.json();
    console.log('Analysis result:', data);
  } catch (error) {
    console.error('API error:', error);
  }
}

/**
 * Example 5: Pre-upload validation with user feedback
 * 
 * Validate before showing upload progress
 */
export function example5_preUploadValidation(file: File): {
  canUpload: boolean;
  message: string;
} {
  const result = validateImageUpload(file);

  if (!result.valid) {
    return {
      canUpload: false,
      message: result.error!,
    };
  }

  const sizeMB = (result.sizeBytes! / (1024 * 1024)).toFixed(2);
  return {
    canUpload: true,
    message: `Ready to upload ${file.name} (${sizeMB}MB)`,
  };
}

/**
 * Example 6: Check supported formats
 * 
 * Display supported formats to user
 */
export function example6_displaySupportedFormats() {
  console.log('Supported image formats:');
  SUPPORTED_IMAGE_TYPES.forEach((type) => {
    const extension = type.split('/')[1].toUpperCase();
    console.log(`- ${extension} (${type})`);
  });

  const maxSizeMB = MAX_IMAGE_SIZE_BYTES / (1024 * 1024);
  console.log(`\nMaximum file size: ${maxSizeMB}MB`);
}

/**
 * Example 7: Batch validation
 * 
 * Validate multiple files at once
 */
export async function example7_batchValidation(files: FileList) {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = validateImageUpload(file);

    results.push({
      filename: file.name,
      valid: result.valid,
      error: result.error,
    });
  }

  const validCount = results.filter((r) => r.valid).length;
  console.log(`${validCount} of ${files.length} files are valid`);

  return results;
}

/**
 * Example 8: Error handling with user-friendly messages
 * 
 * Convert technical errors to user-friendly messages
 */
export function example8_userFriendlyErrors(file: File): string {
  const result = validateImageUpload(file);

  if (result.valid) {
    return 'Image is ready to upload!';
  }

  // Convert technical errors to user-friendly messages
  if (result.error?.includes('Unsupported image format')) {
    return 'Please upload a JPEG, PNG, or WebP image.';
  }

  if (result.error?.includes('exceeds maximum allowed size')) {
    return 'Image is too large. Please choose an image under 10MB.';
  }

  if (result.error?.includes('No file provided')) {
    return 'Please select an image file.';
  }

  return 'Unable to process this image. Please try another file.';
}
