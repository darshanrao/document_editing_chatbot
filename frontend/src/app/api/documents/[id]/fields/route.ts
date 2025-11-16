import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`${config.api.baseUrl}/documents/${id}/fields`, {
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
      fields: data.fields,
      filename: data.filename,
    });
  } catch (error) {
    console.error('Fields error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fields' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fieldId, value } = body;

    if (!fieldId || !value) {
      return NextResponse.json(
        { error: 'Field ID and value are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${config.api.baseUrl}/documents/${id}/fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fieldId, value }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to update field' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: data.success,
      nextQuestion: data.nextQuestion,
      nextFieldId: data.nextFieldId,
    });
  } catch (error) {
    console.error('Error updating field:', error);
    return NextResponse.json(
      { error: 'Failed to update field' },
      { status: 500 }
    );
  }
}
