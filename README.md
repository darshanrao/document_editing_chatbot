# LegalDoc Filler

AI-powered legal document assistant that helps users fill legal document templates conversationally.

## Project Structure

```
document_editing_chatbot/
├── frontend/           # Next.js frontend application
├── backend/            # FastAPI backend (to be implemented)
├── legal-doc-wireframe.html  # Original design wireframe
└── README.md          # This file
```

## Architecture

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### Backend (Planned)
- **Framework**: FastAPI
- **Language**: Python
- **Database**: To be determined (PostgreSQL/Supabase)
- **Storage**: Supabase (for documents)
- **AI**: OpenAI/Anthropic API

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Backend

(To be implemented)

```bash
cd backend
# Setup instructions coming soon
```

## Features

- 📄 Document upload (.docx files)
- 💬 Conversational AI-guided filling
- 🔄 Real-time document preview
- 📊 Progress tracking
- 📋 Field list management
- ⬇️ Document download
- 📧 Email delivery

## Current Status

✅ **Frontend**: Complete with mock backend
⏳ **Backend**: Not yet implemented
⏳ **Database**: Not yet implemented
⏳ **AI Integration**: Not yet implemented

## Development Workflow

1. **Frontend Development**: All UI/UX work is done in `frontend/`
2. **Backend Development**: API and business logic will be in `backend/`
3. **Integration**: Frontend calls backend API endpoints (CORS configured)

## Next Steps

- [ ] Implement FastAPI backend
- [ ] Add document parsing (.docx)
- [ ] Integrate AI service (OpenAI/Claude)
- [ ] Set up Supabase for storage
- [ ] Add authentication
- [ ] Deploy backend
- [ ] Connect frontend to real backend

## Documentation

- Frontend README: [frontend/README.md](frontend/README.md)
- Backend README: (coming soon)
- API Documentation: (coming soon)

## License

MIT
