# LegalDoc Filler - AI-Powered Legal Document Assistant

A Next.js application that helps users fill legal document templates conversationally using AI guidance.

## Features

- 📄 **Document Upload**: Upload .docx files with placeholders
- 💬 **Conversational Interface**: AI-guided conversation to fill placeholders
- 🔄 **Live Preview**: Real-time document preview with highlighted fields
- 📊 **Progress Tracking**: Visual progress bar showing completion status
- 📋 **Field List View**: Alternative view to see and edit all fields at once
- ⬇️ **Download**: Download completed documents
- 📧 **Email**: Send completed documents via email

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context (ready to integrate)
- **Backend**: Next.js API Routes (currently mock data)

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── upload/       # File upload endpoint
│   │   ├── documents/    # Document operations
│   │   └── chat/         # Chat/AI endpoints
│   ├── fill/[id]/        # Main filling interface
│   ├── process/[id]/     # Processing screen
│   ├── complete/[id]/    # Completion screen
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ChatPanel.tsx
│   ├── DocumentPreview.tsx
│   ├── FieldListView.tsx
│   ├── FileUpload.tsx
│   └── ProgressBar.tsx
├── lib/                  # Utilities
│   └── mockDb.ts         # Mock database (replace with real DB)
├── types/                # TypeScript types
│   └── index.ts
└── hooks/                # Custom React hooks (future)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
cd document_editing_chatbot
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## User Flow

1. **Landing Page**: Upload a .docx document with placeholders (e.g., `[CLIENT_NAME]`, `[DATE]`)
2. **Processing**: System extracts text and identifies placeholders
3. **Conversational Filling**:
   - AI asks questions one by one
   - User provides answers via chat
   - Live preview updates in real-time
   - Toggle between Chat and Field List views
4. **Completion**: Download or email the filled document

## API Endpoints

### Upload
- `POST /api/upload` - Upload document file

### Document Operations
- `GET /api/documents/[id]/status` - Get processing status
- `GET /api/documents/[id]/fields` - Get all document fields
- `POST /api/documents/[id]/fields` - Submit field value
- `GET /api/documents/[id]/preview` - Get document preview
- `GET /api/documents/[id]/summary` - Get completion summary
- `GET /api/documents/[id]/download` - Download completed document
- `POST /api/documents/[id]/email` - Email completed document

### Chat
- `GET /api/chat/[id]/next` - Get next AI question

## Mock vs Real Backend

Currently, the app uses **mock data** stored in memory (`src/lib/mockDb.ts`).

### To integrate a real backend:

1. Replace `mockDb.ts` functions with actual API calls
2. Implement real document parsing (use libraries like `mammoth` or `docx`)
3. Integrate AI service (OpenAI, Anthropic, etc.) for intelligent question generation
4. Set up database (PostgreSQL, MongoDB, etc.)
5. Implement file storage (S3, etc.)
6. Add authentication if needed

## Design Tokens

- **Primary Purple**: `#a78bfa`
- **Pending Yellow**: `#fbbf24` (background: `#fef3c7`)
- **Success Green**: `#10b981` (background: `#d1fae5`)
- **Dark Background**: `#1a1d23`
- **Dark Panel**: `#2a2e35`
- **Dark Border**: `#3a3f47`

## Deployment

See the comprehensive [Deployment Guide](../DEPLOYMENT.md) for detailed instructions.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
vercel --prod
```

**Or use the Vercel Dashboard:**
1. Import your GitHub repository
2. Set Root Directory to `frontend`
3. Deploy

### Local Production Build

```bash
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to test production build.

## Next Steps / Roadmap

- [ ] Integrate real document parsing (.docx)
- [ ] Add AI service integration (GPT-4, Claude, etc.)
- [ ] Implement database persistence
- [ ] Add user authentication
- [ ] Support multiple document formats (PDF, etc.)
- [ ] Add document templates library
- [ ] Implement collaborative editing
- [ ] Add export to multiple formats
- [ ] Mobile app version

## Environment Variables (Future)

Create a `.env.local` file:

```env
# AI Service
OPENAI_API_KEY=your_key_here
# or
ANTHROPIC_API_KEY=your_key_here

# Database
DATABASE_URL=your_db_url

# File Storage
AWS_S3_BUCKET=your_bucket
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Email Service
SENDGRID_API_KEY=your_key
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
