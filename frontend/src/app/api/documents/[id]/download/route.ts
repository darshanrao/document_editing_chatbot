import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`${config.api.baseUrl}/documents/${id}/download`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Document not found' },
        { status: response.status }
      );
    }

    // Get the blob from backend
    const blob = await response.blob();

    // Get filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'document.docx';
    if (contentDisposition) {
      const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}
