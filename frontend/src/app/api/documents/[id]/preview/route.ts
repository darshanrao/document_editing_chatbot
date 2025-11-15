import { NextRequest, NextResponse } from 'next/server';
import { getDocument, getDocumentContent } from '@/lib/mockDb';
import { FieldStatus } from '@/types';

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

  const content = getDocumentContent(id);
  const completedFields = document.fields.filter(f => f.status === FieldStatus.FILLED).length;
  const totalFields = document.fields.length;
  const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  return NextResponse.json({
    content,
    fields: document.fields,
    completionPercentage,
  });
}
