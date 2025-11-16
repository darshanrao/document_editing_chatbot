# Email Setup Guide

This guide explains how to set up email functionality using Resend.

## Overview

The email service allows users to send completed documents via email. It uses Resend, a modern email API service.

## Setup Steps

### 1. Sign Up for Resend

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Give it a name (e.g., "LegalDoc Filler Production")
4. Copy the API key (starts with `re_`)

### 3. Verify Your Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Add your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

**Note:** For development/testing, you can use Resend's default sender email without domain verification.

### 4. Set Environment Variables

Add these to your `.env` file or Railway environment variables:

```bash
# Required for email functionality
RESEND_API_KEY=re_your_api_key_here

# Update with your verified domain email or use Resend's default
FROM_EMAIL=LegalDoc Filler <noreply@yourdomain.com>
```

**For development/testing (without domain verification):**
```bash
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev  # Resend's default test email
```

### 5. Install Dependencies

The `resend` package is already in `requirements.txt`. Install it:

```bash
pip install -r requirements.txt
```

## How It Works

1. User completes all fields in a document
2. User enters their email address on the completion page
3. Backend:
   - Gets the completed document from storage (or generates it)
   - Creates an email with the document as an attachment
   - Sends it via Resend
4. User receives email with the completed document attached

## Testing

### Local Testing

1. Set `RESEND_API_KEY` in your `.env` file
2. Set `FROM_EMAIL` (can use `onboarding@resend.dev` for testing)
3. Start your backend: `python main.py`
4. Complete a document
5. Use the email endpoint: `POST /api/documents/{id}/email`

### Test Email Endpoint

```bash
curl -X POST http://localhost:8000/api/documents/{document_id}/email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## Troubleshooting

### "Email service is not configured"

- Make sure `RESEND_API_KEY` is set in environment variables
- Check that the API key is correct (starts with `re_`)
- Restart your server after setting environment variables

### "Invalid from address"

- If using a custom domain, make sure it's verified in Resend
- For testing, use `onboarding@resend.dev`
- Check `FROM_EMAIL` format: `"Name <email@domain.com>"`

### Email Not Received

- Check Resend dashboard for delivery status: https://resend.com/emails
- Check spam folder
- Verify recipient email address is correct
- Check Resend logs for errors

### API Key Errors

- Verify your API key is correct
- Check if API key has expired or been revoked
- Make sure you copied the full key (no spaces)

## Resend Free Tier Limits

- **100 emails per day** (free tier)
- **3,000 emails per month** (free tier)
- After free tier: $20/month for 50,000 emails

Check your usage at: https://resend.com/dashboard

## Production Considerations

1. **Domain Verification**: Use your own verified domain for better deliverability
2. **Rate Limiting**: Consider implementing rate limiting to prevent abuse
3. **Error Handling**: Monitor email failures and retry logic
4. **Logging**: Log email events for debugging
5. **Bounce Handling**: Set up webhooks for bounce/complaint handling (future enhancement)

## Email Template

The email includes:
- Professional HTML template
- Document filename
- Clear instructions
- Document attached as `.docx` file

You can customize the email template in `services/email_service.py`.

## Security Notes

- Never commit `RESEND_API_KEY` to version control
- Use environment variables for all secrets
- Rotate API keys periodically
- Monitor email usage for suspicious activity

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Resend Status: https://status.resend.com

