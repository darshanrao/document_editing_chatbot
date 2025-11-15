# LegalDoc Filler - Backend

FastAPI backend for the LegalDoc Filler application.

## Status

🚧 **Under Development** - Backend implementation is planned but not yet started.

## Planned Tech Stack

- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **AI**: OpenAI API / Anthropic Claude API
- **Document Parsing**: python-docx
- **Authentication**: Supabase Auth

## Planned Features

### Core Functionality
- Document upload and parsing
- Placeholder identification using AI
- Conversational AI for field filling
- Document generation with filled values
- Email delivery

### API Endpoints (Planned)

```
POST   /api/v1/upload              # Upload document
GET    /api/v1/documents/{id}      # Get document details
GET    /api/v1/documents/{id}/status   # Processing status
GET    /api/v1/documents/{id}/fields   # Get all fields
POST   /api/v1/documents/{id}/fields   # Update field value
GET    /api/v1/documents/{id}/preview  # Get preview
GET    /api/v1/documents/{id}/download # Download filled document
POST   /api/v1/documents/{id}/email    # Email document
GET    /api/v1/chat/{id}/next          # Get next AI question
```

## Setup (Coming Soon)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

## Environment Variables (Planned)

```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_KEY=...

# AI Service
OPENAI_API_KEY=...
# or
ANTHROPIC_API_KEY=...

# Email
SENDGRID_API_KEY=...

# CORS
FRONTEND_URL=http://localhost:3000
```

## Project Structure (Planned)

```
backend/
├── app/
│   ├── main.py           # FastAPI app
│   ├── api/              # API routes
│   │   ├── v1/
│   │   │   ├── upload.py
│   │   │   ├── documents.py
│   │   │   └── chat.py
│   ├── core/             # Core functionality
│   │   ├── config.py
│   │   ├── security.py
│   │   └── ai.py
│   ├── models/           # Database models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   │   ├── document_parser.py
│   │   ├── ai_service.py
│   │   └── storage.py
│   └── db/               # Database config
├── tests/
├── alembic/              # DB migrations
├── requirements.txt
└── README.md
```

## Contributing

Backend implementation is coming soon. Check the main README for project status.
