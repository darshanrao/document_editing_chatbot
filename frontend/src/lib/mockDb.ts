import { Document, Field, FieldStatus, DocumentStatus } from '@/types';

// In-memory mock database
export const mockDocuments: Map<string, Document> = new Map();

// Sample document template
const sampleDocumentContent = `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on [START_DATE] by and between [COMPANY_NAME] ("Employer") and [EMPLOYEE_NAME] ("Employee").

1. Position and Duties

The Employee is hired for the position of [JOB_TITLE] and will report to [SUPERVISOR]. The Employee agrees to perform all duties and responsibilities associated with this position.

2. Compensation

The Employee will receive an annual salary of $[SALARY], payable in accordance with the Employer's standard payroll schedule. The Employee's salary will be reviewed annually and may be adjusted at the Employer's discretion.

3. Contact Information

Employee Email: [EMPLOYEE_EMAIL]
Employee Phone: [EMPLOYEE_PHONE]

4. Start Date and Location

The Employee's first day of work will be [START_DATE], and they will be based in [WORK_LOCATION].

5. Benefits

The Employee will be eligible for benefits including [BENEFITS].

6. Term and Termination

This Agreement will commence on [START_DATE] and will continue until terminated by either party with [NOTICE_PERIOD] notice.`;

const sampleFields: Field[] = [
  { id: '1', documentId: '', name: 'Start Date', placeholder: '[START_DATE]', value: null, status: FieldStatus.PENDING, order: 1, type: undefined },
  { id: '2', documentId: '', name: 'Company Name', placeholder: '[COMPANY_NAME]', value: null, status: FieldStatus.PENDING, order: 2, type: undefined },
  { id: '3', documentId: '', name: 'Employee Name', placeholder: '[EMPLOYEE_NAME]', value: null, status: FieldStatus.PENDING, order: 3, type: undefined },
  { id: '4', documentId: '', name: 'Job Title', placeholder: '[JOB_TITLE]', value: null, status: FieldStatus.PENDING, order: 4, type: undefined },
  { id: '5', documentId: '', name: 'Supervisor', placeholder: '[SUPERVISOR]', value: null, status: FieldStatus.PENDING, order: 5, type: undefined },
  { id: '6', documentId: '', name: 'Annual Salary', placeholder: '[SALARY]', value: null, status: FieldStatus.PENDING, order: 6, type: undefined },
  { id: '7', documentId: '', name: 'Employee Email', placeholder: '[EMPLOYEE_EMAIL]', value: null, status: FieldStatus.PENDING, order: 7, type: undefined },
  { id: '8', documentId: '', name: 'Employee Phone', placeholder: '[EMPLOYEE_PHONE]', value: null, status: FieldStatus.PENDING, order: 8, type: undefined },
  { id: '9', documentId: '', name: 'Work Location', placeholder: '[WORK_LOCATION]', value: null, status: FieldStatus.PENDING, order: 9, type: undefined },
  { id: '10', documentId: '', name: 'Benefits', placeholder: '[BENEFITS]', value: null, status: FieldStatus.PENDING, order: 10, type: undefined },
  { id: '11', documentId: '', name: 'Notice Period', placeholder: '[NOTICE_PERIOD]', value: null, status: FieldStatus.PENDING, order: 11, type: undefined },
];

export function createMockDocument(filename: string): Document {
  const documentId = Math.random().toString(36).substring(7);
  const fields = sampleFields.map(f => ({ ...f, documentId }));

  const document: Document = {
    id: documentId,
    filename,
    status: DocumentStatus.PROCESSING,
    fields,
    createdAt: new Date().toISOString(),
    originalContent: sampleDocumentContent,
  };

  mockDocuments.set(documentId, document);

  // Simulate processing - after 3 seconds, mark as READY
  setTimeout(() => {
    const doc = mockDocuments.get(documentId);
    if (doc) {
      doc.status = DocumentStatus.READY;
      mockDocuments.set(documentId, doc);
    }
  }, 3000);

  return document;
}

export function getDocument(id: string): Document | undefined {
  return mockDocuments.get(id);
}

export function updateFieldValue(documentId: string, fieldId: string, value: string): boolean {
  const document = mockDocuments.get(documentId);
  if (!document) return false;

  const fieldIndex = document.fields.findIndex(f => f.id === fieldId);
  if (fieldIndex === -1) return false;

  document.fields[fieldIndex].value = value;
  document.fields[fieldIndex].status = FieldStatus.FILLED;

  // Check if all fields are filled
  const allFilled = document.fields.every(f => f.status === FieldStatus.FILLED);
  if (allFilled) {
    document.status = DocumentStatus.COMPLETED;
    document.completedAt = new Date().toISOString();
  } else {
    document.status = DocumentStatus.FILLING;
  }

  mockDocuments.set(documentId, document);
  return true;
}

export function getNextPendingField(documentId: string): Field | null {
  const document = mockDocuments.get(documentId);
  if (!document) return null;

  return document.fields.find(f => f.status === FieldStatus.PENDING) || null;
}

export function getDocumentContent(documentId: string): string {
  const document = mockDocuments.get(documentId);
  if (!document) return '';

  let content = document.originalContent || '';

  // Replace filled fields with their values
  document.fields.forEach(field => {
    if (field.value) {
      content = content.replace(new RegExp(field.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), field.value);
    }
  });

  return content;
}
