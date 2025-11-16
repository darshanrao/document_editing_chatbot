from fastapi import APIRouter, HTTPException
from models import NextQuestionResponse
from utils.database import db
from services.document_service import document_service
from services.conversation_service import conversation_service

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/{document_id}/next", response_model=NextQuestionResponse)
async def get_next_question(document_id: str):
    """Get the next question for the user to answer with conversational memory"""
    document = db.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get the first pending field
    next_field = db.get_next_pending_field(document_id)

    if not next_field:
        raise HTTPException(status_code=404, detail="No pending fields found")

    # Load conversation memory from database
    memory = conversation_service.load_memory_from_db(db, document_id)

    # Get context for better question generation
    document_content = document.get("original_content", "")
    context = document_service.get_context_for_field(
        document_content,
        next_field["placeholder"]
    )

    # Get validation attempts for retry logic
    validation_attempts = next_field.get("validation_attempts", 0) + 1

    # Generate conversational question using conversation service with memory
    question = conversation_service.generate_field_question(
        field_name=next_field["name"],
        field_type=next_field["type"],
        placeholder=next_field["placeholder"],
        context=context,
        memory=memory,
        attempt=validation_attempts
    )

    # Add AI message to memory
    from langchain.schema import AIMessage
    ai_msg = AIMessage(content=question)
    memory.chat_memory.add_message(ai_msg)
    # Save immediately with field_id
    conversation_service.save_single_message_to_db(db, document_id, ai_msg, "ai", next_field["id"])

    return NextQuestionResponse(
        question=question,
        fieldId=next_field["id"]
    )


@router.get("/{document_id}/history")
async def get_chat_history(document_id: str):
    """Get all chat messages for a document"""
    document = db.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    messages = db.get_chat_messages(document_id)

    return {
        "messages": messages
    }
