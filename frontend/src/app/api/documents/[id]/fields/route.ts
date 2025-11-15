import { NextRequest, NextResponse } from 'next/server';
import { getDocument, updateFieldValue, getNextPendingField } from '@/lib/mockDb';

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
    fields: document.fields,
    filename: document.filename,
  });
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

    const success = updateFieldValue(id, fieldId, value);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update field' },
        { status: 500 }
      );
    }

    // Get next pending field
    const nextField = getNextPendingField(id);

    if (nextField) {
      return NextResponse.json({
        success: true,
        nextQuestion: `Great! Now, what is the ${nextField.name}?`,
        nextFieldId: nextField.id,
      });
    } else {
      return NextResponse.json({
        success: true,
        nextQuestion: null,
        nextFieldId: null,
      });
    }
  } catch (error) {
    console.error('Error updating field:', error);
    return NextResponse.json(
      { error: 'Failed to update field' },
      { status: 500 }
    );
  }
}
