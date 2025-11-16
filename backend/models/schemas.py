from pydantic import BaseModel
from pydantic import Field as PydanticField
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DocumentStatus(str, Enum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    READY = "ready"
    FILLING = "filling"
    COMPLETED = "completed"
    ERROR = "error"


class FieldStatus(str, Enum):
    PENDING = "pending"
    FILLED = "filled"


class FieldType(str, Enum):
    TEXT = "text"
    DATE = "date"
    NUMBER = "number"
    EMAIL = "email"
    PHONE = "phone"
    ADDRESS = "address"


# Field Schemas
class FieldBase(BaseModel):
    name: str
    placeholder: str
    type: Optional[FieldType] = FieldType.TEXT
    order: int


class FieldCreate(FieldBase):
    document_id: str


class FieldUpdate(BaseModel):
    value: str
    status: FieldStatus = FieldStatus.FILLED


class Field(FieldBase):
    id: str
    document_id: str
    value: Optional[str] = None
    status: FieldStatus = FieldStatus.PENDING
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Document Schemas
class DocumentBase(BaseModel):
    filename: str


class DocumentCreate(DocumentBase):
    pass


class Document(DocumentBase):
    id: str
    status: DocumentStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    file_path: Optional[str] = None
    original_content: Optional[str] = None

    class Config:
        from_attributes = True


class DocumentWithFields(Document):
    fields: List[Field] = []


# Chat Message Schemas
class ChatMessageRole(str, Enum):
    USER = "user"
    BOT = "bot"


class ChatMessageBase(BaseModel):
    role: ChatMessageRole
    content: str
    field_id: Optional[str] = None


class ChatMessageCreate(ChatMessageBase):
    document_id: str


class ChatMessage(ChatMessageBase):
    id: str
    document_id: str
    timestamp: datetime

    class Config:
        from_attributes = True


# API Request/Response Schemas
class UploadResponse(BaseModel):
    document_id: str
    filename: str
    status: DocumentStatus


class StatusResponse(BaseModel):
    status: DocumentStatus
    progress: Optional[int] = None
    message: Optional[str] = None


class FieldsResponse(BaseModel):
    fields: List[Field]
    filename: str


class PreviewResponse(BaseModel):
    content: str
    fields: List[Field]


class FieldSubmitRequest(BaseModel):
    fieldId: str = PydanticField(..., alias="fieldId")
    value: str


class FieldSubmitResponse(BaseModel):
    success: bool
    nextQuestion: Optional[str] = None
    nextFieldId: Optional[str] = None


class NextQuestionResponse(BaseModel):
    question: str
    fieldId: str


class SummaryResponse(BaseModel):
    filename: str
    fieldsCompleted: int
    totalFields: int
    completionTime: str


class EmailRequest(BaseModel):
    email: str


class EmailResponse(BaseModel):
    success: bool
    message: str


# Processing Task Schema
class ProcessingTaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ProcessingTask(BaseModel):
    id: str
    document_id: str
    task_type: str
    status: ProcessingTaskStatus
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
