# LegalDoc Filler

An AI-powered conversational interface for filling legal document templates. Upload a .docx template with placeholders, and our chatbot will guide you through filling each field conversationally.

## Features

- **Smart placeholder detection** – Gemini analyses the uploaded `.docx` and finds placeholders.
- **Conversational field collection** – tailored prompts per field, with retry guidance when validation fails.
- **Real-time preview** – live document view with placeholders highlighted.
- **Type-aware validation** – email, phone, dates, currency, numbers, addresses, names.
- **Progress tracking** – completion bar plus field list status.
- **Dual views** – switch between chat mode and structured field list.
- **One-click download** – generate and download the completed Word document.

## Architecture

This project consists of two main components:

### Frontend (Next.js 15)
- **Location**: `frontend/`
- **Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- **Deployed**: Vercel
- **Live URL**: https://frontend-l9xnafpy5-darshan-raos-projects.vercel.app

### Backend (FastAPI)
- **Location**: `backend/`
- **Tech Stack**: FastAPI, Python 3.12, Google Gemini 2.5 (Pro + Flash-Lite), Supabase
- **Services**: Document processing, AI placeholder extraction, conversational filling
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

## Quick Start

### Prerequisites

- Node.js 18+ (frontend)
- Python 3.12 (backend)
- Supabase project (database + storage buckets)
- Google Gemini API key

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Populate .env with SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY, ALLOWED_ORIGINS
python main.py
```

API available at `http://localhost:8000`

## Project Structure

```
document_editing_chatbot/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities and mock data
│   │   └── types/          # TypeScript definitions
│   ├── public/
│   └── package.json
├── backend/                 # FastAPI backend application
│   ├── routers/            # API endpoints
│   ├── services/           # Business logic (Gemini, Document processing)
│   ├── models/             # Pydantic schemas
│   ├── utils/              # Database utilities
│   ├── main.py             # FastAPI app
│   └── requirements.txt
└── README.md               # This file
```

## Workflow

1. **Upload**: User uploads a .docx document with placeholders (e.g., `[COMPANY_NAME]`, `[DATE]`)
2. **Process**: Backend extracts text and uses Gemini AI to identify all placeholders
3. **Fill**: Chatbot asks conversational questions for each field
4. **Preview**: Real-time preview shows document with filled values
5. **Download**: User downloads completed document

## Tech Stack Details

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI
- **AI**: Google Gemini Pro
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Document Processing**: python-docx

## API Endpoints

See `backend/README.md` for detailed API documentation.

Key endpoints:
- `POST /api/upload` - Upload document
- `GET /api/documents/{id}/fields` - Get all fields
- `POST /api/documents/{id}/fields` - Submit field value
- `GET /api/chat/{id}/next` - Get next question
- `GET /api/documents/{id}/download` - Download completed document

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_MAX_FILE_SIZE_MB=10
```

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend Options
- **Railway**: `railway up`
- **Render**: Connect repo and deploy
- **Fly.io**: `flyctl deploy`

See `backend/README.md` for detailed deployment instructions.

## Development

### Run Both Services

Terminal 1 (Frontend):
```bash
cd frontend && npm run dev
```

Terminal 2 (Backend):
```bash
cd backend && python main.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
