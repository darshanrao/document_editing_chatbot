'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface FileUploadProps {
  onUploadStart?: () => void;
  onUploadComplete?: (documentId: string) => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({
  onUploadStart,
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.name.endsWith('.docx')) {
      return 'Please upload a .docx file';
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      onUploadError?.(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    onUploadStart?.();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onUploadComplete?.(data.documentId);

      // Redirect to processing page
      router.push(`/process/${data.documentId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-3 border-dashed rounded-lg p-16 text-center
          transition-all duration-300 cursor-pointer
          ${isDragging
            ? 'border-primary bg-dark-lighter'
            : 'border-dark-border bg-dark-panel hover:border-primary hover:bg-dark-lighter'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !isUploading && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".docx"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-dark-border rounded-full flex items-center justify-center text-5xl">
            📄
          </div>

          {isUploading ? (
            <>
              <h3 className="text-xl font-semibold text-gray-200">Uploading...</h3>
              <div className="w-48 h-2 bg-dark-border rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse w-1/2"></div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-200">
                Drop your document here
              </h3>
              <p className="text-gray-400">or click to browse</p>
              <p className="text-sm text-gray-500 mt-2">
                Supports .docx files up to 10MB
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-dark-lighter border-l-4 border-primary rounded">
        <p className="text-sm">
          <strong className="text-primary">💡 What happens next?</strong>
          <br />
          <span className="text-gray-400">
            We&apos;ll analyze your document, identify all placeholders like [CLIENT_NAME],
            and guide you through filling them in a conversational way.
          </span>
        </p>
      </div>
    </div>
  );
}
