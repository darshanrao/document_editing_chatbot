import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`${config.api.baseUrl}/documents/${id}/preview-completed`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to load preview' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      content: data.content,
    });
  } catch (error) {
    console.error('Preview completed error:', error);
    return NextResponse.json(
      { error: 'Failed to load document preview' },
      { status: 500 }
    );
  }
}
