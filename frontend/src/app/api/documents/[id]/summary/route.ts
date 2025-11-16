import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`${config.api.baseUrl}/documents/${id}/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Document not found' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      filename: data.filename,
      fieldsCompleted: data.fieldsCompleted,
      totalFields: data.totalFields,
      completionTime: data.completionTime,
    });
  } catch (error) {
    console.error('Summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
