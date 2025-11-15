import { NextRequest, NextResponse } from 'next/server';
import { getDocument } from '@/lib/mockDb';
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

  const fieldsCompleted = document.fields.filter(f => f.status === FieldStatus.FILLED).length;
  const totalFields = document.fields.length;

  // Calculate completion time
  const createdAt = new Date(document.createdAt);
  const completedAt = document.completedAt ? new Date(document.completedAt) : new Date();
  const diffMs = completedAt.getTime() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffSeconds = Math.floor((diffMs % 60000) / 1000);
  const completionTime = `${diffMinutes} minutes ${diffSeconds} seconds`;

  return NextResponse.json({
    filename: document.filename,
    fieldsCompleted,
    totalFields,
    completionTime,
  });
}
