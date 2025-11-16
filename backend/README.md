# LegalDoc Filler - Backend

FastAPI backend for the LegalDoc Filler application. This service processes legal documents, extracts placeholders using Google Gemini AI, and provides a conversational interface for filling them in.

## Features

- **Document Processing**: Upload and extract text from .docx files
- **AI-Powered Placeholder Detection**: Uses Google Gemini to identify and categorize placeholders
- **Conversational Filling**: Generates natural questions for each field
- **Real-time Preview**: Live document preview with filled values
- **Supabase Integration**: PostgreSQL database and file storage
- **Type Validation**: Validates field values based on type (email, phone, date, etc.)

## Prerequisites

- Python 3.9+
- Supabase account (with PostgreSQL database and Storage buckets)
- Google Gemini API key

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Supabase

1. Create a new Supabase project at https://supabase.com
2. Run the SQL in `database_init.sql` in your Supabase SQL Editor to create tables
3. Create two storage buckets in Supabase Storage:
   - `original-documents` (private)
   - `completed-documents` (private)

### 3. Get Google Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the API key

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

## Running the Server

### Development

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Deployment

See main README.md for deployment instructions.
