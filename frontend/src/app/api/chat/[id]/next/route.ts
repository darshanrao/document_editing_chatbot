import { NextRequest, NextResponse } from 'next/server';
import { getDocument, getNextPendingField } from '@/lib/mockDb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const document = getDocument(id);

  if (!document) {
    return NextResponse.json(
      { error: 'Document not found' },
      { status: 404 }
    );
  }

  const nextField = getNextPendingField(id);

  if (!nextField) {
    return NextResponse.json({
      question: 'All fields have been completed!',
      fieldId: null,
      fieldName: null,
    });
  }

  const totalFields = document.fields.length;
  const greeting = document.fields.every(f => f.status === 'pending')
    ? `Hi! I've analyzed your document and found ${totalFields} placeholders to fill. Let's start with the basics. `
    : '';

  return NextResponse.json({
    question: `${greeting}What is the ${nextField.name}?`,
    fieldId: nextField.id,
    fieldName: nextField.name,
  });
}
