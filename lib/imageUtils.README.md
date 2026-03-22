# Image Validation and Conversion Utilities

This module provides utilities for validating and converting images for use with Claude API vision analysis in AthleteOS.

## Overview

The image utilities handle:
- **Format validation**: Ensures images are JPEG, PNG, or WebP
- **Size validation**: Enforces 10MB maximum file size
- **Base64 conversion**: Converts images for API transmission
- **Error handling**: Provides descriptive error messages

## Requirements

Implements the following requirements:
- **2.2, 6.2**: Accept JPEG, PNG, WebP formats
- **2.4, 6.4**: Support images up to 10MB
- **2.5**: Display descriptive error messages for failed uploads

## API Reference

### Constants

#### `SUPPORTED_IMAGE_TYPES`
```typescript
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
```
Array of supported MIME types for image uploads.

#### `MAX_IMAGE_SIZE_BYTES`
```typescript
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
```
Maximum allowed image size in bytes.

### Types

#### `SupportedImageType`
```typescript
type SupportedImageType = 'image/jpeg' | 'image/png' | 'image/webp';
```

#### `ImageValidationResult`
```typescript
interface ImageValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: SupportedImageType;
  sizeBytes?: number;
}
```

### Functions

#### `validateImageUpload(file: File): ImageValidationResult`

Validates an uploaded image file.

**Checks:**
- File format is JPEG, PNG, or WebP
- File size does not exceed 10MB

**Parameters:**
- `file`: The File object to validate

**Returns:**
- `ImageValidationResult` with validation status and error message if invalid

**Example:**
```typescript
const result = validateImageUpload(file);
if (!result.valid) {
  console.error(result.error);
  return;
}
console.log('Valid image:', result.mimeType);
```

#### `imageToBase64(file: File): Promise<string>`

Converts an image File to base64 string.

**Parameters:**
- `file`: The image File to convert

**Returns:**
- Promise resolving to base64-encoded string (without data URL prefix)

**Throws:**
- Error if file reading fails

**Example:**
```typescript
const base64 = await imageToBase64(file);
// Use with Claude API
const response = await analyzeImage(base64, file.type);
```

**Note:** The returned base64 string does NOT include the data URL prefix (e.g., `data:image/jpeg;base64,`). This is the format expected by the Claude API.

#### `validateAndConvertImage(file: File): Promise<ImageValidationResult & { base64?: string }>`

Validates and converts an image file in one operation.

**Parameters:**
- `file`: The image File to validate and convert

**Returns:**
- Promise resolving to validation result with base64 data if valid

**Example:**
```typescript
const result = await validateAndConvertImage(file);
if (result.valid) {
  await sendToAPI(result.base64, result.mimeType);
} else {
  console.error(result.error);
}
```

## Usage Examples

### Basic Validation

```typescript
import { validateImageUpload } from './imageUtils';

function handleFileSelect(file: File) {
  const result = validateImageUpload(file);
  
  if (!result.valid) {
    alert(result.error);
    return;
  }
  
  console.log('Valid image:', result.mimeType);
  console.log('Size:', (result.sizeBytes / 1024).toFixed(2), 'KB');
}
```

### Validate and Convert

```typescript
import { validateAndConvertImage } from './imageUtils';

async function uploadWorkoutImage(file: File) {
  const result = await validateAndConvertImage(file);
  
  if (!result.valid) {
    throw new Error(result.error);
  }
  
  // Send to API
  const response = await fetch('/api/analyze-workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: result.base64,
      mimeType: result.mimeType,
    }),
  });
  
  return response.json();
}
```

### React Component Integration

