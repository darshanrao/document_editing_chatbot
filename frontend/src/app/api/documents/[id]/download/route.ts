import { NextRequest, NextResponse } from 'next/server';
import { getDocument, getDocumentContent } from '@/lib/mockDb';

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

  // In a real implementation, you would generate a .docx file here
  // For now, we'll return a text file
  const blob = new Blob([content], { type: 'text/plain' });

  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${document.filename}"`,
    },
  });
}
