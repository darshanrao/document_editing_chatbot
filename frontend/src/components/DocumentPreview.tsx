'use client';

import { Field, FieldStatus } from '@/types';

interface DocumentPreviewProps {
  content: string;
  fields: Field[];
  onFieldClick?: (fieldId: string) => void;
}

export default function DocumentPreview({ content, fields, onFieldClick }: DocumentPreviewProps) {
  // Function to render content with highlighted placeholders
  const renderContent = () => {
    let renderedContent = content;

    // Replace placeholders with styled spans
    fields.forEach((field) => {
      const placeholder = field.placeholder;
      const value = field.value || placeholder;
      const className = field.status === FieldStatus.FILLED
        ? 'bg-success-light text-success-dark px-1.5 py-0.5 rounded font-medium cursor-pointer hover:bg-success/30'
        : 'bg-pending-light text-pending-dark px-1.5 py-0.5 rounded font-medium border border-pending cursor-pointer hover:bg-pending/30';

      const onClick = onFieldClick ? `onclick="handleFieldClick('${field.id}')"` : '';

      renderedContent = renderedContent.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        `<span class="${className}" ${onClick}>${value}</span>`
      );
    });

    return renderedContent;
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
          className="max-w-3xl mx-auto font-serif leading-relaxed text-gray-900"
          dangerouslySetInnerHTML={{ __html: renderContent() }}
        />
      </div>

      {/* Preview Footer */}
      <div className="px-5 py-4 border-t-2 border-gray-300 bg-white text-center">
        <button className="px-4 py-2 text-sm text-primary border-2 border-dashed border-primary rounded-lg hover:bg-primary/10 transition-colors">
          Toggle Full Preview
        </button>
        <div className="mt-3 text-xs text-gray-500">
          <span className="inline-block w-3 h-3 bg-pending-light border border-pending rounded mr-1"></span>
          Yellow = Pending
          <span className="ml-4 inline-block w-3 h-3 bg-success-light rounded mr-1"></span>
          Green = Filled
        </div>
      </div>
    </div>
  );
}