```typescript
import { validateAndConvertImage } from '@/lib/imageUtils';

function WorkoutUploader() {
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const result = await validateAndConvertImage(file);
    
    if (!result.valid) {
      setError(result.error!);
      return;
    }
    
    setError(null);
    // Proceed with upload
    await uploadToAPI(result.base64!, result.mimeType!);
  };
  
  return (
    <div>
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Pre-Upload Validation

```typescript
import { validateImageUpload, SUPPORTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from './imageUtils';

function ImageUploadForm() {
  const handleFileSelect = (file: File) => {
    const result = validateImageUpload(file);
    
    if (!result.valid) {
      // Show user-friendly error
      if (result.error?.includes('Unsupported image format')) {
        alert('Please upload a JPEG, PNG, or WebP image.');
      } else if (result.error?.includes('exceeds maximum allowed size')) {
        alert('Image is too large. Please choose an image under 10MB.');
      } else {
        alert(result.error);
      }
      return;
    }
    
    // Show upload preview
    const sizeMB = (result.sizeBytes! / (1024 * 1024)).toFixed(2);
    console.log(`Ready to upload: ${file.name} (${sizeMB}MB)`);
  };
}
```

## Error Messages

The validation functions provide descriptive error messages:

| Error | Cause | User Action |
|-------|-------|-------------|
| `No file provided` | File is null or undefined | Select a file |
| `Unsupported image format: {type}` | File is not JPEG, PNG, or WebP | Choose a supported format |
| `Image size ({size}MB) exceeds maximum allowed size of 10MB` | File is too large | Compress or resize the image |
| `Failed to read file: {error}` | FileReader error | Try a different file |

## Integration with API Routes

The utilities are designed to work seamlessly with the AthleteOS API routes:

```typescript
// In /api/analyze-workout or /api/analyze-nutrition
import { validateImageUpload } from '@/lib/imageUtils';

export async function POST(request: Request) {
  const { image, mimeType } = await request.json();
  
  // Validation happens client-side, but you can add server-side checks
  // The base64 string is ready to send to Claude API
  
  const response = await claudeClient.messages.create({
    model: CLAUDE_MODEL,
    messages: [{
      role: 'user',
      content: [{
        type: 'image',
        source: {
          type: 'base64',
          media_type: mimeType,
          data: image, // Already in correct format
        },
      }],
    }],
  });
  
  return Response.json(response);
}
```

## Testing

The module includes comprehensive unit tests covering:
- Valid image formats (JPEG, PNG, WebP)
- Invalid formats (GIF, PDF, etc.)
- Size limits (under, at, and over 10MB)
- Base64 conversion
- Error handling
- Edge cases (null, undefined, empty files)

Run tests:
```bash
npm test -- lib/__tests__/imageUtils.test.ts
```

## Privacy and Security

- **No persistence**: Images are converted to base64 in memory and never saved to disk
- **Client-side processing**: Validation and conversion happen in the browser
- **Transient transmission**: Base64 data is sent to API routes and immediately discarded after analysis
- **No server storage**: API routes process images in memory only

This aligns with AthleteOS privacy requirements (23.1-23.5).

## Performance Considerations

- **File size limit**: 10MB maximum prevents excessive memory usage
- **Efficient conversion**: FileReader API is used for optimal performance
- **Early validation**: Format and size checks happen before conversion
- **Memory cleanup**: Base64 strings are garbage collected after use

## Browser Compatibility

The utilities use standard Web APIs:
- `File` API (all modern browsers)
- `FileReader` API (all modern browsers)
- `Promise` (all modern browsers)

No polyfills required for target browsers (iOS Safari 14+, Chrome 90+, Firefox 88+).

## Related Modules

- `lib/claudeClient.ts`: Claude API client configuration
- `/api/analyze-workout`: Workout image analysis endpoint
- `/api/analyze-nutrition`: Nutrition label analysis endpoint
- `lib/examples/image-utils-usage.ts`: Additional usage examples

## Future Enhancements

Potential improvements for future versions:
- Image compression before upload
- Client-side image preview
- Progress tracking for large files
- Support for additional formats (AVIF, HEIC)
- Batch upload support
- Image metadata extraction
