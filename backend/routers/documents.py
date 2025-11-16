from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from models import (
    UploadResponse,
    StatusResponse,
    FieldsResponse,
    PreviewResponse,
    FieldSubmitRequest,
    FieldSubmitResponse,
    SummaryResponse,
    EmailRequest,
    EmailResponse,
    DocumentStatus,
)
from utils.database import db
from services.document_service import document_service
from services.gemini_service import gemini_service
from config import settings
import io
from datetime import datetime

router = APIRouter(prefix="/api", tags=["documents"])


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload a document and start processing"""
    # Validate file
    if not file.filename.endswith('.docx'):
        raise HTTPException(status_code=400, detail="Only .docx files are supported")

    # Read file data
    file_data = await file.read()

    # Check file size
    if len(file_data) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit"
        )

    try:
        # Extract text first to validate it's a valid docx
        text_content = document_service.extract_text_from_docx(file_data)

        # Create document record
        document = db.create_document(
            filename=file.filename,
            file_path="",  # Will be updated after upload
            original_content=text_content
        )

        document_id = document["id"]

        # Upload to storage
        file_path = await document_service.upload_original_document(document_id, file_data)
        print(f"✓ Uploaded document to storage: {file_path}")

        # Update document with file path in database
        db.client.table("documents").update({"file_path": file_path}).eq("id", document_id).execute()
        print(f"✓ Updated document record with file_path")

        # Process document in the background
        background_tasks.add_task(document_service.process_document, document_id, file_data)

        return UploadResponse(
            document_id=document_id,
            filename=file.filename,
            status=DocumentStatus.PROCESSING
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")


@router.get("/documents/{document_id}/status", response_model=StatusResponse)
async def get_document_status(document_id: str):
    """Get the processing status of a document"""
    document = db.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    fields = db.get_fields(document_id)
    total_fields = len(fields)
    completed_fields = sum(1 for f in fields if f["status"] == "filled")

    progress = 0
    if total_fields > 0:
        progress = int((completed_fields / total_fields) * 100)

    status_messages = {
        "uploading": "Uploading document...",
        "processing": "Extracting text and identifying placeholders...",
        "ready": "Document is ready for filling",
        "filling": f"Filling in progress ({completed_fields}/{total_fields} fields completed)",
        "completed": "All fields completed!",
        "error": "An error occurred during processing"
    }

    return StatusResponse(
        status=document["status"],
        progress=progress,
        message=status_messages.get(document["status"], "Processing...")
    )


@router.get("/documents/{document_id}/fields", response_model=FieldsResponse)
async def get_document_fields(document_id: str):
    """Get all fields for a document"""
    document = db.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    fields = db.get_fields(document_id)

    return FieldsResponse(
        fields=fields,
        filename=document["filename"]
    )


@router.get("/documents/{document_id}/preview", response_model=PreviewResponse)
async def get_document_preview(document_id: str):
    """Get document preview with current field values"""
    document = db.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    content = document_service.get_document_preview(document_id)
    fields = db.get_fields(document_id)

    return PreviewResponse(
        content=content,
        fields=fields
    )


@router.post("/documents/{document_id}/fields", response_model=FieldSubmitResponse)
async def submit_field_value(document_id: str, request: FieldSubmitRequest):
    """Submit a value for a field with intelligent extraction and validation"""
    from services.conversation_service import conversation_service
    from langchain.schema import HumanMessage, AIMessage

    document = db.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get the field
    field = db.get_field(request.fieldId)

    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    # Load conversation memory
    memory = conversation_service.load_memory_from_db(db, document_id)

    # Add user's response to memory
    user_msg = HumanMessage(content=request.value)
    memory.chat_memory.add_message(user_msg)
    # Save immediately
    conversation_service.save_single_message_to_db(db, document_id, user_msg, "human")

    # Extract and validate value from natural language response
    is_valid, extracted_value, error_message = conversation_service.extract_and_validate_value(
        user_response=request.value,
        field_name=field["name"],
        field_type=field["type"],
        placeholder=field["placeholder"],
        memory=memory
    )

    if not is_valid:
        # Generate friendly clarification question
        clarification = conversation_service.generate_clarification_question(
            field_name=field["name"],
            field_type=field["type"],
            error_message=error_message,
            user_response=request.value,
            memory=memory
        )

        # Add clarification to memory
        clarification_msg = AIMessage(content=clarification)
        memory.chat_memory.add_message(clarification_msg)
        # Save immediately with field_id
        conversation_service.save_single_message_to_db(db, document_id, clarification_msg, "ai", field["id"])

        # Update validation attempts
        validation_attempts = field.get("validation_attempts", 0) + 1
        db.client.table("fields").update({
            "validation_attempts": validation_attempts
        }).eq("id", request.fieldId).execute()

        # Return clarification as next question (same field)
        return FieldSubmitResponse(
            success=False,
            nextQuestion=clarification,
            nextFieldId=request.fieldId
        )

    # Value is valid - update the field
    db.update_field_value(request.fieldId, extracted_value)

    # Reset validation attempts
    db.client.table("fields").update({
        "validation_attempts": 0
    }).eq("id", request.fieldId).execute()

    # Update document status to filling if it was ready
    if document["status"] == "ready":
        db.update_document_status(document_id, "filling")

    # Get next pending field
    next_field = db.get_next_pending_field(document_id)

    if next_field:
        # Generate question for next field
        document_content = document.get("original_content", "")
        context = document_service.get_context_for_field(
            document_content,
            next_field["placeholder"]
        )

        validation_attempts = next_field.get("validation_attempts", 0) + 1

        next_question = conversation_service.generate_field_question(
            field_name=next_field["name"],
            field_type=next_field["type"],
            placeholder=next_field["placeholder"],
            context=context,
            memory=memory,
            attempt=validation_attempts
        )

        # Add to memory
        next_question_msg = AIMessage(content=next_question)
        memory.chat_memory.add_message(next_question_msg)
        # Save immediately with field_id
        conversation_service.save_single_message_to_db(db, document_id, next_question_msg, "ai", next_field["id"])

        return FieldSubmitResponse(
            success=True,
            nextQuestion=next_question,
            nextFieldId=next_field["id"]
        )
    else:
        # All fields completed - update status and save completed document
        db.update_document_status(document_id, "completed")
        
        # Generate and save completed document to storage
        try:
            original_file_data = db.download_file(
                document_service.bucket_original,
                f"{document_id}/original.docx"
            )
            completed_doc = document_service.generate_completed_document(
                document_id,
                original_file_data
            )
            await document_service.upload_completed_document(document_id, completed_doc)
            print(f"✓ Saved completed document for {document_id}")
        except Exception as e:
            print(f"⚠ Warning: Failed to save completed document: {e}")
            # Don't fail the request, just log the warning

        return FieldSubmitResponse(
            success=True,
            nextQuestion=None,
            nextFieldId=None
        )


@router.get("/documents/{document_id}/summary", response_model=SummaryResponse)
async def get_document_summary(document_id: str):
    """Get completion summary for a document"""
    try:
        summary = document_service.get_completion_summary(document_id)
        return SummaryResponse(**summary)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/documents/{document_id}/download")
async def download_document(document_id: str):
    """Download the completed document"""
    document = db.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        completed_file_path = f"{document_id}/completed.docx"
        
        # Try to get completed document from storage first
        try:
            completed_doc = db.download_file(
                document_service.bucket_completed,
                completed_file_path
            )
            print(f"✓ Serving completed document from storage for {document_id}")
        except Exception:
            # Completed document not found in storage, generate it on-demand
            print(f"⚠ Completed document not in storage for {document_id}, generating on-demand...")
            original_file_data = db.download_file(
                document_service.bucket_original,
                f"{document_id}/original.docx"
            )
            completed_doc = document_service.generate_completed_document(
                document_id,
                original_file_data
            )
            # Try to save it for future use (non-blocking)
            try:
                await document_service.upload_completed_document(document_id, completed_doc)
                print(f"✓ Saved completed document for future use: {document_id}")
            except Exception as e:
                print(f"⚠ Warning: Failed to save completed document: {e}")

        # Return as downloadable file
        return StreamingResponse(
            io.BytesIO(completed_doc),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename={document['filename']}"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate document: {str(e)}")


@router.post("/documents/{document_id}/email", response_model=EmailResponse)
async def email_document(document_id: str, request: EmailRequest):
    """Email the completed document (placeholder - not implemented)"""
    document = db.get_document(document_id)

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # TODO: Implement email functionality
    # This would integrate with an email service like SendGrid, AWS SES, etc.
    print(f"Would send document {document_id} to {request.email}")

    return EmailResponse(
        success=True,
        message="Document sent successfully (placeholder - not actually sent)"
    )
