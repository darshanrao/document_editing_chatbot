// Document Types
export interface Document {
  id: string;
  filename: string;
  status: DocumentStatus;
  fields: Field[];
  createdAt: string;
  completedAt?: string;
  originalContent?: string;
}

export enum DocumentStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  FILLING = 'filling',
  COMPLETED = 'completed',
  ERROR = 'error',
}

// Field Types
export interface Field {
  id: string;
  documentId: string;
  name: string;
  placeholder: string;
  value: string | null;
  status: FieldStatus;
  order: number;
  type?: FieldType;
  occurrenceIndex?: number;
}

export enum FieldStatus {
  PENDING = 'pending',
  FILLED = 'filled',
}

export enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  DATE = 'date',
  NUMBER = 'number',
  PHONE = 'phone',
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  content: string;
  timestamp: string;
  fieldId?: string;
}

// API Response Types
export interface UploadResponse {
  documentId: string;
  status: DocumentStatus;
}

export interface ProcessingStatus {
  status: DocumentStatus;
  progress?: number;
  message?: string;
}

export interface DocumentPreview {
  content: string;
  fields: Field[];
  completionPercentage: number;
}

export interface NextQuestionResponse {
  question: string;
  fieldId: string;
  fieldName: string;
}
