'use client';

import { Field, FieldStatus } from '@/types';

interface DocumentPreviewProps {
  content: string;
  fields: Field[];
  onFieldClick?: (fieldId: string) => void;
}

export default function DocumentPreview({ content, fields, onFieldClick }: DocumentPreviewProps) {
  // Backend already handles occurrence-aware replacement with styled spans
  // Just render the HTML content as-is from the backend
  const renderContent = () => {
    return content;
  };

  return (
    <div className="flex flex-col h-full border-2 border-dark-border rounded-lg bg-dark-panel overflow-hidden">
      {/* Preview Header */}
      <div className="bg-dark-lighter px-5 py-4 border-b-2 border-dark-border">
        <h3 className="font-semibold text-gray-200 flex items-center gap-2">
          📄 Live Preview
        </h3>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div
          className="max-w-3xl mx-auto font-legal leading-relaxed text-gray-900"
          dangerouslySetInnerHTML={{ __html: renderContent() }}
        />
      </div>

      {/* Preview Footer */}
      <div className="px-5 py-4 border-t-2 border-gray-300 bg-white text-center">
        <div className="text-xs text-gray-500">
          <span className="inline-block w-3 h-3 bg-pending-light border border-pending rounded mr-1"></span>
          Yellow = Pending
          <span className="ml-4 inline-block w-3 h-3 bg-success-light rounded mr-1"></span>
          Green = Filled
        </div>
      </div>
    </div>
  );
}
