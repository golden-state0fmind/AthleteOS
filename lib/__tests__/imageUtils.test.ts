/**
 * Unit Tests for Image Validation Utilities
 * 
 * Tests the image validation and conversion functions.
 * 
 * Requirements tested:
 * - 2.2: Accept JPEG, PNG, WebP formats
 * - 2.4: Support images up to 10MB
 * - 2.5: Display error for failed uploads
 * - 6.2: Accept JPEG, PNG, WebP formats
 * - 6.4: Support images up to 10MB
 */

import {
  validateImageUpload,
  imageToBase64,
  validateAndConvertImage,
  SUPPORTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from '../imageUtils';

describe('imageUtils', () => {
  describe('validateImageUpload', () => {
    it('should accept valid JPEG image', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateImageUpload(file);

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PNG image', () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const result = validateImageUpload(file);

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/png');
      expect(result.error).toBeUndefined();
    });

    it('should accept valid WebP image', () => {
      const file = new File(['test'], 'test.webp', { type: 'image/webp' });
      const result = validateImageUpload(file);

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/webp');
      expect(result.error).toBeUndefined();
    });

    it('should reject unsupported image format', () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      const result = validateImageUpload(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported image format');
      expect(result.error).toContain('image/gif');
    });

    it('should reject non-image file', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = validateImageUpload(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported image format');
    });

    it('should reject image exceeding 10MB size limit', () => {
      // Create a file larger than 10MB
      const largeContent = new Array(MAX_IMAGE_SIZE_BYTES + 1).fill('x').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = validateImageUpload(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size of 10MB');
    });

    it('should accept image at exactly 10MB', () => {
      // Create a file at exactly 10MB
      const content = new Array(MAX_IMAGE_SIZE_BYTES).fill('x').join('');
      const file = new File([content], 'exact.jpg', { type: 'image/jpeg' });
      const result = validateImageUpload(file);

      expect(result.valid).toBe(true);
      expect(result.sizeBytes).toBe(MAX_IMAGE_SIZE_BYTES);
    });

    it('should reject null file', () => {
      const result = validateImageUpload(null as any);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('No file provided');
    });

    it('should reject undefined file', () => {
      const result = validateImageUpload(undefined as any);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('No file provided');
    });

    it('should include file size in validation result', () => {
      const content = 'test content';
      const file = new File([content], 'test.jpg', { type: 'image/jpeg' });
      const result = validateImageUpload(file);

      expect(result.valid).toBe(true);
      expect(result.sizeBytes).toBe(content.length);
    });
  });

  describe('imageToBase64', () => {
    it('should convert image file to base64 string', async () => {
      const content = 'test image content';
      const file = new File([content], 'test.jpg', { type: 'image/jpeg' });

      const base64 = await imageToBase64(file);

      expect(base64).toBeTruthy();
      expect(typeof base64).toBe('string');
      // Base64 should not include data URL prefix
      expect(base64).not.toContain('data:');
      expect(base64).not.toContain('base64,');
    });

    it('should handle different image types', async () => {
      const types = ['image/jpeg', 'image/png', 'image/webp'];

      for (const type of types) {
        const file = new File(['content'], `test.${type.split('/')[1]}`, { type });
        const base64 = await imageToBase64(file);

        expect(base64).toBeTruthy();
        expect(typeof base64).toBe('string');
      }
    });

    it('should produce consistent output for same input', async () => {
      const content = 'consistent content';
      const file1 = new File([content], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File([content], 'test2.jpg', { type: 'image/jpeg' });

      const base64_1 = await imageToBase64(file1);
      const base64_2 = await imageToBase64(file2);

      expect(base64_1).toBe(base64_2);
    });

    it('should handle empty file', async () => {
      const file = new File([], 'empty.jpg', { type: 'image/jpeg' });
      const base64 = await imageToBase64(file);

      expect(base64).toBeTruthy();
      expect(typeof base64).toBe('string');
    });
  });

  describe('validateAndConvertImage', () => {
    it('should validate and convert valid image', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await validateAndConvertImage(file);

      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.base64).toBeTruthy();
      expect(result.error).toBeUndefined();
    });

    it('should return validation error without attempting conversion', async () => {
      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      const result = await validateAndConvertImage(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported image format');
      expect(result.base64).toBeUndefined();
    });

    it('should return error for oversized image without conversion', async () => {
      const largeContent = new Array(MAX_IMAGE_SIZE_BYTES + 1).fill('x').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = await validateAndConvertImage(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
      expect(result.base64).toBeUndefined();
    });

    it('should handle all supported formats', async () => {
      for (const mimeType of SUPPORTED_IMAGE_TYPES) {
        const extension = mimeType.split('/')[1];
        const file = new File(['content'], `test.${extension}`, { type: mimeType });
        const result = await validateAndConvertImage(file);

        expect(result.valid).toBe(true);
        expect(result.mimeType).toBe(mimeType);
        expect(result.base64).toBeTruthy();
      }
    });
  });

  describe('constants', () => {
    it('should export correct supported image types', () => {
      expect(SUPPORTED_IMAGE_TYPES).toEqual([
        'image/jpeg',
        'image/png',
        'image/webp',
      ]);
    });

    it('should export correct max image size', () => {
      expect(MAX_IMAGE_SIZE_BYTES).toBe(10 * 1024 * 1024);
    });
  });
});
