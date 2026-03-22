import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  onClear,
  disabled = false,
  maxSizeMB = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are supported');
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Image size must be under ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);
      onImageSelect(file, previewUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {!preview ? (
        <Card padding="lg" className="border-dashed border-2 border-white/20">
          <div className="text-center">
            <div className="text-4xl mb-4">📸</div>
            <Button
              onClick={handleButtonClick}
              disabled={disabled}
              variant="primary"
              className="mb-2"
            >
              Choose Image
            </Button>
            <p className="text-sm text-white/60">
              JPEG, PNG, or WebP (max {maxSizeMB}MB)
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="md">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
            <Button
              onClick={handleClear}
              variant="danger"
              size="sm"
              className="absolute top-2 right-2"
            >
              Clear
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
};
