import { NextRequest, NextResponse } from 'next/server';
import { getDocument } from '@/lib/mockDb';

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

  return NextResponse.json({
    status: document.status,
    progress: 100,
    message: 'Document ready',
  });
}
