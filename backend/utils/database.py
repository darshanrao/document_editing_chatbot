from supabase import create_client, Client
from config import settings
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime


class Database:
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )

    # Document operations
    def create_document(self, filename: str, file_path: str, original_content: str) -> Dict[str, Any]:
        """Create a new document record"""
        document_id = str(uuid.uuid4())
        data = {
            "id": document_id,
            "filename": filename,
            "status": "processing",
            "file_path": file_path,
            "original_content": original_content,
            "created_at": datetime.utcnow().isoformat(),
        }
        result = self.client.table("documents").insert(data).execute()
        return result.data[0] if result.data else None

    def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID"""
        result = self.client.table("documents").select("*").eq("id", document_id).execute()
        return result.data[0] if result.data else None

    def update_document_status(self, document_id: str, status: str) -> Dict[str, Any]:
        """Update document status"""
        data = {
            "status": status,
            "updated_at": datetime.utcnow().isoformat(),
        }
        if status == "completed":
            data["completed_at"] = datetime.utcnow().isoformat()

        result = self.client.table("documents").update(data).eq("id", document_id).execute()
        return result.data[0] if result.data else None

    def update_document_content(self, document_id: str, content: str) -> Dict[str, Any]:
        """Update document content"""
        data = {
            "original_content": content,
            "updated_at": datetime.utcnow().isoformat(),
        }
        result = self.client.table("documents").update(data).eq("id", document_id).execute()
        return result.data[0] if result.data else None

    # Field operations
    def create_field(self, document_id: str, name: str, placeholder: str,
                    field_type: str, order: int) -> Dict[str, Any]:
        """Create a new field"""
        field_id = str(uuid.uuid4())
        data = {
            "id": field_id,
            "document_id": document_id,
            "name": name,
            "placeholder": placeholder,
            "type": field_type,
            "order": order,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
        }
        result = self.client.table("fields").insert(data).execute()
        return result.data[0] if result.data else None

    def get_fields(self, document_id: str) -> List[Dict[str, Any]]:
        """Get all fields for a document"""
        result = self.client.table("fields").select("*").eq("document_id", document_id).order("order").execute()
        return result.data if result.data else []

    def get_field(self, field_id: str) -> Optional[Dict[str, Any]]:
        """Get field by ID"""
        result = self.client.table("fields").select("*").eq("id", field_id).execute()
        return result.data[0] if result.data else None

    def update_field_value(self, field_id: str, value: str) -> Dict[str, Any]:
        """Update field value"""
        data = {
            "value": value,
            "status": "filled",
            "updated_at": datetime.utcnow().isoformat(),
        }
        result = self.client.table("fields").update(data).eq("id", field_id).execute()
        return result.data[0] if result.data else None

    def get_next_pending_field(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get the next pending field"""
        result = self.client.table("fields").select("*").eq("document_id", document_id).eq("status", "pending").order("order").limit(1).execute()
        return result.data[0] if result.data else None

    # Chat message operations
    def create_chat_message(self, document_id: str, role: str, content: str,
                           field_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a new chat message"""
        message_id = str(uuid.uuid4())
        data = {
            "id": message_id,
            "document_id": document_id,
            "role": role,
            "content": content,
            "field_id": field_id,
            "timestamp": datetime.utcnow().isoformat(),
        }
        result = self.client.table("chat_messages").insert(data).execute()
        return result.data[0] if result.data else None

    def get_chat_messages(self, document_id: str) -> List[Dict[str, Any]]:
        """Get all chat messages for a document"""
        result = self.client.table("chat_messages").select("*").eq("document_id", document_id).order("timestamp").execute()
        return result.data if result.data else []

    # Processing task operations
    def create_processing_task(self, document_id: str, task_type: str) -> Dict[str, Any]:
        """Create a new processing task"""
        task_id = str(uuid.uuid4())
        data = {
            "id": task_id,
            "document_id": document_id,
            "task_type": task_type,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
        }
        result = self.client.table("processing_tasks").insert(data).execute()
        return result.data[0] if result.data else None

    def update_processing_task(self, task_id: str, status: str,
                              error_message: Optional[str] = None) -> Dict[str, Any]:
        """Update processing task status"""
        data = {
            "status": status,
            "updated_at": datetime.utcnow().isoformat(),
        }
        if status == "completed" or status == "failed":
            data["completed_at"] = datetime.utcnow().isoformat()
        if error_message:
            data["error_message"] = error_message

        result = self.client.table("processing_tasks").update(data).eq("id", task_id).execute()
        return result.data[0] if result.data else None

    # Storage operations
    def upload_file(self, bucket: str, file_path: str, file_data: bytes) -> str:
        """Upload file to Supabase Storage"""
        result = self.client.storage.from_(bucket).upload(file_path, file_data)
        return file_path

    def download_file(self, bucket: str, file_path: str) -> bytes:
        """Download file from Supabase Storage"""
        result = self.client.storage.from_(bucket).download(file_path)
        return result

    def get_public_url(self, bucket: str, file_path: str) -> str:
        """Get public URL for a file"""
        result = self.client.storage.from_(bucket).get_public_url(file_path)
        return result


# Singleton instance
db = Database()
