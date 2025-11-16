import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`${config.api.baseUrl}/chat/${id}/next`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If no pending fields, return completion message
      if (response.status === 404) {
        const error = await response.json();
        if (error.detail === 'No pending fields found') {
          return NextResponse.json({
            question: 'All fields have been completed!',
            fieldId: null,
            fieldName: null,
          });
        }
      }

      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to get next question' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      question: data.question,
      fieldId: data.fieldId,
      fieldName: data.fieldName || null,
    });
  } catch (error) {
    console.error('Chat next error:', error);
    return NextResponse.json(
      { error: 'Failed to get next question' },
      { status: 500 }
    );
  }
}
