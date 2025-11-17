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
  const [email, setEmail] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
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

  const handleSendEmail = async () => {
    if (!email) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('Document sent successfully!');
        setEmail('');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-6">
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
          <div className="w-24 h-24 bg-success-light rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-5xl">✓</span>
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
                <div className="flex justify-between items-center pb-4 border-b border-dark-border">
                  <span className="text-gray-400">Original File:</span>
                  <span className="font-semibold text-gray-200">{summary.filename}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-dark-border">
                  <span className="text-gray-400">Fields Completed:</span>
                  <span className="font-semibold text-gray-200">
                    {summary.fieldsCompleted} / {summary.totalFields}
                  </span>
                </div>
                <div className="flex justify-between items-center">
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

          {/* Email Option */}
          <div className="bg-dark-lighter border-l-4 border-primary rounded p-6 text-left">
            <p className="text-sm mb-4">
              <strong className="text-primary">📧 Email Option:</strong>
              <br />
              <span className="text-gray-400">
                Would you like to email this completed document to someone?
              </span>
            </p>
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recipient@email.com"
                className="w-full px-4 py-2 border-2 border-dark-border rounded-lg bg-dark-panel text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSendEmail}
                disabled={!email || isSending}
                className="w-full px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : 'Send Document'}
              </button>
            </div>
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
