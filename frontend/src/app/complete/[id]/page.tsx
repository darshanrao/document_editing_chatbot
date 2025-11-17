'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CompletedDocumentModal from '@/components/CompletedDocumentModal';

interface DocumentSummary {
  filename: string;
  fieldsCompleted: number;
  totalFields: number;
  completionTime: string;
}

export default function CompletePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = use(params);
  const router = useRouter();
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    // Fetch document summary
    const fetchSummary = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/summary`);
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    };

    fetchSummary();
  }, [documentId]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = summary?.filename || 'completed_document.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link 
            href="/"
            className="inline-block text-2xl font-bold text-primary mb-8 hover:opacity-80 transition-opacity cursor-pointer"
          >
            ⚖️ LegalDoc Filler
          </Link>
        </div>

        {/* Success Content */}
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-success rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-5xl text-white">✓</span>
          </div>

          <h2 className="text-4xl font-bold text-gray-100 mb-4">
            Document Complete! 🎉
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            All {summary?.totalFields || 0} placeholders have been filled. Your document is ready for download.
          </p>

          {/* Document Summary */}
          {summary && (
            <div className="bg-dark-panel border-2 border-dark-border rounded-lg p-6 mb-8 text-left">
              <div className="space-y-4">
                <div className="flex justify-between items-start pb-4 border-b border-dark-border gap-4">
                  <span className="text-gray-400 flex-shrink-0">Original File:</span>
                  <span className="font-semibold text-gray-200 break-words text-right flex-1 min-w-0">{summary.filename}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-dark-border gap-4">
                  <span className="text-gray-400">Fields Completed:</span>
                  <span className="font-semibold text-gray-200">
                    {summary.fieldsCompleted} / {summary.totalFields}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-400">Completion Time:</span>
                  <span className="font-semibold text-gray-200">{summary.completionTime}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-8 py-4 text-lg bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Downloading...
                </>
              ) : (
                <>
                  📥 Download Document
                </>
              )}
            </button>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="px-6 py-4 text-lg bg-dark-panel border-2 border-dark-border text-gray-200 rounded-lg font-medium hover:bg-dark-border transition-colors"
            >
              👁️ Preview Full Document
            </button>
          </div>

          <div className="mb-8">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-transparent text-primary border-2 border-dashed border-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              Fill Another Document
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <CompletedDocumentModal
        documentId={documentId}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
