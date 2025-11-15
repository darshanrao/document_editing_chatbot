'use client';

import { Field, FieldStatus } from '@/types';

interface FieldListViewProps {
  fields: Field[];
  onFieldEdit?: (fieldId: string) => void;
  onFieldFill?: (fieldId: string) => void;
}

export default function FieldListView({ fields, onFieldEdit, onFieldFill }: FieldListViewProps) {
  const completedFields = fields.filter(f => f.status === FieldStatus.FILLED);
  const pendingFields = fields.filter(f => f.status === FieldStatus.PENDING);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Completed Fields */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-200">
          Completed Fields ({completedFields.length})
        </h3>
        <div className="space-y-3">
          {completedFields.length === 0 ? (
            <div className="text-gray-500 text-sm p-4 border-2 border-dashed border-dark-border rounded-lg text-center">
              No fields completed yet
            </div>
          ) : (
            completedFields.map((field) => (
              <div
                key={field.id}
                className="p-4 border border-success/30 bg-success-light/5 rounded-lg flex justify-between items-center"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-200">{field.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{field.value}</div>
                </div>
                <button
                  onClick={() => onFieldEdit?.(field.id)}
                  className="px-3 py-1.5 text-sm bg-dark-panel border border-dark-border text-gray-200 rounded hover:bg-dark-border transition-colors"
                >
                  Edit
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Fields */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-200">
          Pending Fields ({pendingFields.length})
        </h3>
        <div className="space-y-3">
          {pendingFields.length === 0 ? (
            <div className="text-success text-sm p-4 border-2 border-success rounded-lg text-center bg-success-light/10">
              All fields completed! 🎉
            </div>
          ) : (
            pendingFields.map((field) => (
              <div
                key={field.id}
                className="p-4 border border-dark-border bg-dark-panel rounded-lg flex justify-between items-center"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-200">{field.name}</div>
                  <div className="text-sm text-gray-500 mt-1">Not filled yet</div>
                </div>
                <button
                  onClick={() => onFieldFill?.(field.id)}
                  className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                >
                  Fill Now
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
