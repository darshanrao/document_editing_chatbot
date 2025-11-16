"""
Email service for sending documents via Resend
Based on Resend documentation: https://resend.com/docs/send-with-fastapi
"""
from typing import Optional
import resend
from config import settings
import logging
import base64

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails with document attachments"""
    
    def __init__(self):
        # Read FROM_EMAIL from .env (via config)
        self.from_email = settings.FROM_EMAIL
        
        # Initialize Resend API key (module-level, not instance-level)
        if settings.RESEND_API_KEY and settings.RESEND_API_KEY.strip():
            try:
                resend.api_key = settings.RESEND_API_KEY
                logger.info("Email service initialized with Resend")
            except Exception as e:
                logger.error(f"Failed to initialize Resend: {e}")
                resend.api_key = None
        else:
            logger.warning("RESEND_API_KEY not set - email functionality disabled")
            resend.api_key = None
    
    def is_configured(self) -> bool:
        """Check if email service is properly configured"""
        return resend.api_key is not None and resend.api_key.strip() != ""
    
    async def send_document_email(
        self,
        to_email: str,
        document_filename: str,
        document_bytes: bytes,
        subject: Optional[str] = None,
        message: Optional[str] = None
    ) -> bool:
        """
        Send completed document via email with attachment
        
        Args:
            to_email: Recipient email address
            document_filename: Name of the document file
            document_bytes: Document file content as bytes
            subject: Optional custom subject line
            message: Optional custom message body
            
        Returns:
            True if email sent successfully
            
        Raises:
            Exception: If email service not configured or sending fails
        """
        if not self.is_configured():
            raise Exception(
                "Email service not configured. Please set RESEND_API_KEY in .env file or environment variables. "
                "Sign up at https://resend.com to get an API key."
            )
        
        # Validate FROM_EMAIL is set
        if not self.from_email or not self.from_email.strip():
            raise Exception(
                "FROM_EMAIL not configured. Please set FROM_EMAIL in .env file. "
                "For testing, use: onboarding@resend.dev"
            )
        
        try:
            # Default subject if not provided
            email_subject = subject or f"Your completed document: {document_filename}"
            
            # Default message if not provided
            email_body = message or f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #a78bfa;">Your Document is Ready! 📄</h2>
                        <p>Hello,</p>
                        <p>Please find your completed document attached.</p>
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Document:</strong> {document_filename}</p>
                        </div>
                        <p>Thank you for using LegalDoc Filler!</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="color: #777; font-size: 12px;">
                            This is an automated email. Please do not reply to this message.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            # Encode document bytes to base64 for Resend
            encoded_content = base64.b64encode(document_bytes).decode('utf-8')
            
            # Prepare email with attachment (Resend API format)
            params: resend.Emails.SendParams = {
                "from": self.from_email,
                "to": [to_email],
                "subject": email_subject,
                "html": email_body,
                "attachments": [
                    {
                        "filename": document_filename,
                        "content": encoded_content,
                    }
                ]
            }
            
            # Send email using Resend API (module-level, not instance)
            # According to Resend docs: https://resend.com/docs/send-with-fastapi
            email: resend.Email = resend.Emails.send(params)
            
            if not email:
                raise Exception("Email sending failed - no response from Resend")
            
            email_id = email.get('id', 'unknown') if isinstance(email, dict) else 'unknown'
            logger.info(f"Email sent successfully to {to_email} for document {document_filename} - ID: {email_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {e}")
            raise Exception(f"Failed to send email: {str(e)}")


# Singleton instance
email_service = EmailService()

