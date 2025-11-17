'use client';

import { useState, useEffect } from 'react';

interface CompletedDocumentModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompletedDocumentModal({
  documentId,
  isOpen,
  onClose,
}: CompletedDocumentModalProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && documentId) {
      fetchPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, documentId]);

  const fetchPreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}/preview-completed`);

      if (!response.ok) {
        throw new Error('Failed to load preview');
      }

      const data = await response.json();
      setHtmlContent(data.content);
    } catch (err) {
      console.error('Preview error:', err);
      setError('Failed to load document preview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-dark-panel border border-dark-border rounded-lg w-full max-w-5xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-dark-border">
          <h2 className="text-xl font-bold text-gray-100">Document Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors p-2"
            aria-label="Close preview"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-400">Loading preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-900/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchPreview}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && htmlContent && (
            <div
              className="prose prose-invert max-w-none bg-white text-gray-900 p-8 rounded shadow-lg"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-dark-lighter border border-dark-border text-gray-200 rounded-lg hover:bg-dark-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
